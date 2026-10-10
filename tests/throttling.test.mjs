import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const html = process.env.THROTTLE_DECK_HTML ? resolve(process.env.THROTTLE_DECK_HTML) : resolve("build", "throttling.html");
const deckUrl = process.env.THROTTLE_DECK_URL || pathToFileURL(html).href;
const frames = [
  { time: 0, tokens: 3, admitted: 0, rejected: 0, available: ["token-1", "token-2", "token-3"], incoming: ["a", "b", "c", "d"] },
  { time: 0, tokens: 2, admitted: 1, rejected: 0, available: ["token-2", "token-3"], incoming: ["b", "c", "d"] },
  { time: 0, tokens: 0, admitted: 3, rejected: 0, available: [], incoming: ["d"] },
  { time: 0, tokens: 0, admitted: 3, rejected: 1, available: [], incoming: [] },
  { time: 1, tokens: 1, admitted: 3, rejected: 1, available: ["token-4"], incoming: ["retry"] },
  { time: 1, tokens: 0, admitted: 4, rejected: 1, available: [], incoming: [] },
  { time: 5, tokens: 3, admitted: 4, rejected: 1, available: ["token-5", "token-6", "token-7"], incoming: [] },
];
let browser;

before(async () => {
  if (!process.env.THROTTLE_DECK_URL) assert.ok(existsSync(html), "Run npm run build before testing throttling.");
  browser = await chromium.launch();
});
after(async () => {
  if (browser) await browser.close();
});

async function waitForSlide(page, slide) {
  await page.waitForFunction((id) => document.querySelector(`section[id="${id}"]`).closest("svg").classList.contains("bespoke-marp-active"), slide);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
}

async function openDeck(t, { slide = 1, motion = "reduce", javaScriptEnabled = true, transitions = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: motion, javaScriptEnabled });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(/^https?:\/\//, (route) => {
    if (new URL(route.request().url()).origin === new URL(deckUrl).origin) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  t.after(() => {
    assert.deepEqual(errors, [], "No browser errors.");
    assert.deepEqual(external, [], "The keyframe deck must not fetch external assets.");
  });
  if (transitions) {
    await page.addInitScript(() => {
      window.throttlingTransitions = { started: 0, ready: 0, errors: [] };
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        window.throttlingTransitions.started += 1;
        transition.ready.then(() => { window.throttlingTransitions.ready += 1; })
          .catch((error) => window.throttlingTransitions.errors.push(error.message));
        return transition;
      };
    });
  }
  const url = new URL(deckUrl);
  url.hash = String(slide);
  await page.goto(url.href);
  if (javaScriptEnabled) {
    await page.waitForFunction(() => document.body.getAttribute("data-bespoke-view") === "");
    await waitForSlide(page, slide);
  }
  return page;
}

async function assertFrame(page, index) {
  const frame = frames[index];
  const section = page.locator(`section[id="${index + 1}"]`);
  const board = section.locator(".th-board");
  for (const [attribute, expected] of Object.entries({ frame: index + 1, time: frame.time, tokens: frame.tokens, admitted: frame.admitted, rejected: frame.rejected })) {
    assert.equal(await board.getAttribute(`data-${attribute}`), String(expected), `Frame ${index + 1}: ${attribute}`);
  }
  assert.equal(await board.locator("[data-token-count]").innerText(), String(frame.tokens));
  assert.equal(await section.locator(".th-clock").innerText(), `t = ${frame.time} s`);
  assert.equal(await board.locator('[data-status="admitted"]').count(), frame.admitted);
  assert.equal(await board.locator('[data-status="rejected"]').count(), frame.rejected);
  assert.equal(await board.locator(".th-token.spent").count(), frame.admitted);
  assert.deepEqual(await board.locator(".th-token.available").evaluateAll((tokens) => tokens.map((token) => token.dataset.morph)), frame.available);
  assert.deepEqual(await board.locator('[data-status="incoming"]').evaluateAll((requests) => requests.map((request) => request.dataset.request)), frame.incoming);
  const bounds = await section.evaluate((slide) => ({
    width: slide.clientWidth, height: slide.clientHeight,
    x: slide.scrollWidth - slide.clientWidth, y: slide.scrollHeight - slide.clientHeight,
  }));
  assert.equal(bounds.width, 1280);
  assert.equal(bounds.height, 720);
  assert.ok(bounds.x <= 2 && bounds.y <= 2, `Frame ${index + 1} overflow: ${JSON.stringify(bounds)}`);
  const misplaced = await board.evaluate((board) => [...board.querySelectorAll(".th-request, .th-token")].flatMap((element) => {
    const zone = element.classList.contains("available") ? ".th-bucket"
      : element.classList.contains("spent") || element.dataset.status === "admitted" ? ".th-admitted-zone"
      : element.dataset.status === "rejected" ? ".th-rejected-zone" : ".th-arrivals-zone";
    const parent = board.querySelector(zone).getBoundingClientRect();
    const child = element.getBoundingClientRect();
    return child.left < parent.left || child.right > parent.right || child.top < parent.top || child.bottom > parent.bottom
      ? [element.dataset.morph] : [];
  }));
  assert.deepEqual(misplaced, [], "Requests and tokens must fit in their declared state regions.");
}

