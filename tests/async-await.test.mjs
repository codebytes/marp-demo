import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const html = process.env.ASYNC_DECK_HTML ? resolve(process.env.ASYNC_DECK_HTML) : resolve("build", "async-await.html");
const deckUrl = process.env.ASYNC_DECK_URL || pathToFileURL(html).href;
let browser;

before(async () => {
  if (!process.env.ASYNC_DECK_URL) assert.ok(existsSync(html), "Run npm run build before testing the async deck.");
  browser = await chromium.launch();
});
after(async () => {
  if (browser) await browser.close();
});

async function waitForSlide(page, id) {
  await page.waitForFunction((value) => document.querySelector(`section[id="${value}"]`).closest("svg").classList.contains("bespoke-marp-active"), id);
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
}

async function openDeck(t, { slide = 3, motion = "reduce", javaScriptEnabled = true, view = "", transitions = false } = {}) {
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
    assert.deepEqual(external, [], "No external runtime dependencies.");
  });
  if (transitions) {
    await page.addInitScript(() => {
      window.asyncTransitions = { started: 0, ready: 0, errors: [] };
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        window.asyncTransitions.started += 1;
        transition.ready.then(() => { window.asyncTransitions.ready += 1; })
          .catch((error) => window.asyncTransitions.errors.push(error.message));
        return transition;
      };
    });
  }
  const url = new URL(deckUrl);
  url.hash = String(slide);
  if (view) url.searchParams.set("view", view);
  await page.goto(url.href);
  if (javaScriptEnabled) {
    await page.waitForFunction((value) => document.body.getAttribute("data-bespoke-view") === value, view);
    if (!view) {
      await page.waitForFunction(() => document.querySelector("[data-async-lab]")?.dataset.enhanced === "true");
      await waitForSlide(page, slide);
    }
  }
  return page;
}

const action = (page, name) => page.locator(`[data-async-action="${name}"]`);
const lab = (page) => page.locator("[data-async-lab]");
const lane = (page, name) => page.locator(`[data-async-lane="${name}"]`);
const progress = (page) => page.locator("[data-async-progress]").evaluate((element) => element.value);

async function assertFits(page, id) {
  const bounds = await page.locator(`section[id="${id}"]`).evaluate((slide) => ({
    width: slide.clientWidth, height: slide.clientHeight,
    x: slide.scrollWidth - slide.clientWidth, y: slide.scrollHeight - slide.clientHeight,
  }));
  assert.equal(bounds.width, 1280);
  assert.equal(bounds.height, 720);
  assert.ok(bounds.x <= 2 && bounds.y <= 2, `Slide ${id} overflow: ${JSON.stringify(bounds)}`);
}

async function assertSnapshot(page, { step, node, cpu, read, result = "pending", returned, saved = false, line = "await", edge = null }) {
  assert.equal(await lab(page).getAttribute("data-step"), step);
  assert.equal(await lab(page).getAttribute("data-machine"), node);
  assert.equal(await lab(page).getAttribute("data-returned"), String(returned));
  assert.equal(await lab(page).getAttribute("data-saved"), String(saved));
  assert.deepEqual(await page.locator('.aw-machine-node[data-state="active"]').evaluateAll((nodes) => nodes.map((node) => node.dataset.asyncNode)), [node]);
  assert.deepEqual(await page.locator('.aw-machine-edges [data-state="active"]').evaluateAll((edges) => edges.map((edge) => edge.dataset.asyncEdge)), edge ? [edge] : []);
  assert.deepEqual(await page.locator('.aw-live-code [data-active="true"]').evaluateAll((lines) => lines.map((line) => line.dataset.asyncCode)), [line]);
  for (const [name, status] of Object.entries({ cpu, read, result })) {
    assert.equal(await lane(page, name).getAttribute("data-status"), status, `${step}: ${name}`);
  }
  await assertFits(page, 3);
}

