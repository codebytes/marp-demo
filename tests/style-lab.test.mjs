import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { inflateSync } from "node:zlib";
import { chromium } from "playwright";
import { createPreviewServer } from "../scripts/preview.mjs";

const styles = ["house", "riso", "swiss", "brutal", "sketch", "blueprint", "editorial", "beamer"];
const titleFonts = { riso: /bricolage/i, swiss: /archivo/i, brutal: /dela gothic/i, sketch: /kalam/i, blueprint: /barlow/i, editorial: /old standard/i, beamer: /cmu sans/i };
const transitions = ["fade", "fade", "star", "wipe", "drop", "flip", "clockwise", "cover", "push", "fade", "fade", "fade", "fade"];
const liveSlide = 11;
let browser;
let server;
let deckUrl;

before(async () => {
  if (process.env.STYLE_DECK_URL) deckUrl = process.env.STYLE_DECK_URL;
  else {
    assert.ok(existsSync("build/style-lab.html"), "Run npm run build first.");
    server = createPreviewServer();
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    deckUrl = `http://127.0.0.1:${server.address().port}/marp-demo/style-lab.html`;
  }
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function waitForSlide(page, slide) {
  await page.waitForFunction((id) => document.querySelector(`section[id="${id}"]`).closest("svg").classList.contains("bespoke-marp-active"), slide);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
}

async function openDeck(t, { slide = 1, motion = "reduce", javaScriptEnabled = true, view } = {}) {
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
    assert.deepEqual(errors, [], "Style Lab must not emit browser or HTTP errors.");
    assert.deepEqual(external, [], "Fonts, textures, and scripts must all be local.");
  });
  await page.addInitScript(() => {
    window.styleMorphs = { started: 0, finished: 0, errors: [] };
    if (!document.startViewTransition) return;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const transition = start(...args);
      window.styleMorphs.started += 1;
      transition.finished.then(() => { window.styleMorphs.finished += 1; })
        .catch((error) => window.styleMorphs.errors.push(error.message));
      return transition;
    };
  });
  const url = new URL(deckUrl);
  url.hash = String(slide);
  if (view) url.searchParams.set("view", view);
  await page.goto(url.href);
  if (javaScriptEnabled) {
    await page.waitForFunction(() => document.body.hasAttribute("data-bespoke-view"));
    if (!view) await waitForSlide(page, slide);
  }
  await page.evaluate(() => document.fonts.ready);
  return page;
}

