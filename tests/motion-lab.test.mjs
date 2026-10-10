import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { inflateSync } from "node:zlib";
import { chromium } from "playwright";
import { createPreviewServer } from "../scripts/preview.mjs";

const techniques = ["css", "stroke", "svg", "mask", "depth", "sprite", "video", "vector"];
let browser;
let server;
let deckUrl;

before(async () => {
  if (process.env.MOTION_DECK_URL) deckUrl = process.env.MOTION_DECK_URL;
  else {
    assert.ok(existsSync("build/motion-lab.html"), "Run npm run build first.");
    server = createPreviewServer();
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    deckUrl = `http://127.0.0.1:${server.address().port}/marp-demo/motion-lab.html`;
  }
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function waitForSlide(page, slide) {
  await page.waitForFunction((id) =>
    document.querySelector(`section[id="${id}"]`).closest("svg").classList.contains("bespoke-marp-active"), slide);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition")
    && window.motionTransitions.finished === window.motionTransitions.started);
}

async function openDeck(t, { slide = 1, motion = "no-preference", javaScriptEnabled = true, view, noTransitions = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: motion, javaScriptEnabled });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.route(/^https?:\/\//, (route) => {
    if (new URL(route.request().url()).origin === new URL(deckUrl).origin) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  t.after(() => {
    assert.deepEqual(errors, [], "Motion Lab must not emit browser, HTTP, or player errors.");
    assert.deepEqual(external, [], "All artwork, media, and player assets must be local.");
  });
  await page.addInitScript((disabled) => {
    window.motionTransitions = { started: 0, ready: 0, finished: 0, errors: [] };
    if (disabled) document.startViewTransition = undefined;
    else {
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        window.motionTransitions.started += 1;
        transition.ready.then(() => { window.motionTransitions.ready += 1; })
          .catch((error) => window.motionTransitions.errors.push(error.message));
        transition.finished.then(() => { window.motionTransitions.finished += 1; });
        return transition;
      };
    }
  }, noTransitions);
  const url = new URL(deckUrl);
  url.hash = String(slide);
  if (view) url.searchParams.set("view", view);
  await page.goto(url.href);
  if (javaScriptEnabled) {
    await page.waitForFunction(() => document.body.hasAttribute("data-bespoke-view"));
    if (!view) await waitForSlide(page, slide);
  }
  return page;
}

async function waitForState(root, state) {
  await root.page().waitForFunction(({ technique, state }) =>
    document.querySelector(`[data-motion-technique="${technique}"]`).dataset.motionState === state,
  { technique: await root.getAttribute("data-motion-technique"), state }, { timeout: 12000 });
}

async function readMotion(root) {
  return root.evaluate((element) => {
    const style = (selector, property) => getComputedStyle(element.querySelector(selector)).getPropertyValue(property);
    switch (element.dataset.motionTechnique) {
      case "css": return [...element.querySelectorAll(".ml-node")].map((node) => getComputedStyle(node).transform);
      case "stroke": return style(".ml-drawn-route", "stroke-dashoffset");
      case "svg": {
        const matrix = element.querySelector(".ml-packet").getCTM();
        return [matrix.e, matrix.f];
      }
      case "mask": return style(".ml-mask-ink", "mask-position");
      case "depth": return [style(".ml-plane", "transform"), style(".ml-node-b", "transform")];
      case "sprite": return style(".ml-sprite", "background-position");
      case "video": {
        const canvas = document.createElement("canvas");
        canvas.width = 680;
        canvas.height = 300;
        const context = canvas.getContext("2d");
        context.drawImage(element.querySelector("video"), 0, 0, 680, 300);
        return context.getImageData(0, 0, 680, 300).data.reduce((hash, value) => (Math.imul(hash, 31) + value) | 0, 0);
      }
      case "vector": return [...element.querySelectorAll(".ml-lottie g[transform], .ml-lottie path[d]")]
        .map((node) => [node.getAttribute("transform"), node.getAttribute("d")]);
      default: throw new Error("Unknown motion specimen.");
    }
  });
}

async function waitForVideo(root) {
  if (await root.locator("video").count()) {
    await root.page().waitForFunction(() => {
      const video = document.querySelector(".ml-film");
      return video.readyState >= 2 && video.currentTime > 0.1;
    });
  }
}