test("all four async slides fit, including every state-machine node label", async (t) => {
  const page = await openDeck(t, { slide: 1 });
  for (let id = 1; id <= 4; id += 1) {
    if (id > 1) await page.keyboard.press("ArrowRight");
    await waitForSlide(page, id);
    await assertFits(page, id);
  }
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 3);
  const clipped = await page.locator(".aw-machine-node").evaluateAll((nodes) => nodes.flatMap((node) => {
    const box = node.querySelector("rect, path").getBBox();
    return [...node.querySelectorAll("text")].filter((text) => {
      const bounds = text.getBBox();
      return bounds.x < box.x || bounds.y < box.y || bounds.x + bounds.width > box.x + box.width || bounds.y + bounds.height > box.y + box.height;
    }).map((text) => text.textContent);
  }));
  assert.deepEqual(clipped, []);
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 2);
  const contrasts = await page.locator(".aw-source-card").evaluate((card) => {
    const luminance = (color) => {
      const values = color.match(/[\d.]+/g).slice(0, 3).map(Number)
        .map((value) => value / 255)
        .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const background = luminance(getComputedStyle(card).backgroundColor);
    return [...card.querySelectorAll("code span")].map((span) => {
      const foreground = luminance(getComputedStyle(span).color);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
  });
  assert.ok(contrasts.length > 0, "The C# sample must contain syntax-highlighted tokens.");
  assert.ok(contrasts.every((ratio) => ratio >= 4.5), `C# token contrast: ${contrasts.join(", ")}`);
});

test("pending I/O synchronizes code, both task lifetimes, CPU release, and saved/resumed state", async (t) => {
  const page = await openDeck(t);
  const expected = [
    { step: "enter", node: "running", cpu: "executing", read: "pending", returned: false, line: "enter" },
    { step: "inspect", node: "inspect", cpu: "executing", read: "pending", returned: false, edge: "inspect" },
    { step: "suspend", node: "suspended", cpu: "yielded", read: "pending", returned: true, saved: true, edge: "suspend" },
    { step: "waiting", node: "suspended", cpu: "yielded", read: "pending", returned: true, saved: true },
    { step: "resume", node: "resume", cpu: "executing", read: "completed", returned: true, edge: "resume" },
    { step: "get-result", node: "get-result", cpu: "executing", read: "completed", returned: true, edge: "continue" },
    { step: "complete", node: "completed", cpu: "finished", read: "completed", result: "completed", returned: true, line: "return", edge: "success" },
  ];
  for (let i = 0; i < expected.length; i += 1) {
    if (i > 0) await action(page, "step").click();
    await assertSnapshot(page, expected[i]);
  }
  assert.equal(await action(page, "step").isDisabled(), true);
  assert.match(await lane(page, "result").innerText(), /Completed with 5/);
});

test("an already-completed await takes the fast edge without saving state or yielding", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-async-scenario]").selectOption("ready");
  const expected = [
    { step: "enter", node: "running", cpu: "executing", read: "completed", returned: false, line: "enter" },
    { step: "inspect", node: "inspect", cpu: "executing", read: "completed", returned: false, edge: "inspect" },
    { step: "get-result", node: "get-result", cpu: "executing", read: "completed", returned: false, edge: "fast" },
    { step: "complete", node: "completed", cpu: "finished", read: "completed", result: "completed", returned: true, line: "return", edge: "success" },
  ];
  for (let i = 0; i < expected.length; i += 1) {
    if (i > 0) await action(page, "step").click();
    await assertSnapshot(page, expected[i]);
    assert.equal(await page.locator('[data-async-node="suspended"]').getAttribute("data-state"), "queued");
    assert.equal(await page.locator('[data-async-node="resume"]').getAttribute("data-state"), "queued");
  }
  assert.match(await page.locator("[data-async-summary]").innerText(), /whole method completed synchronously/i);
});

test("a failed read faults the count task only after resumption and GetResult", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-async-scenario]").selectOption("fault");
  for (let i = 0; i < 4; i += 1) await action(page, "step").click();
  await assertSnapshot(page, { step: "resume", node: "resume", cpu: "executing", read: "faulted", returned: true, edge: "resume" });
  await action(page, "step").click();
  await assertSnapshot(page, { step: "get-result", node: "get-result", cpu: "executing", read: "faulted", returned: true, edge: "continue" });
  assert.match(await page.locator("[data-async-summary]").innerText(), /throws inside CountAsync/);
  await action(page, "step").click();
  await assertSnapshot(page, { step: "fault", node: "faulted", cpu: "finished", read: "faulted", result: "faulted", returned: true, edge: "error" });
  assert.equal(await page.locator('[data-async-node="completed"]').getAttribute("data-state"), "queued");
});

test("the wait animates only I/O, pause freezes it, and hidden slides do not advance", async (t) => {
  const page = await openDeck(t, { motion: "no-preference" });
  assert.equal(await lab(page).getAttribute("data-state"), "idle");
  for (let i = 0; i < 3; i += 1) await action(page, "step").click();
  await action(page, "toggle").click();
  const token = lane(page, "read").locator(".aw-track > span");
  const position = await token.evaluate((element) => element.style.left);
  await page.waitForTimeout(120);
  assert.notEqual(await token.evaluate((element) => element.style.left), position);
  assert.equal(await lane(page, "cpu").locator(".aw-track > span").getAttribute("data-active"), "false");
  assert.equal(await lane(page, "cpu").locator(".aw-track > i").evaluate((element) => element.style.width), "0%");
  assert.equal(await page.locator('[data-async-node="suspended"]').getAttribute("data-state"), "active");
  await action(page, "toggle").click();
  const paused = await progress(page);
  await page.waitForTimeout(150);
  assert.equal(await progress(page), paused);
  await action(page, "toggle").click();
  await page.locator("button:focus").evaluateAll((buttons) => buttons.forEach((button) => button.blur()));
  await page.keyboard.press("ArrowRight");
  await waitForSlide(page, 4);
  const hidden = await progress(page);
  await page.waitForTimeout(150);
  assert.equal(await progress(page), hidden);
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 3);
  await page.waitForFunction((value) => document.querySelector("[data-async-progress]").value > value, hidden);
});