function contrast(foreground, background) {
  const luminance = (color) => {
    const rgb = color.match(/^rgba?\(([^)]+)\)/i);
    const channels = rgb ? rgb[1].split(/[\s,/]+/).slice(0, 3).map(Number) : color.match(/[0-9a-f]{2}/gi).map((channel) => parseInt(channel, 16));
    const [r, g, b] = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

// Runs in the page: lists entrance selectors that match nothing, and entrance delays a more specific rule overrides.
function entranceReport(section) {
  const rules = [];
  const walk = (list) => {
    for (const rule of list) {
      if (rule instanceof CSSStyleRule) {
        if (rule.selectorText.includes(".sl-active")) rules.push(rule);
      } else if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules);
  const split = (text) => {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < text.length; index += 1) {
      if (text[index] === "(") depth += 1;
      else if (text[index] === ")") depth -= 1;
      else if (text[index] === "," && depth === 0) {
        parts.push(text.slice(start, index));
        start = index + 1;
      }
    }
    return [...parts, text.slice(start)].map((part) => part.trim());
  };
  const milliseconds = (value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000);
  const dead = [];
  const ignored = [];
  for (const rule of rules) {
    for (const selector of split(rule.selectorText)) {
      const [, element, pseudo = null] = selector.match(/^(.*?)(::(?:before|after))?$/);
      if (!document.querySelector(element.replace(/\.sl-active/g, ""))) dead.push(selector);
      if (rule.style.animationName || !rule.style.animationDelay) continue;
      for (const match of section.querySelectorAll(element)) {
        const actual = getComputedStyle(match, pseudo).animationDelay;
        if (Math.abs(milliseconds(actual) - milliseconds(rule.style.animationDelay)) > 0.5) {
          ignored.push(`${selector.replace(/^.*\.sl-active /, "")} runs at ${actual}, not ${rule.style.animationDelay}`);
        }
      }
    }
  }
  return { dead, ignored };
}

// Runs in the page: the visual state of every stage part, which an entrance must leave exactly as authored.
function stillState(section) {
  const properties = ["opacity", "transform", "translate", "rotate", "scale", "clipPath", "filter"];
  return [...section.querySelectorAll(".sl-stage, .sl-stage *")].flatMap((element, index) => [null, "::before", "::after"].map((pseudo) => {
    const style = getComputedStyle(element, pseudo);
    return `${index} ${element.getAttribute("class") ?? element.tagName}${pseudo ?? ""}: ${properties.map((property) => style[property]).join(" | ")}`;
  }));
}

test("every style slide repeats one specimen and changes only the stage class", async (t) => {
  const page = await openDeck(t, { javaScriptEnabled: false });
  const stages = await page.locator(".sl-stage[data-style]").evaluateAll((nodes) => nodes.map((stage) => ({
    style: stage.dataset.style,
    classes: [...stage.classList].sort().join(" "),
    slide: stage.closest("section").id,
    specimen: stage.querySelector(".sl-specimen").outerHTML,
  })));
  assert.deepEqual(stages.map(({ style }) => style), [...styles, "house"], "Seven departures follow the house style, then the live stage.");
  assert.deepEqual(stages.map(({ slide }) => slide), ["3", "4", "5", "6", "7", "8", "9", "10", String(liveSlide)]);
  assert.deepEqual(stages.map(({ classes }) => classes), stages.map(({ style }) => ["sl-stage", `sl-${style}`].sort().join(" ")));
  assert.equal(new Set(stages.map(({ specimen }) => specimen)).size, 1, "The specimen HTML must be byte-identical on every style slide.");
  assert.equal(await page.locator("section.sl").count(), 13);
});

test("bundled fonts load, render, and give each style its own type", async (t) => {
  const page = await openDeck(t, { slide: 3 });
  const faces = await page.evaluate(() => [...document.fonts].filter((face) => face.family.replace(/["']/g, "").startsWith("SL "))
    .map((face) => `${face.family} ${face.weight} ${face.status}`));
  assert.equal(faces.length, 17);
  assert.deepEqual(faces.filter((face) => !face.endsWith("loaded")), [], "Every bundled face must load from the package.");
  const client = await page.context().newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  const signatures = new Set();
  for (const [index, style] of styles.entries()) {
    if (index > 0) {
      await page.keyboard.press("ArrowRight");
      await waitForSlide(page, index + 3);
    }
    const title = page.locator(`.sl-stage[data-style="${style}"]:not([data-live-stage]) .sl-title`);
    signatures.add(await title.evaluate((element) => {
      const stage = getComputedStyle(element.closest(".sl-stage"));
      return [stage.backgroundColor, stage.backgroundImage.slice(0, 40), getComputedStyle(element).fontFamily, getComputedStyle(element).color].join("|");
    }));
    if (!titleFonts[style]) continue;
    const { root } = await client.send("DOM.getDocument", { depth: -1 });
    const { nodeId } = await client.send("DOM.querySelector", { nodeId: root.nodeId, selector: `section[id="${index + 3}"] .sl-title` });
    const { fonts } = await client.send("CSS.getPlatformFontsForNode", { nodeId });
    assert.ok(fonts.length && fonts.every(({ familyName }) => titleFonts[style].test(familyName)),
      `${style} headline rendered with ${JSON.stringify(fonts)} instead of its bundled face.`);
  }
  assert.equal(signatures.size, styles.length, "Each style needs its own paper, type, and ink.");
});

test("every slide fits and specimen text never overflows or collides", async (t) => {
  const page = await openDeck(t);
  for (let slide = 1; slide <= 13; slide += 1) {
    if (slide > 1) {
      await page.keyboard.press("ArrowRight");
      await waitForSlide(page, slide);
    }
    const report = await page.locator(`section[id="${slide}"]`).evaluate((section) => {
      const overflow = { x: section.scrollWidth - section.clientWidth, y: section.scrollHeight - section.clientHeight };
      const stage = section.querySelector(".sl-stage[data-style]:not([data-live-stage])");
      if (!stage) return { overflow, problems: [] };
      const bounds = stage.getBoundingClientRect();
      const parts = [".sl-kicker", ".sl-title", ".sl-dek", ".sl-steps", ".sl-stat", ".sl-note", ".sl-label"]
        .map((selector) => [selector, stage.querySelector(selector)]);
      const problems = [];
      for (const [selector, element] of parts) {
        const box = element.getBoundingClientRect();
        if (box.left < bounds.left - 1 || box.top < bounds.top - 1 || box.right > bounds.right + 1 || box.bottom > bounds.bottom + 1) problems.push(`${selector} leaves the slide`);
        for (const node of [element, ...element.querySelectorAll("*")]) {
          if (node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).overflow !== "visible") problems.push(`${selector} clips text`);
        }
      }
      const allowed = new Set(["brutal .sl-kicker .sl-note"]);
      for (let a = 0; a < parts.length; a += 1) {
        for (let b = a + 1; b < parts.length; b += 1) {
          const [first, second] = [parts[a][1].getBoundingClientRect(), parts[b][1].getBoundingClientRect()];
          const overlaps = first.left < second.right - 1 && second.left < first.right - 1 && first.top < second.bottom - 1 && second.top < first.bottom - 1;
          if (overlaps && !allowed.has(`${stage.dataset.style} ${parts[a][0]} ${parts[b][0]}`)) problems.push(`${parts[a][0]} overlaps ${parts[b][0]}`);
        }
      }
      return { overflow, problems: problems.map((problem) => `${stage.dataset.style}: ${problem}`) };
    });
    assert.ok(report.overflow.x <= 2 && report.overflow.y <= 2, `Slide ${slide} overflows: ${JSON.stringify(report.overflow)}`);
    assert.deepEqual(report.problems, [], `Slide ${slide}`);
  }
});

test("text colors meet WCAG AA contrast in every style and on the gallery wall", async (t) => {
  const page = await openDeck(t);
  const tokens = await page.evaluate(() => {
    const read = (element, name) => getComputedStyle(element).getPropertyValue(name).trim();
    const wall = document.querySelector("section.sl-cover");
    return [
      { name: "wall", paper: read(wall, "--sl-wall"), ink: read(wall, "--sl-wall-ink"), muted: read(wall, "--sl-wall-muted") },
      ...[...document.querySelectorAll(".sl-stage[data-style]:not([data-live-stage])")].map((stage) => ({
        name: stage.dataset.style, paper: read(stage, "--sl-paper"), ink: read(stage, "--sl-ink"), muted: read(stage, "--sl-muted"),
        glow: read(stage, "--sl-paper-glow"), washed: getComputedStyle(stage).backgroundImage.includes("radial-gradient(ellipse"),
      })),
    ];
  });
  assert.equal(tokens.length, 9);
  for (const { name, paper, ink, muted, glow, washed } of tokens) {
    assert.ok(contrast(ink, paper) >= 7, `${name} ink ${ink} on ${paper}`);
    assert.ok(contrast(muted, paper) >= 4.5, `${name} muted ${muted} on ${paper}`);
    if (washed) assert.ok(glow, `${name} lights its paper with a gradient wash, so it must name the wash's lightest color as --sl-paper-glow.`);
    if (glow) {
      assert.ok(contrast(ink, glow) >= 4.5, `${name} ink ${ink} on its ${glow} glow`);
      assert.ok(contrast(muted, glow) >= 4.5, `${name} muted ${muted} on its ${glow} glow`);
    }
  }
});

test("riso step text clears the overprints and meets AA on its own ink", async (t) => {
  const page = await openDeck(t, { slide: 4 });
  const parts = await page.locator('section[id="4"] .sl-steps').evaluate((steps) => {
    const circles = [...steps.children].map((step) => {
      const box = step.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2, r: box.width / 2 };
    });
    const inside = (circle, [x, y]) => Math.hypot(x - circle.x, y - circle.y) <= circle.r;
    return [...steps.children].flatMap((step, index) => [...step.children].map((part) => {
      const range = document.createRange();
      range.selectNodeContents(part);
      const corners = [...range.getClientRects()].flatMap((box) => [[box.left, box.top], [box.right, box.top], [box.left, box.bottom], [box.right, box.bottom]]);
      const style = getComputedStyle(part);
      const size = parseFloat(style.fontSize);
      return {
        text: part.textContent, color: style.color, ink: getComputedStyle(step).backgroundColor,
        large: size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700),
        own: corners.every((corner) => inside(circles[index], corner)),
        overprinted: corners.some((corner) => circles.some((circle, other) => other !== index && inside(circle, corner))),
      };
    }));
  });
  assert.equal(parts.length, 6);
  for (const part of parts) {
    assert.ok(part.own && !part.overprinted, `"${part.text}" must sit on its own ink, clear of the overprint.`);
    assert.ok(contrast(part.color, part.ink) >= (part.large ? 3 : 4.5), `"${part.text}" is ${part.color} on ${part.ink}.`);
  }
  const burst = await page.locator('section[id="4"] .sl-stat > span').evaluate((caption) => {
    const stage = getComputedStyle(caption.closest(".sl-stage"));
    return { color: getComputedStyle(caption).color, inks: ["--sl-yellow", "--sl-pink"].map((name) => stage.getPropertyValue(name).trim()) };
  });
  for (const ink of burst.inks) assert.ok(contrast(burst.color, ink) >= 4.5, `The starburst caption ${burst.color} must read on its ${ink} ink and halftone dots.`);
});

test("signature entrances run in the audience view and finish in their authored state", async (t) => {
  const page = await openDeck(t, { slide: 4, motion: "no-preference" });
  assert.equal(await page.locator('section[id="4"]').evaluate((section) => section.classList.contains("sl-active")), true);
  assert.ok(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length) > 0);
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"), null, { timeout: 5000 });
  assert.equal(await page.locator('.sl-stage[data-style="riso"] .sl-title').evaluate((title) => getComputedStyle(title, "::after").transform), "matrix(1, 0, 0, 1, 7, 6)");
  await page.keyboard.press("ArrowRight");
  await waitForSlide(page, 5);
  assert.equal(await page.locator('section[id="4"]').evaluate((section) => section.classList.contains("sl-active")), false);
  assert.equal(await page.locator('section[id="5"]').evaluate((section) => section.classList.contains("sl-active")), true);

  const reduced = await openDeck(t, { slide: 4 });
  assert.equal(await reduced.locator("section.sl-active").count(), 0);
  assert.equal(await reduced.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length), 0);
});