test("all seven authored keyframes follow token accounting and fit their state regions", async (t) => {
  const page = await openDeck(t);
  let balance = 3;
  for (let index = 0; index < frames.length; index += 1) {
    if (index > 0) {
      const previous = frames[index - 1];
      balance = Math.min(3, balance + frames[index].time - previous.time)
        - (frames[index].admitted - previous.admitted);
      await page.keyboard.press("ArrowRight");
      await waitForSlide(page, index + 1);
    }
    assert.equal(balance, frames[index].tokens);
    await assertFrame(page, index);
  }
});

test("native morphs interpolate request geometry rather than only fading between images", async (t) => {
  const page = await openDeck(t, { motion: "no-preference", transitions: true });
  const before = await page.locator('section[id="1"] [data-request="a"]').boundingBox();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => window.throttlingTransitions.ready > 0 && document.documentElement.matches(":active-view-transition"));
  const geometry = () => page.evaluate(() => {
    const style = getComputedStyle(document.documentElement, "::view-transition-group(th-request-a)");
    return { animation: style.animationName, transform: style.transform, width: style.width };
  });
  const first = await geometry();
  assert.notEqual(first.animation, "none", "A named request morph must be active.");
  await page.waitForTimeout(120);
  assert.notDeepEqual(await geometry(), first, "The named transition must interpolate position or size.");
  await waitForSlide(page, 2);
  const after = await page.locator('section[id="2"] [data-request="a"]').boundingBox();
  assert.ok(after.x > before.x + 500, "Request A must move into the admitted region.");
  assert.ok(after.width > before.width, "Its card changes size across the keyframes.");
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 1);
  assert.deepEqual(await page.locator('section[id="1"] [data-request="a"]').boundingBox(), before);
  const result = await page.evaluate(() => window.throttlingTransitions);
  assert.ok(result.started >= 2);
  assert.equal(result.ready, result.started);
  assert.deepEqual(result.errors, []);
});

test("every frame has unique morph names and all forward/backward transitions capture successfully", async (t) => {
  const page = await openDeck(t, { motion: "no-preference", transitions: true });
  for (let slide = 1; slide <= 7; slide += 1) {
    if (slide > 1) {
      await page.keyboard.press("ArrowRight");
      await waitForSlide(page, slide);
    }
    const names = await page.locator(`section[id="${slide}"] [data-morph]`).evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).viewTransitionName));
    assert.ok(names.length >= 9);
    assert.ok(names.every((name) => name.startsWith("th-")));
    assert.equal(new Set(names).size, names.length, "Duplicate names would skip the entire native transition.");
  }
  for (let slide = 6; slide >= 1; slide -= 1) {
    await page.keyboard.press("ArrowLeft");
    await waitForSlide(page, slide);
  }
  const result = await page.evaluate(() => window.throttlingTransitions);
  assert.ok(result.started >= 12);
  assert.equal(result.ready, result.started);
  assert.deepEqual(result.errors, []);
});

test("the rejected attempt stays rejected and the client retry is a distinct request", async (t) => {
  const page = await openDeck(t, { slide: 4 });
  assert.match(await page.locator('section[id="4"] .th-rejection').innerText(), /Retry-After: 1/);
  for (let slide = 5; slide <= 6; slide += 1) {
    await page.keyboard.press("ArrowRight");
    await waitForSlide(page, slide);
    const board = page.locator(`section[id="${slide}"] .th-board`);
    assert.equal(await board.locator('[data-request="d"]').getAttribute("data-status"), "rejected");
    assert.equal(await board.locator('[data-request="retry"]').getAttribute("data-attempt"), "2");
    assert.equal(await board.locator('[data-request="retry"]').getAttribute("data-status"), slide === 5 ? "incoming" : "admitted");
    assert.equal(await board.locator('[data-morph="token-1"]').getAttribute("class"), "th-token token-1 spent");
  }
});

test("states do not autoplay or animate in place and require no custom runtime", async (t) => {
  const page = await openDeck(t, { slide: 5, motion: "no-preference" });
  assert.equal(await page.locator("script[src]").count(), 0);
  const section = page.locator('section[id="5"]');
  assert.equal(await section.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
  const before = await section.screenshot();
  await page.waitForTimeout(1200);
  assert.equal(new URL(page.url()).hash, "#5");
  assert.deepEqual(await section.screenshot(), before, "Only changing slides should animate or advance the story.");
});

test("reduced motion, print, and JavaScript-disabled views preserve every complete keyframe", async (t) => {
  const page = await openDeck(t);
  assert.deepEqual(await page.locator('section[id="1"] [data-morph]').evaluateAll((elements) =>
    [...new Set(elements.map((element) => getComputedStyle(element).viewTransitionName))]), ["none"]);
  await page.emulateMedia({ media: "print" });
  for (let index = 0; index < frames.length; index += 1) {
    const section = page.locator(`section[id="${index + 1}"]`);
    assert.equal(await section.isVisible(), true);
    assert.equal(await section.locator("[data-token-count]").innerText(), String(frames[index].tokens));
    assert.equal(await section.evaluate((element) => element.getAnimations({ subtree: true }).length), 0);
  }
  const staticPage = await openDeck(t, { javaScriptEnabled: false });
  assert.equal(await staticPage.locator("section.th").count(), 7);
  for (let index = 0; index < frames.length; index += 1) {
    const board = staticPage.locator(`[data-frame="${index + 1}"]`);
    assert.equal(await board.isVisible(), true);
    assert.equal(await board.locator(".available").count(), frames[index].tokens);
  }
});