test("2x playback reaches the same final state; replay and task selection reset the whole diagram", async (t) => {
  const page = await openDeck(t);
  await page.locator("[data-async-speed]").selectOption("2");
  await action(page, "toggle").click();
  await page.waitForFunction(() => document.querySelector("[data-async-lab]").dataset.state === "complete", null, { timeout: 7500 });
  assert.equal(await lab(page).getAttribute("data-machine"), "completed");
  assert.equal(await progress(page), 1);
  await action(page, "replay").click();
  assert.equal(await lab(page).getAttribute("data-step"), "enter");
  assert.equal(await lab(page).getAttribute("data-state"), "running");
  assert.equal(await page.locator('.aw-machine-node[data-state="visited"]').count(), 0);
  await page.locator("[data-async-scenario]").selectOption("fault");
  assert.equal(await lab(page).getAttribute("data-state"), "idle");
  assert.equal(await progress(page), 0);
  assert.equal(await lab(page).getAttribute("data-returned"), "false");
});

test("document visibility and reduced-motion changes suspend running playback", async (t) => {
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
  await page.waitForFunction((value) => document.querySelector("[data-async-progress]").value > value, hidden);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector("[data-async-lab]").dataset.state === "paused");
  assert.equal(await page.locator('.aw-track > span[data-active="true"]').count(), 0);
  assert.equal(await page.locator(".aw-active").count(), 0);
});

test("Space and Enter keep playback on the simulation slide; arrow keys still change slides", async (t) => {
  const page = await openDeck(t);
  await action(page, "toggle").focus();
  await page.keyboard.press("Space");
  assert.equal(await lab(page).getAttribute("data-state"), "running");
  await page.keyboard.press("Space");
  assert.equal(await lab(page).getAttribute("data-state"), "paused");
  await action(page, "step").focus();
  await page.keyboard.press("Enter");
  assert.equal(await lab(page).getAttribute("data-step"), "inspect");
  assert.equal(new URL(page.url()).hash, "#3");
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => location.hash === "#4", null, { timeout: 3000 });
});

test("print is an identical all-paths diagram even after failure; no-JS and presenter views stay static", async (t) => {
  const page = await openDeck(t);
  await page.emulateMedia({ media: "print" });
  const initial = await lab(page).screenshot();
  await page.emulateMedia({ media: "screen" });
  await page.locator("[data-async-scenario]").selectOption("fault");
  for (let i = 0; i < 6; i += 1) await action(page, "step").click();
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".aw-controls").isVisible(), false);
  assert.equal(await page.locator(".aw-print-caption").isVisible(), true);
  assert.equal(await lane(page, "result").locator(".aw-dynamic").isVisible(), false);
  assert.equal(await lane(page, "result").locator(".aw-static").isVisible(), true);
  assert.deepEqual(await lab(page).screenshot(), initial, "Print must not depend on the selected scenario or runtime highlights.");
  const staticPage = await openDeck(t, { javaScriptEnabled: false });
  assert.equal(await staticPage.locator(".aw-controls").isVisible(), false);
  assert.equal(await staticPage.locator(".aw-print-caption").isVisible(), true);
  assert.equal(await staticPage.locator(".aw-machine-node").count(), 7);
  for (const view of ["presenter", "next"]) {
    const preview = await openDeck(t, { view });
    assert.equal(await preview.locator(".aw-controls").isVisible(), false);
    assert.equal(await preview.locator(".aw-print-caption").isVisible(), true);
  }
});

test("the cover signal moves and native Marp transitions render in both directions", async (t) => {
  const page = await openDeck(t, { slide: 1, motion: "no-preference", transitions: true });
  const beam = page.locator(".aw-cover-beam");
  const offset = await beam.evaluate((element) => getComputedStyle(element).strokeDashoffset);
  await page.waitForTimeout(100);
  assert.notEqual(await beam.evaluate((element) => getComputedStyle(element).strokeDashoffset), offset);
  for (let id = 2; id <= 4; id += 1) {
    await page.keyboard.press("ArrowRight");
    await waitForSlide(page, id);
  }
  await page.keyboard.press("ArrowLeft");
  await waitForSlide(page, 3);
  const transitions = await page.evaluate(() => window.asyncTransitions);
  assert.ok(transitions.started >= 4);
  assert.equal(transitions.ready, transitions.started);
  assert.deepEqual(transitions.errors, []);
});