test("entrance rules reach real parts, and every entrance delay takes effect", async (t) => {
  const page = await openDeck(t, { slide: 3, motion: "no-preference" });
  for (let slide = 3; slide <= 10; slide += 1) {
    if (slide > 3) {
      await page.keyboard.press("ArrowRight");
      await waitForSlide(page, slide);
    }
    const { dead, ignored } = await page.locator(`section[id="${slide}"]`).evaluate(entranceReport);
    assert.deepEqual(dead, [], "Every entrance selector must match a part of the deck; pseudo-elements are invalid inside :is().");
    assert.deepEqual(ignored, [], `Slide ${slide}: a more specific entrance rule overrides these delays.`);
  }
});

test("every entrance ends exactly in the authored still", async (t) => {
  const moving = await openDeck(t, { slide: 2, motion: "no-preference" });
  const still = await openDeck(t, { slide: 2 });
  for (let slide = 3; slide <= 10; slide += 1) {
    await still.keyboard.press("ArrowRight");
    await waitForSlide(still, slide);
    await moving.keyboard.press("ArrowRight");
    // Finish each entrance the moment it starts: a finished entrance leaves no animation behind to find.
    const finished = await moving.waitForFunction((id) => {
      const section = document.querySelector(`section[id="${id}"]`);
      const animations = section.classList.contains("sl-active") ? section.getAnimations({ subtree: true }) : [];
      for (const animation of animations) animation.finish();
      return animations.length;
    }, slide, { timeout: 5000 }).then((handle) => handle.jsonValue(), () => 0);
    assert.ok(finished > 0, `Slide ${slide} should play its entrance.`);
    await waitForSlide(moving, slide);
    const section = (page) => page.locator(`section[id="${slide}"]`);
    assert.deepEqual(await section(moving).evaluate(stillState), await section(still).evaluate(stillState),
      `Slide ${slide} must end in its authored still, with nothing left dimmed, clipped, or offset.`);
  }
});

