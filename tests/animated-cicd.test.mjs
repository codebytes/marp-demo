import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const html = process.env.ANIMATED_DECK_HTML
  ? resolve(process.env.ANIMATED_DECK_HTML)
  : resolve("build", "animated.html");
const deckUrl = process.env.ANIMATED_DECK_URL || pathToFileURL(html).href;
let browser;

before(async () => {
  if (!process.env.ANIMATED_DECK_URL) {
    assert.ok(existsSync(html), `Build ${html} using npm run build before running tests.`);
  }
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close();
});

async function openDeck(t, { motion = "reduce", javaScriptEnabled = true, view = "" } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: motion,
    javaScriptEnabled,
  });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], "The deck must not throw browser errors."));
  await page.route(/^https?:\/\//, (route) => {
    if (new URL(route.request().url()).origin === new URL(deckUrl).origin) return route.continue();
    return route.abort();
  });
  const url = new URL(deckUrl);
  if (view) url.searchParams.set("view", view);
  url.hash = "3";
  await page.goto(url.href);
  if (javaScriptEnabled) {
    await page.waitForFunction((expectedView) => document.body.getAttribute("data-bespoke-view") === expectedView, view);
    if (!view) {
      await page.waitForFunction(() => document.querySelector("[data-pipeline]").dataset.enhanced === "true");
      await waitForSlide(page, 3);
    }
  }
  return page;
}

const action = (page, name) => page.locator(`[data-action="${name}"]`);
const mode = (page) => page.locator("[data-pipeline]").getAttribute("data-state");
const stage = (page) => page.locator("[data-pipeline]").getAttribute("data-stage");
const progress = (page) => page.locator("[data-progress]").evaluate((element) => element.value);

async function waitForMode(page, expected) {
  await page.waitForFunction((value) => document.querySelector("[data-pipeline]").dataset.state === value, expected);
}

async function waitForSlide(page, id) {
  await page.waitForFunction((slideId) => document.querySelector(`section[id="${slideId}"]`).closest("svg").classList.contains("bespoke-marp-active"), id);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
}

test("all four slides and SVG node labels fit at native slide size", async (t) => {
  const page = await openDeck(t);
  await page.keyboard.press("Home");
  for (let id = 1; id <= 4; id += 1) {
    if (id > 1) await page.keyboard.press("ArrowRight");
    await waitForSlide(page, id);
    const bounds = await page.locator(`section[id="${id}"]`).evaluate((slide) => ({
      width: slide.clientWidth,
      height: slide.clientHeight,
      x: slide.scrollWidth - slide.clientWidth,
      y: slide.scrollHeight - slide.clientHeight,
    }));
    assert.equal(bounds.width, 1280);
    assert.equal(bounds.height, 720);
    assert.ok(bounds.x <= 2 && bounds.y <= 2, `Slide ${id} overflow: ${JSON.stringify(bounds)}`);
  }
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 3);
  const clipped = await page.locator(".cicd-node").evaluateAll((nodes) => nodes.flatMap((node) => {
    const box = node.querySelector("rect").getBBox();
    return [...node.querySelectorAll("text")].filter((text) => {
      const bounds = text.getBBox();
      return bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > box.width || bounds.y + bounds.height > box.height;
    }).map((text) => text.textContent);
  }));
  assert.deepEqual(clipped, []);
});

test("stepping exposes parallel checks and cannot bypass approval", async (t) => {
  const page = await openDeck(t);
  assert.equal(await mode(page), "idle");
  await action(page, "step").click();
  assert.equal(await stage(page), "1");
  assert.equal(await mode(page), "paused");
  await action(page, "step").click();
  assert.equal(await page.locator('[data-node="tests"]').getAttribute("data-state"), "active");
  assert.equal(await page.locator('[data-node="security"]').getAttribute("data-state"), "active");
  for (let i = 0; i < 3; i += 1) await action(page, "step").click();
  assert.equal(await mode(page), "approval");
  assert.equal(await action(page, "toggle").isDisabled(), true);
  assert.equal(await action(page, "step").isDisabled(), true);
  assert.equal(await action(page, "approve").isEnabled(), true);
  assert.equal(await page.locator('[data-node="production"] [data-node-state]').textContent(), "LOCKED");
  await action(page, "approve").click();
  assert.equal(await mode(page), "running");
  await action(page, "step").click();
  assert.equal(await mode(page), "complete");
  assert.match(await page.locator("[data-summary]").textContent(), /100%/);
});

