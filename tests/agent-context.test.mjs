import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const html = process.env.AGENT_DECK_HTML ? resolve(process.env.AGENT_DECK_HTML) : resolve("build", "agent-context.html");
const deckUrl = process.env.AGENT_DECK_URL || pathToFileURL(html).href;
let browser;

before(async () => {
  if (!process.env.AGENT_DECK_URL) assert.ok(existsSync(html), "Run npm run build before testing the context deck.");
  browser = await chromium.launch();
});
after(async () => {
  if (browser) await browser.close();
});

async function waitForSlide(page, id) {
  await page.waitForFunction((value) =>
    document.querySelector(`section[id="${value}"]`).closest("svg").classList.contains("bespoke-marp-active"), id);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
}

async function assertFits(page, id) {
  const bounds = await page.locator(`section[id="${id}"]`).evaluate((slide) => ({
    width: slide.clientWidth, height: slide.clientHeight,
    x: slide.scrollWidth - slide.clientWidth, y: slide.scrollHeight - slide.clientHeight,
  }));
  assert.equal(bounds.width, 1280);
  assert.equal(bounds.height, 720);
  assert.ok(bounds.x <= 2 && bounds.y <= 2, `Slide ${id} overflow: ${JSON.stringify(bounds)}`);
}

async function openDeck(t, { slide = 5, motion = "reduce", javaScriptEnabled = true, view = "", transitions = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: motion,
    javaScriptEnabled,
  });
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
    assert.deepEqual(errors, [], "The deck must not throw browser errors.");
    assert.deepEqual(external, [], "The deck must not depend on external runtime assets.");
  });
  if (transitions) {
    await page.addInitScript(() => {
      window.contextTransitions = { started: 0, ready: 0, errors: [] };
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        window.contextTransitions.started += 1;
        transition.ready.then(() => { window.contextTransitions.ready += 1; })
          .catch((error) => window.contextTransitions.errors.push(error.message));
        return transition;
      };
    });
  }
  const url = new URL(deckUrl);
  if (view) url.searchParams.set("view", view);
  url.hash = String(slide);
  await page.goto(url.href);
  if (javaScriptEnabled) {
    await page.waitForFunction((value) => document.body.getAttribute("data-bespoke-view") === value, view);
    if (!view) {
      await page.waitForFunction(() => document.querySelector("[data-context-lab]")?.dataset.enhanced === "true");
      await waitForSlide(page, slide);
    }
  }
  return page;
}

const action = (page, name) => page.locator(`[data-context-action="${name}"]`);
const mode = (page) => page.locator("[data-context-lab]").getAttribute("data-state");
const phase = (page) => page.locator("[data-context-lab]").getAttribute("data-phase");
const progress = (page) => page.locator("[data-context-progress]").evaluate((element) => element.value);
const row = (page, name) => page.locator(`[data-context-item="${name}"]`);

test("all six context slides and tool diagram labels fit at native size", async (t) => {
  const page = await openDeck(t, { slide: 1 });
  for (let id = 1; id <= 6; id += 1) {
    if (id > 1) await page.keyboard.press("ArrowRight");
    await waitForSlide(page, id);
    await assertFits(page, id);
  }
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 5);
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 4);
  const clipped = await page.locator(".ctx-svg-node").evaluateAll((nodes) => nodes.flatMap((node) => {
    const box = node.querySelector("rect").getBBox();
    return [...node.querySelectorAll("text")].filter((text) => {
      const bounds = text.getBBox();
      return bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > box.width || bounds.y + bounds.height > box.height;
    }).map((text) => text.textContent);
  }));
  assert.deepEqual(clipped, []);
});

test("native Marp transitions and the named context morph run without skipped captures", async (t) => {
  const page = await openDeck(t, { slide: 1, motion: "no-preference", transitions: true });
  const named = page.locator('section[id="1"] [data-morph="ctx-window"]');
  assert.equal(await named.evaluate((element) => getComputedStyle(element).viewTransitionName), "ctx-window");
  for (let id = 2; id <= 6; id += 1) {
    await page.keyboard.press("ArrowRight");
    await waitForSlide(page, id);
  }
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 5);
  const captures = await page.evaluate(() => window.contextTransitions);
  assert.ok(captures.started >= 6, `Expected actual native transitions: ${JSON.stringify(captures)}`);
  assert.equal(captures.ready, captures.started);
  assert.deepEqual(captures.errors, []);
});