test("the live restyle morphs one element tree and works from the keyboard", async (t) => {
  const page = await openDeck(t, { slide: liveSlide, motion: "no-preference" });
  const stage = page.locator("[data-live-stage]");
  await page.waitForFunction(() => document.querySelector("[data-style-lab]").dataset.enhanced === "true");
  assert.equal(await page.locator(".sl-live-controls button").count(), styles.length);
  await page.getByRole("button", { name: "Riso" }).click();
  await page.waitForFunction(() => window.styleMorphs.finished === 1);
  assert.equal(await stage.getAttribute("data-style"), "riso");
  assert.equal(await stage.evaluate((element) => element.classList.contains("sl-riso") && !element.classList.contains("sl-house")), true);
  assert.equal(await page.getByRole("button", { name: "Riso" }).getAttribute("aria-pressed"), "true");
  assert.equal(await page.getByRole("button", { name: "House" }).getAttribute("aria-pressed"), "false");
  assert.match(await page.locator("[data-style-status]").innerText(), /^Risograph zine: Two fluorescent inks/);
  assert.equal(await page.locator("[data-style-lab]").evaluate((root) => root.classList.contains("sl-morphing")), false);
  assert.equal(await stage.locator(".sl-title").evaluate((title) => getComputedStyle(title).viewTransitionName), "none",
    "Morph names exist only during a switch, so they cannot collide with Marp's slide transitions.");

  await page.getByRole("button", { name: "Swiss" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.styleMorphs.finished === 2);
  assert.equal(await stage.getAttribute("data-style"), "swiss");
  await page.keyboard.press("Space");
  await page.waitForTimeout(300);
  assert.equal(await page.locator(`section[id="${liveSlide}"]`).evaluate((section) => section.closest("svg").classList.contains("bespoke-marp-active")), true,
    "Keys that press a style button must not also change slides.");
  assert.deepEqual(await page.evaluate(() => window.styleMorphs.errors), []);
  await page.keyboard.press("ArrowRight");
  const advanced = await page.waitForFunction((id) => document.querySelector(`section[id="${id}"]`).closest("svg").classList.contains("bespoke-marp-active"), liveSlide + 1, { timeout: 3000 })
    .then(() => true, () => false);
  assert.ok(advanced, "Arrow keys and presentation clickers must still change slides from a focused style button.");

  const reduced = await openDeck(t, { slide: liveSlide });
  await reduced.getByRole("button", { name: "Beamer" }).click();
  assert.equal(await reduced.locator("[data-live-stage]").getAttribute("data-style"), "beamer");
  assert.equal(await reduced.evaluate(() => window.styleMorphs.started), 0, "Reduced motion switches styles without a morph.");
});

test("print, presenter, and no-JS views keep the authored house style without controls", async (t) => {
  const page = await openDeck(t, { slide: liveSlide });
  await page.getByRole("button", { name: "Blueprint" }).click();
  await page.emulateMedia({ media: "print" });
  await page.waitForFunction(() => document.querySelector("[data-live-stage]").dataset.style === "house");
  assert.equal(await page.locator(".sl-live-controls").isVisible(), false);
  assert.equal(await page.locator(".sl-live-still").isVisible(), true);
  assert.equal(await page.locator(".sl-stage.sl-riso").evaluate((stage) => getComputedStyle(stage, "::after").display), "none",
    "Print drops the rasterized grain to keep the PDF small.");

  const presenter = await openDeck(t, { slide: liveSlide, view: "presenter" });
  await presenter.waitForFunction(() => document.body.getAttribute("data-bespoke-view") === "presenter");
  assert.equal(await presenter.locator("[data-style-lab]").first().getAttribute("data-enhanced"), "false");
  assert.equal(await presenter.locator("section.sl-active").count(), 0);

  const static_ = await openDeck(t, { slide: liveSlide, javaScriptEnabled: false });
  assert.equal(await static_.locator(".sl-live-controls").first().getAttribute("hidden"), "");
  assert.equal(await static_.locator("[data-live-stage]").first().getAttribute("data-style"), "house");
});

test("each style slide declares its signature Marp transition", async (t) => {
  const page = await openDeck(t, { javaScriptEnabled: false });
  const declared = await page.locator("section.sl").evaluateAll((sections) => sections.map((section) => JSON.parse(section.dataset.transition).name));
  assert.deepEqual(declared, transitions);
});

test("the PDF keeps all thirteen pages within a reasonable size", { skip: Boolean(process.env.STYLE_DECK_URL) }, () => {
  const pdf = readFileSync("build/Style-Lab.pdf");
  const text = pdf.toString("latin1");
  // Chrome stores page objects in compressed object streams.
  const objects = [...text.matchAll(/stream\r?\n/g)].map(({ index, 0: marker }) => {
    const start = index + marker.length;
    try {
      return inflateSync(pdf.subarray(start, text.indexOf("endstream", start))).toString("latin1");
    } catch {
      return "";
    }
  });
  assert.equal([text, ...objects].join("\n").match(/\/Type\s*\/Page(?![a-z])/g).length, 13);
  assert.ok(pdf.length < 2_500_000, `Style-Lab.pdf is ${pdf.length} bytes; rasterized textures have crept back in.`);
});

test("every bundled font file is credited in the shipped license", () => {
  const directory = "slides/assets/style-lab/fonts";
  const license = readFileSync(`${directory}/LICENSE.md`, "utf8");
  const missing = readdirSync(directory).filter((name) => name.endsWith(".woff2") && !license.includes(name));
  assert.deepEqual(missing, []);
});