async function blurAndNavigate(page, key, slide) {
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press(key);
  await waitForSlide(page, slide);
}

function pdfPageCount(bytes) {
  const source = bytes.toString("latin1");
  let dictionaries = source;
  for (const match of source.matchAll(/<<(.*?)>>\s*stream\r?\n/gs)) {
    if (!/\/Type\s*\/ObjStm\b/.test(match[1])) continue;
    assert.match(match[1], /\/Filter\s*\/FlateDecode\b/, "Expected Chromium's compressed PDF object dictionaries.");
    const length = Number(match[1].match(/\/Length\s+(\d+)/)?.[1]);
    assert.ok(length > 0);
    const start = match.index + match[0].length;
    dictionaries += inflateSync(bytes.subarray(start, start + length)).toString("latin1");
  }
  return (dictionaries.match(/\/Type\s*\/Page\b/g) || []).length;
}

test("the source preserves nine technique families, required directives, and original assets", () => {
  const source = readFileSync("slides/Motion-Lab.md", "utf8");
  for (const directive of ["marp: true", "theme: custom-default", "paginate: true", "math: mathjax"]) assert.ok(source.includes(directive));
  assert.equal((source.match(/data-motion-technique=/g) || []).length, 8);
  assert.equal((source.match(/data-ml-morph=/g) || []).length, 6);
  assert.ok(source.includes('begin="indefinite"'));
  assert.ok(source.includes('repeatCount="1"'));
  const runtime = readFileSync("slides/assets/motion-lab.js", "utf8");
  assert.doesNotMatch(runtime, /requestAnimationFrame|setInterval/);
  assert.match(runtime, /pauseAnimations/);
  const sprite = readFileSync("slides/assets/motion-lab/sprite.png");
  assert.equal(sprite.readUInt32BE(16), 680 * 12);
  assert.equal(sprite.readUInt32BE(20), 300);
  const video = readFileSync("slides/assets/motion-lab/specimen.webm");
  assert.equal(video.subarray(0, 4).toString("hex"), "1a45dfa3");
  assert.ok(video.length > 20_000);
  const vector = JSON.parse(readFileSync("slides/assets/motion-lab/specimen.lottie.json", "utf8"));
  assert.deepEqual(vector.assets, [], "The original composition must not pull external artwork.");
  assert.equal(vector.layers.filter((layer) => layer.nm.startsWith("Node ")).length, 3);
  assert.equal(vector.op / vector.fr, 4);
});

test("all twelve exported slides fit, preserve the motif, and load their static images", async (t) => {
  const page = await openDeck(t, { motion: "reduce" });
  assert.equal(await page.locator("section.ml").count(), 12);
  for (let slide = 1; slide <= 12; slide += 1) {
    if (slide > 1) await blurAndNavigate(page, "ArrowRight", slide);
    const section = page.locator(`section[id="${slide}"]`);
    const layout = await section.evaluate((element) => {
      const boundary = element.getBoundingClientRect();
      const outside = [...element.querySelectorAll("h1, h2, h3, p, pre, .ml-demo, .ml-mechanism, .ml-node")].filter((child) => {
        const box = child.getBoundingClientRect();
        return box.width && box.height && (box.left < boundary.left - 2 || box.top < boundary.top - 2
          || box.right > boundary.right + 2 || box.bottom > boundary.bottom + 2);
      }).map((child) => child.className || child.tagName);
      return { width: element.clientWidth, height: element.clientHeight,
        overflow: [element.scrollWidth - element.clientWidth, element.scrollHeight - element.clientHeight], outside };
    });
    assert.equal(layout.width, 1280);
    assert.equal(layout.height, 720);
    assert.ok(layout.overflow.every((pixels) => pixels <= 2), `Slide ${slide}: ${JSON.stringify(layout)}`);
    assert.deepEqual(layout.outside, [], `Slide ${slide} has content outside its presentation frame.`);
    if (slide >= 7 && slide <= 9) {
      assert.deepEqual(await section.locator("img.ml-media-still").evaluate((image) =>
        [image.complete, image.naturalWidth, image.naturalHeight]), [true, 680, 300]);
    } else {
      assert.deepEqual(await section.locator(".ml-node > b").allTextContents(), ["A", "B", "C"]);
    }
  }
});