test("cover cards and tool paths animate, while reduced motion keeps the complete composition", async (t) => {
  const page = await openDeck(t, { slide: 1, motion: "no-preference" });
  const windowCard = page.locator(".ctx-cover-window");
  const initial = await windowCard.evaluate((element) => getComputedStyle(element).translate);
  await page.waitForTimeout(120);
  assert.notEqual(await windowCard.evaluate((element) => getComputedStyle(element).translate), initial);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelectorAll(".ctx-active").length === 0);
  assert.equal(await windowCard.evaluate((element) => getComputedStyle(element).viewTransitionName), "none");
  assert.equal(await page.locator(".ctx-float").count(), 3);
  for (const card of await page.locator(".ctx-float").all()) assert.equal(await card.isVisible(), true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (let id = 2; id <= 4; id += 1) {
    await page.keyboard.press("ArrowRight");
    await waitForSlide(page, id);
  }
  const signal = page.locator(".ctx-flow-out");
  const offset = await signal.evaluate((element) => getComputedStyle(element).strokeDashoffset);
  await page.waitForTimeout(100);
  assert.notEqual(await signal.evaluate((element) => getComputedStyle(element).strokeDashoffset), offset);
});

test("the lab starts manually and adds skill, definitions, and evidence in the right order", async (t) => {
  const page = await openDeck(t, { motion: "no-preference" });
  await page.waitForTimeout(150);
  assert.equal(await mode(page), "idle");
  assert.equal(await page.locator('.ctx-context-row[data-present="true"]').count(), 2);
  await action(page, "step").click();
  assert.equal(await phase(page), "1");
  await assertFits(page, 5);
  assert.equal(await row(page, "tools").getAttribute("data-present"), "true");
  assert.equal(await row(page, "skill").getAttribute("data-present"), "false");
  await action(page, "step").click();
  assert.equal(await row(page, "skill").getAttribute("data-present"), "true");
  await assertFits(page, 5);
  await action(page, "step").click();
  assert.equal(await phase(page), "3");
  await assertFits(page, 5);
  assert.equal(await row(page, "evidence").getAttribute("data-present"), "false");
  await action(page, "step").click();
  assert.equal(await row(page, "evidence").getAttribute("data-present"), "true");
  await assertFits(page, 5);
  assert.match(await row(page, "evidence").locator("[data-context-value]").innerText(), /ArrowDown/);
  await action(page, "step").click();
  assert.equal(await mode(page), "complete");
  await assertFits(page, 5);
  assert.equal(await action(page, "step").isDisabled(), true);
  assert.equal(await row(page, "instructions").getAttribute("data-present"), "true");
  assert.match(await page.locator("[data-context-detail]").innerText(), /next turn/i);
});

test("debugging changes the selected guidance and tool result; replay and scenario changes reset correctly", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-context-scenario]").selectOption("debug");
  assert.match(await row(page, "prompt").locator("[data-context-value]").innerText(), /checkout/);
  for (let i = 0; i < 3; i += 1) {
    await action(page, "step").click();
    await assertFits(page, 5);
  }
  assert.match(await page.locator("[data-context-detail]").innerText(), /run_tests/);
  assert.equal(await row(page, "evidence").getAttribute("data-present"), "false");
  await action(page, "step").click();
  assert.match(await row(page, "evidence").locator("[data-context-value]").innerText(), /FAIL/);
  await assertFits(page, 5);
  await action(page, "step").click();
  assert.match(await page.locator("[data-context-detail]").innerText(), /not proof/);
  await action(page, "replay").click();
  assert.equal(await phase(page), "0");
  assert.equal(await mode(page), "running");
  assert.equal(await page.locator("[data-context-scenario]").inputValue(), "debug");
  await page.locator("[data-context-scenario]").selectOption("feature");
  assert.equal(await mode(page), "idle");
  assert.equal(await progress(page), 0);
  assert.equal(await row(page, "evidence").getAttribute("data-present"), "false");
});