test("timed playback honors speed, stops at the gate, and completes after approval", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-speed]").selectOption("2");
  await action(page, "toggle").click();
  await waitForMode(page, "approval");
  await page.waitForTimeout(200);
  assert.equal(await mode(page), "approval");
  await action(page, "approve").click();
  await waitForMode(page, "complete");
  assert.equal(await page.locator('.cicd-node[data-state="done"]').count(), 7);
  assert.equal(await progress(page), 1);
});

test("failed tests block every downstream stage; replay resets the selected scenario", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-scenario]").selectOption("fail");
  for (let i = 0; i < 3; i += 1) await action(page, "step").click();
  assert.equal(await mode(page), "failed");
  assert.equal(await page.locator('[data-node="tests"]').getAttribute("data-state"), "failed");
  assert.equal(await page.locator('[data-node="security"]').getAttribute("data-state"), "done");
  assert.equal(await page.locator('.cicd-node[data-state="blocked"]').count(), 3);
  assert.equal(await action(page, "approve").isDisabled(), true);
  await action(page, "replay").click();
  assert.equal(await stage(page), "0");
  assert.equal(await mode(page), "running");
  assert.equal(await page.locator("[data-scenario]").inputValue(), "fail");
  await page.locator("[data-scenario]").selectOption("healthy");
  assert.equal(await mode(page), "idle");
  assert.equal(await progress(page), 0);
});

test("particles move, pause freezes the timeline, and hidden slides do not advance", async (t) => {
  const page = await openDeck(t, { motion: "no-preference" });
  await waitForMode(page, "running");
  await action(page, "step").click();
  await action(page, "toggle").click();
  await page.waitForFunction(() => document.querySelector("[data-progress]").value > 0.03);
  const packet = page.locator('.cicd-packet[data-active="true"]').first();
  const x = await packet.getAttribute("cx");
  await page.waitForTimeout(100);
  assert.notEqual(await packet.getAttribute("cx"), x);
  await action(page, "toggle").click();
  const paused = await progress(page);
  await page.waitForTimeout(150);
  assert.equal(await progress(page), paused);
  await action(page, "toggle").click();
  await page.locator("button:focus").evaluateAll((buttons) => buttons.forEach((button) => button.blur()));
  await page.keyboard.press("ArrowRight");
  await waitForSlide(page, 4);
  const hidden = await progress(page);
  await page.waitForTimeout(200);
  assert.equal(await progress(page), hidden);
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 3);
  await page.waitForFunction((value) => document.querySelector("[data-progress]").value > value, hidden);
});

test("document visibility and reduced-motion changes suspend running playback", async (t) => {
  const page = await openDeck(t, { motion: "no-preference" });
  await waitForMode(page, "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await progress(page);
  await page.waitForTimeout(150);
  assert.equal(await progress(page), hidden);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction((value) => document.querySelector("[data-progress]").value > value, hidden);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await waitForMode(page, "paused");
  assert.equal(await page.locator(".cicd-live").count(), 0);
  assert.equal(await page.locator('.cicd-packet[data-active="true"]').count(), 0);
});

test("reduced motion starts idle and keyboard controls do not navigate the deck", async (t) => {
  const page = await openDeck(t);
  await page.waitForTimeout(200);
  assert.equal(await mode(page), "idle");
  await action(page, "toggle").focus();
  await page.keyboard.press("Space");
  assert.equal(await mode(page), "running");
  assert.equal(new URL(page.url()).hash, "#3");
  await page.keyboard.press("Space");
  assert.equal(await mode(page), "paused");
  await action(page, "step").focus();
  await page.keyboard.press("Enter");
  assert.equal(await stage(page), "1");
  assert.equal(new URL(page.url()).hash, "#3");
});

test("print, JavaScript-disabled, and presenter views retain the static diagram", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-scenario]").selectOption("fail");
  for (let i = 0; i < 3; i += 1) await action(page, "step").click();
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".cicd-controls").isVisible(), false);
  assert.equal(await page.locator(".cicd-static-note").isVisible(), true);
  assert.equal(await page.locator(".cicd-node-state").first().isVisible(), false);
  const staticPage = await openDeck(t, { javaScriptEnabled: false });
  assert.equal(await staticPage.locator(".cicd-static-note").isVisible(), true);
  assert.equal(await staticPage.locator(".cicd-controls").isVisible(), false);
  assert.equal(await staticPage.locator(".cicd-node").count(), 7);
  const presenter = await openDeck(t, { view: "presenter" });
  assert.equal(await presenter.locator(".cicd-controls").isVisible(), false);
  assert.equal(await presenter.locator(".cicd-static-note").isVisible(), true);
});