for (const [index, technique] of techniques.entries()) {
  test(`${technique}: visible motion, pause/resume, finite completion, replay, and hidden clocks`, async (t) => {
    const slide = index + 2;
    const page = await openDeck(t, { slide });
    const root = page.locator(`[data-motion-technique="${technique}"]`);
    const toggle = root.locator('[data-motion-action="toggle"]');
    assert.equal(await root.getAttribute("data-motion-state"), "idle", "Do not autoplay.");
    assert.equal(await root.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
    await toggle.click();
    await waitForState(root, "running");
    await waitForVideo(root);
    await page.waitForTimeout(technique === "mask" ? 800 : 150);
    const first = await readMotion(root);
    const image = await root.screenshot();
    await page.waitForTimeout(450);
    assert.notDeepEqual(await readMotion(root), first, "The actual rendered mechanism must advance.");
    assert.notDeepEqual(await root.screenshot(), image, "The rendered pixels must change, not just a class or counter.");
    await toggle.click();
    await waitForState(root, "paused");
    await page.waitForTimeout(150);
    const paused = await readMotion(root);
    await page.waitForTimeout(400);
    assert.deepEqual(await readMotion(root), paused, "Pause must freeze the real CSS, SVG, video or player clock.");
    await toggle.click();
    await waitForState(root, "complete");
    const complete = await readMotion(root);
    await page.waitForTimeout(250);
    assert.deepEqual(await readMotion(root), complete, "Each experiment must finish without looping.");
    await root.locator('[data-motion-action="replay"]').click();
    await waitForState(root, "running");
    await waitForVideo(root);
    await page.waitForTimeout(220);
    assert.notDeepEqual(await readMotion(root), complete, "Replay must restart the mechanism.");

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await waitForState(root, "paused");
    await page.waitForTimeout(150);
    const hidden = await readMotion(root);
    await page.waitForTimeout(250);
    assert.deepEqual(await readMotion(root), hidden, "A hidden tab must not keep animating.");
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    assert.equal(await root.getAttribute("data-motion-state"), "paused", "Returning must not resume without the presenter.");
    await toggle.click();
    await blurAndNavigate(page, "ArrowRight", slide + 1);
    await waitForState(root, "paused");
    const clocks = () => root.evaluate((element) => element.getAnimations({ subtree: true })
      .map((animation) => ({ time: animation.currentTime, state: animation.playState, pending: animation.pending })));
    const stoppedClocks = await clocks();
    assert.ok(stoppedClocks.every((clock) => clock.state === "paused" && !clock.pending),
      "Hidden CSS clocks must be held immediately, not waiting for another paint.");
    await readMotion(root);
    await page.waitForTimeout(150);
    const suspended = await readMotion(root);
    await page.waitForTimeout(250);
    assert.deepEqual(await readMotion(root), suspended, "Leaving a slide must suspend its clock.");
    assert.deepEqual(await clocks(), stoppedClocks, "Hidden native CSS timeline values must not advance.");
    await blurAndNavigate(page, "ArrowLeft", slide);
    assert.equal(await root.getAttribute("data-motion-state"), "paused");

    await toggle.click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitForState(root, "idle");
    assert.equal(await root.locator(".ml-controls").isVisible(), false);
    assert.equal(await root.locator(".ml-still").isVisible(), true);
    assert.equal(await root.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
    assert.equal(await root.locator(".ml-media-live:visible, .ml-packet:visible").count(), 0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    assert.equal(await root.getAttribute("data-motion-state"), "idle");
    await toggle.click();
    await waitForVideo(root);
    await page.waitForTimeout(250);
    await page.emulateMedia({ media: "print" });
    await waitForState(root, "idle");
    assert.equal(await root.locator(".ml-controls").isVisible(), false);
    assert.equal(await root.locator(".ml-still").isVisible(), true);
    assert.equal(await root.locator(".ml-media-live:visible, .ml-packet:visible").count(), 0);
    assert.equal(await root.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
    if (technique === "video") assert.equal(await root.locator("video").evaluate((video) => video.paused), true);
    if (technique === "vector") assert.equal(await page.evaluate(() => window.lottie.getRegisteredAnimations()[0].isPaused), true);
  });
}

test("resuming late choreography never replays a node whose gesture already finished", async (t) => {
  const page = await openDeck(t, { slide: 2 });
  const root = page.locator('[data-motion-technique="css"]');
  const toggle = root.locator('[data-motion-action="toggle"]');
  await toggle.click();
  await root.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) animation.currentTime = 2400;
    element.querySelector('[data-motion-action="toggle"]').click();
  });
  await waitForState(root, "paused");
  const firstNode = root.locator(".ml-node-a");
  const finished = await firstNode.evaluate((node) => getComputedStyle(node).transform);
  await toggle.click();
  await page.waitForTimeout(300);
  assert.equal(await firstNode.evaluate((node) => getComputedStyle(node).transform), finished);
  assert.ok(await firstNode.evaluate((node) => node.getAnimations()[0].currentTime >= 2000));
  await waitForState(root, "complete");
});

test("the sprite uses discrete cells rather than interpolating a background slide", async (t) => {
  const page = await openDeck(t, { slide: 7 });
  const root = page.locator('[data-motion-technique="sprite"]');
  await root.locator('[data-motion-action="toggle"]').click();
  const result = await root.locator(".ml-sprite").evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    const positions = [0, 100, 200, 400, 500, 800, 1600, 3999, 4000].map((time) => {
      animation.currentTime = time;
      return parseFloat(getComputedStyle(element).backgroundPositionX);
    });
    return { easing: animation.effect.getKeyframes()[0].easing, positions };
  });
  assert.equal(result.easing, "steps(11)");
  assert.equal(result.positions[0], result.positions[1]);
  assert.equal(result.positions[1], result.positions[2]);
  assert.ok(result.positions.every((position) => Math.abs(position % 680) < 0.01));
  assert.equal(result.positions.at(-1), -7480);
});