test("timed playback at 2x completes the context sequence and can start again", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-context-speed]").selectOption("2");
  await action(page, "toggle").click();
  await page.waitForFunction(() => document.querySelector("[data-context-lab]").dataset.state === "complete", null, { timeout: 7500 });
  assert.equal(await phase(page), "5");
  assert.equal(await progress(page), 1);
  assert.equal(await page.locator('.ctx-context-row[data-present="true"]').count(), 5);
  await action(page, "toggle").click();
  assert.equal(await phase(page), "0");
  assert.equal(await mode(page), "running");
});

test("request packets move, pause freezes them, and hidden slides suspend the clock", async (t) => {
  const page = await openDeck(t, { motion: "no-preference" });
  for (let i = 0; i < 3; i += 1) await action(page, "step").click();
  await action(page, "toggle").click();
  const packet = page.locator('.ctx-packet[data-active="true"]');
  const x = await packet.getAttribute("cx");
  await page.waitForTimeout(120);
  assert.notEqual(await packet.getAttribute("cx"), x);
  await action(page, "toggle").click();
  const paused = await progress(page);
  const pausedX = await packet.getAttribute("cx");
  await page.waitForTimeout(150);
  assert.equal(await progress(page), paused);
  assert.equal(await packet.getAttribute("cx"), pausedX);
  await action(page, "toggle").click();
  await page.locator("button:focus").evaluateAll((buttons) => buttons.forEach((button) => button.blur()));
  await page.keyboard.press("ArrowRight");
  await waitForSlide(page, 6);
  const hidden = await progress(page);
  await page.waitForTimeout(150);
  assert.equal(await progress(page), hidden);
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 5);
  await page.waitForFunction((value) => document.querySelector("[data-context-progress]").value > value, hidden);
});

test("hidden documents and a reduced-motion preference change suspend playback", async (t) => {
  const page = await openDeck(t, { motion: "no-preference" });
  await action(page, "toggle").click();
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
  await page.waitForFunction((value) => document.querySelector("[data-context-progress]").value > value, hidden);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector("[data-context-lab]").dataset.state === "paused");
  assert.equal(await page.locator('.ctx-packet[data-active="true"]').count(), 0);
  assert.equal(await page.locator(".ctx-active").count(), 0);
});

test("Space and Enter press playback controls without advancing; arrow keys still change slides", async (t) => {
  const page = await openDeck(t);
  await action(page, "toggle").focus();
  await page.keyboard.press("Space");
  assert.equal(await mode(page), "running");
  await page.keyboard.press("Space");
  assert.equal(await mode(page), "paused");
  await action(page, "step").focus();
  await page.keyboard.press("Enter");
  assert.equal(await phase(page), "1");
  assert.equal(new URL(page.url()).hash, "#5");
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => location.hash === "#6", null, { timeout: 3000 });
});

test("print always restores the authored snapshot; no-JS and presenter views keep complete diagrams", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-context-scenario]").selectOption("debug");
  for (let i = 0; i < 4; i += 1) await action(page, "step").click();
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".ctx-controls").isVisible(), false);
  assert.equal(await page.locator(".ctx-lab-static-note").isVisible(), true);
  assert.equal(await row(page, "evidence").locator(".ctx-dynamic").isVisible(), false);
  assert.equal(await row(page, "evidence").locator(".ctx-static").isVisible(), true);
  assert.match(await row(page, "evidence").locator(".ctx-static").innerText(), /ArrowDown/);
  const staticPage = await openDeck(t, { javaScriptEnabled: false });
  assert.equal(await staticPage.locator(".ctx-controls").isVisible(), false);
  assert.equal(await staticPage.locator(".ctx-lab-static-note").isVisible(), true);
  assert.equal(await staticPage.locator(".ctx-context-row .ctx-static").count(), 5);
  for (const view of ["presenter", "next"]) {
    const preview = await openDeck(t, { view });
    assert.equal(await preview.locator(".ctx-controls").isVisible(), false);
    assert.equal(await preview.locator(".ctx-lab-static-note").isVisible(), true);
  }
});
