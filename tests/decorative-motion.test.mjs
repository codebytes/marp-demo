import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const scenes = [
  {
    name: "async cover signals", file: "async-await.html", env: "ASYNC_DECK", slide: 1,
    loops: [
      { selector: ".aw-cover-beam", name: "aw-beam", property: "stroke-dashoffset" },
      { selector: ".aw-cover-io", name: "aw-io", property: "stroke-dashoffset" },
    ],
  },
  {
    name: "CI/CD cover signal", file: "animated.html", env: "ANIMATED_DECK", slide: 1,
    loops: [{ selector: ".cicd-hero-signal", name: "cicd-signal", property: "stroke-dashoffset" }],
  },
  {
    name: "context cover cards", file: "agent-context.html", env: "AGENT_DECK", slide: 1,
    loops: [
      { selector: ".ctx-float-instructions", name: "ctx-float-idle", property: "translate" },
      { selector: ".ctx-float-skill", name: "ctx-float-idle", property: "translate" },
      { selector: ".ctx-float-result", name: "ctx-float-idle", property: "translate" },
    ],
  },
  {
    name: "selected-skill glow", file: "agent-context.html", env: "AGENT_DECK", slide: 3,
    loops: [{ selector: ".ctx-selected-skill", name: "ctx-skill-glow", property: "box-shadow" }],
  },
  {
    name: "tool request/result flow", file: "agent-context.html", env: "AGENT_DECK", slide: 4,
    loops: [
      { selector: ".ctx-flow-out", name: "ctx-flow", property: "stroke-dashoffset" },
      { selector: ".ctx-flow-back", name: "ctx-flow", property: "stroke-dashoffset" },
    ],
  },
];
let browser;

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  if (browser) await browser.close();
});

async function waitForSlide(page, slide) {
  await page.waitForFunction((id) => document.querySelector(`section[id="${id}"]`).closest("svg").classList.contains("bespoke-marp-active"), slide);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
}

async function expectStopped(page, loops) {
  await page.waitForFunction((items) => items.every(({ selector }) =>
    document.querySelector(selector).getAnimations().length === 0), loops);
}

async function expectRunning(page, loops) {
  await page.waitForFunction((items) => items.every(({ selector, name }) =>
    document.querySelector(selector).getAnimations().some((animation) =>
      animation.animationName === name && animation.playState === "running"
      && animation.effect.getTiming().iterations === Infinity)), loops);
}

for (const scene of scenes) {
  test(`${scene.name} loop beyond their first cycle and stop when not visible`, async (t) => {
    const html = process.env[`${scene.env}_HTML`] ? resolve(process.env[`${scene.env}_HTML`]) : resolve("build", scene.file);
    const remote = process.env[`${scene.env}_URL`];
    if (!remote) assert.ok(existsSync(html), "Run npm run build before testing decorative motion.");
    const url = new URL(remote || pathToFileURL(html).href);
    url.hash = String(scene.slide);
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "no-preference" });
    t.after(() => context.close());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    t.after(() => assert.deepEqual(errors, [], "Decorative motion must not throw browser errors."));
    await page.goto(url.href);
    await waitForSlide(page, scene.slide);
    await expectRunning(page, scene.loops);

    const infinite = await page.locator(`section[id="${scene.slide}"]`).evaluate((section) =>
      [...new Set(section.getAnimations({ subtree: true })
        .filter((animation) => animation.effect.getTiming().iterations === Infinity)
        .map((animation) => animation.animationName))].sort());
    assert.deepEqual(infinite, [...new Set(scene.loops.map((loop) => loop.name))].sort(),
      "Only the intended decorative effects loop; content entrances must not repeat.");

    await page.waitForFunction((loops) => loops.every(({ selector, name }) =>
      document.querySelector(selector).getAnimations().some((animation) =>
        animation.animationName === name && animation.playState === "running"
        && animation.effect.getComputedTiming().currentIteration >= 1)), scene.loops, { timeout: 15000 });
    const values = () => page.evaluate((loops) => loops.map(({ selector, property }) =>
      getComputedStyle(document.querySelector(selector)).getPropertyValue(property)), scene.loops);
    const first = await values();
    await page.waitForTimeout(160);
    assert.notDeepEqual(await values(), first, "The rendered properties must keep moving after one complete cycle.");
    const overflow = await page.locator(`section[id="${scene.slide}"]`).evaluate((section) =>
      [section.scrollWidth - section.clientWidth, section.scrollHeight - section.clientHeight]);
    assert.ok(overflow.every((amount) => amount <= 2), `Looping content must stay inside the slide: ${overflow}`);

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expectStopped(page, scene.loops);
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expectRunning(page, scene.loops);

    await page.emulateMedia({ media: "print" });
    await expectStopped(page, scene.loops);
    await page.emulateMedia({ media: "screen", reducedMotion: "reduce" });
    await expectStopped(page, scene.loops);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectRunning(page, scene.loops);

    await page.keyboard.press("ArrowRight");
    await waitForSlide(page, scene.slide + 1);
    await expectStopped(page, scene.loops);
    await page.keyboard.press("ArrowLeft");
    await waitForSlide(page, scene.slide);
    await expectRunning(page, scene.loops);

    url.searchParams.set("view", "presenter");
    await page.goto(url.href);
    await page.waitForFunction(() => document.body.getAttribute("data-bespoke-view") === "presenter");
    await expectStopped(page, scene.loops);
  });
}