test("named shared elements really move and resize forward and backward", async (t) => {
  const page = await openDeck(t, { slide: 10 });
  const shape = (slide) => page.locator(`section[id="${slide}"] [data-ml-morph="b"]`);
  const before = await shape(10).boundingBox();
  assert.deepEqual(await page.locator('section[id="10"] [data-ml-morph]').evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).viewTransitionName)), ["ml-start", "ml-shape", "ml-land"]);
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => window.motionTransitions.ready > 0 && document.documentElement.matches(":active-view-transition"));
  const geometry = () => page.evaluate(() => {
    const style = getComputedStyle(document.documentElement, "::view-transition-group(ml-shape)");
    return { name: style.animationName, width: style.width, transform: style.transform };
  });
  const first = await geometry();
  assert.notEqual(first.name, "none");
  await page.waitForTimeout(180);
  assert.notDeepEqual(await geometry(), first, "This must interpolate named geometry, not only fade entire slides.");
  await waitForSlide(page, 11);
  const after = await shape(11).boundingBox();
  assert.equal(Math.round(after.width), 208);
  assert.equal(Math.round(after.height), 156);
  assert.ok(after.y > before.y + 50 && after.x < before.x - 40);
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 10);
  assert.deepEqual(await shape(10).boundingBox(), before);
  const transitions = await page.evaluate(() => window.motionTransitions);
  assert.equal(transitions.ready, transitions.started);
  assert.deepEqual(transitions.errors, []);
  assert.equal(await page.locator('section[id="10"]').evaluate((section) => section.getAnimations({ subtree: true }).length), 0);
});

for (const [slide, name] of [[1, "cover"], [5, "ml-aperture"], [9, "slide"]]) {
  test(`the ${name} slide boundary runs its actual transition keyframes`, async (t) => {
    const page = await openDeck(t, { slide });
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => window.motionTransitions.ready > 0 && document.documentElement.matches(":active-view-transition"));
    const animations = await page.evaluate(() => document.getAnimations().map((animation) => animation.animationName));
    assert.ok(animations.some((animation) => animation?.includes(name)), `Expected ${name}, got ${animations}`);
    await waitForSlide(page, slide + 1);
    assert.deepEqual(await page.evaluate(() => window.motionTransitions.errors), []);
  });
}

test("keyboard playback keeps focus without hijacking deck navigation", async (t) => {
  const page = await openDeck(t, { slide: 2 });
  const root = page.locator('[data-motion-technique="css"]');
  const toggle = root.locator('[data-motion-action="toggle"]');
  await toggle.focus();
  await page.keyboard.press("Space");
  await waitForState(root, "running");
  await page.keyboard.press("Enter");
  await waitForState(root, "paused");
  assert.equal(new URL(page.url()).hash, "#2");
  const focus = await toggle.evaluate((button) => getComputedStyle(button).outlineWidth);
  assert.ok(parseFloat(focus) >= 3);
  await page.keyboard.press("Tab");
  assert.equal(await root.locator('[data-motion-action="replay"]').evaluate((button) => button === document.activeElement), true);
  await page.keyboard.press("Enter");
  await waitForState(root, "running");
  await blurAndNavigate(page, "ArrowRight", 3);
  await waitForState(root, "paused");
});

test("print mid-animation restores complete authored stills on all twelve pages", async (t) => {
  const page = await openDeck(t, { slide: 5 });
  const root = page.locator('[data-motion-technique="mask"]');
  await root.locator('[data-motion-action="toggle"]').click();
  await page.waitForTimeout(300);
  await page.emulateMedia({ media: "print" });
  for (const technique of techniques) {
    const experiment = page.locator(`[data-motion-technique="${technique}"]`);
    assert.equal(await experiment.locator(".ml-still").isVisible(), true);
    assert.equal(await experiment.locator(".ml-controls").isVisible(), false);
    assert.equal(await experiment.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
  }
  assert.equal(await page.locator("section.ml:visible").count(), 12);
  assert.equal(await root.locator(".ml-mask-ink").evaluate((element) => getComputedStyle(element).maskImage), "none");
  assert.equal(await page.locator(".ml-drawn-route").evaluate((element) => getComputedStyle(element).strokeDashoffset), "0px");
  assert.equal(await page.locator(".ml-plane").evaluate((element) => getComputedStyle(element).transform), "none");
  assert.equal(await page.locator(".ml-media-still:visible").count(), 3);
  assert.equal(await page.locator(".ml-media-live:visible, .ml-packet:visible").count(), 0);
  const response = await page.request.get(new URL("Motion-Lab.pdf", deckUrl).href);
  assert.equal(response.status(), 200);
  const bytes = await response.body();
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.equal(pdfPageCount(bytes), 12);
});

test("no-JS and presenter views are static and transition-less browsers still navigate", async (t) => {
  const staticPage = await openDeck(t, { javaScriptEnabled: false });
  assert.equal(await staticPage.locator("section.ml:visible").count(), 12);
  assert.equal(await staticPage.locator(".ml-media-still:visible").count(), 3);
  assert.equal(await staticPage.locator(".ml-controls:visible, .ml-media-live:visible, .ml-packet:visible").count(), 0);
  assert.equal(await staticPage.evaluate(() => document.getAnimations().length), 0);
  const presenter = await openDeck(t, { slide: 9, view: "presenter" });
  await presenter.waitForFunction(() => document.body.getAttribute("data-bespoke-view") === "presenter");
  assert.equal(await presenter.locator(".ml-controls:visible, .ml-media-live:visible, .ml-packet:visible").count(), 0);
  assert.equal(await presenter.locator('script[src$="lottie.min.js"]').count(), 0, "Presenter previews must not start a vector player.");
  const fallback = await openDeck(t, { slide: 10, noTransitions: true });
  await fallback.keyboard.press("ArrowRight");
  await waitForSlide(fallback, 11);
  assert.equal(await fallback.locator('section[id="11"] .ml-node-b').evaluate((element) => element.offsetWidth), 208);
});

test("missing vector data is visibly reported rather than pretending the still is playback", async (t) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("**/specimen.lottie.json", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto(`${deckUrl}#9`);
  const root = page.locator('[data-motion-technique="vector"]');
  await waitForState(root, "error");
  assert.match(await root.locator("[data-motion-status]").innerText(), /Could not load/);
  assert.equal(await root.locator('[data-motion-action="toggle"]').isDisabled(), true);
  assert.equal(await root.locator(".ml-media-still").isVisible(), true);
  assert.ok(errors.some((message) => message.includes("Lottie data returned HTTP 503")));
});
