import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { createPreviewServer } from "../scripts/preview.mjs";

let server;
let browser;
let siteUrl;
const decks = [
  { id: "cicd", html: "animated.html", pdf: "Animated-CICD.pdf", slides: "section.cicd", count: 4, root: "[data-pipeline]", script: "animated-cicd.js" },
  { id: "agent", html: "agent-context.html", pdf: "Agent-Context.pdf", slides: "section.ctx", count: 6, root: "[data-context-lab]", script: "agent-context.js" },
  { id: "async", html: "async-await.html", pdf: "Async-Await.pdf", slides: "section.aw", count: 4, root: "[data-async-lab]", script: "async-await.js" },
  { id: "throttle", html: "throttling.html", pdf: "Throttling.pdf", slides: "section.th", count: 7 },
];

before(async () => {
  if (process.env.SITE_URL) {
    siteUrl = new URL(process.env.SITE_URL).href;
    assert.ok(siteUrl.endsWith("/"), "SITE_URL must end with a slash.");
  } else {
    assert.deepEqual(readdirSync("slides").filter((name) => name.endsWith(".md")).sort(), ["Agent-Context.md", "Animated-CICD.md", "Async-Await.md", "Throttling.md"]);
    assert.deepEqual(readdirSync("build").filter((name) => /\.(html|pdf)$/.test(name)).sort(),
      ["Agent-Context.pdf", "Animated-CICD.pdf", "Async-Await.pdf", "Throttling.pdf", "agent-context.html", "animated.html", "async-await.html", "index.html", "throttling.html"]);
    server = createPreviewServer();
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    siteUrl = `http://127.0.0.1:${server.address().port}/marp-demo/`;
  }
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function openSite(t, options = {}) {
  const context = await browser.newContext({ reducedMotion: "reduce", ...options });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.route(/^https?:\/\//, (route) => {
    if (new URL(route.request().url()).origin === new URL(siteUrl).origin) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  t.after(() => {
    assert.deepEqual(errors, [], "The packaged site must not have browser or HTTP errors.");
    assert.deepEqual(external, [], "The site and presentation must not require external runtime assets.");
  });
  const response = await page.goto(siteUrl);
  assert.equal(response.status(), 200);
  return page;
}

test("the four-deck landing page fits desktop and mobile without JavaScript", async (t) => {
  const page = await openSite(t, { javaScriptEnabled: false });
  assert.match(await page.title(), /marp-demo/);
  assert.equal(await page.locator("article.demo").count(), 4);
  assert.equal(await page.locator("h1").count(), 1);
  assert.match(await page.locator("#demo-title").innerText(), /From commit\s+to confidence/);
  assert.match(await page.locator("#agent-title").innerText(), /From prompt\s+to action/);
  assert.match(await page.locator("#async-title").innerText(), /Await the work\.\s+Not the thread/);
  assert.match(await page.locator("#throttle-title").innerText(), /Throttle\s+the burst/);
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `Landing page overflows by ${overflow}px at ${width}px.`);
    for (const deck of decks) {
      const card = page.locator(`[data-deck="${deck.id}"]`);
      assert.equal(await card.getByRole("link", { name: "Open presentation" }).isVisible(), true);
      assert.equal(await card.getByRole("link", { name: "Download PDF" }).isVisible(), true);
    }
  }
});

test("all presentation links load their slides and required assets under the project prefix", async (t) => {
  const page = await openSite(t);
  for (const deck of decks) {
    await page.goto(siteUrl);
    await page.locator(`[data-deck="${deck.id}"]`).getByRole("link", { name: "Open presentation" }).click();
    const loaded = new URL(page.url());
    loaded.hash = "";
    assert.equal(loaded.href, new URL(deck.html, siteUrl).href);
    await page.waitForFunction(() => document.body.getAttribute("data-bespoke-view") === "");
    if (deck.root) {
      await page.waitForFunction((root) => document.querySelector(root)?.dataset.enhanced === "true", deck.root);
    }
    assert.equal(await page.locator(deck.slides).count(), deck.count);
    if (deck.script) {
      const script = await page.locator(`script[src$="assets/${deck.script}"]`).getAttribute("src");
      assert.equal(new URL(script, page.url()).href, new URL(`assets/${deck.script}`, siteUrl).href);
    } else {
      assert.equal(await page.locator("script[src]").count(), 0, "The keyframe deck must not require a custom runtime.");
    }
  }
});

test("the packaged simulation can step through approval and release", async (t) => {
  const page = await openSite(t);
  await page.getByRole("link", { name: "Jump to the simulation" }).click();
  await page.waitForFunction(() => document.querySelector("[data-pipeline]")?.dataset.enhanced === "true");
  await page.waitForFunction(() => document.querySelector('section[id="3"]').closest("svg").classList.contains("bespoke-marp-active"));
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
  for (let step = 0; step < 5; step += 1) await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator("[data-pipeline]").getAttribute("data-state"), "approval");
  assert.equal(await page.locator('[data-action="step"]').isDisabled(), true);
  await page.locator('[data-action="approve"]').click();
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator("[data-pipeline]").getAttribute("data-state"), "complete");
});

test("all PDFs, runtimes, and themes are included in the published package", async (t) => {
  const page = await openSite(t);
  for (const deck of decks) {
    const href = await page.locator(`[data-deck="${deck.id}"]`).getByRole("link", { name: "Download PDF" }).getAttribute("href");
    assert.equal(new URL(href, siteUrl).href, new URL(deck.pdf, siteUrl).href);
    const pdf = await page.request.get(new URL(href, siteUrl).href);
    assert.equal(pdf.status(), 200);
    assert.match(pdf.headers()["content-type"], /application\/pdf/);
    const bytes = await pdf.body();
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.ok(bytes.length > 10_000, "The PDF must contain the rendered deck.");
  }
  for (const path of ["assets/animated-cicd.js", "assets/agent-context.js", "assets/async-await.js", "themes/custom-default.css", "themes/animated-cicd.css", "themes/agent-context.css", "themes/async-await.css", "themes/throttling.css"]) {
    const asset = await page.request.get(new URL(path, siteUrl).href);
    assert.equal(asset.status(), 200, path);
    assert.ok((await asset.body()).length > 100, `${path} must not be empty.`);
  }
});

test("the async lab link keeps the execution and state-machine panels synchronized", async (t) => {
  const page = await openSite(t);
  await page.getByRole("link", { name: "Jump to the async lab" }).click();
  await page.waitForFunction(() => document.querySelector("[data-async-lab]")?.dataset.enhanced === "true");
  await page.waitForFunction(() => document.querySelector('section[id="3"]').closest("svg").classList.contains("bespoke-marp-active"));
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
  for (let step = 0; step < 3; step += 1) await page.locator('[data-async-action="step"]').click();
  assert.equal(await page.locator("[data-async-lab]").getAttribute("data-step"), "waiting");
  assert.equal(await page.locator('[data-async-node="suspended"]').getAttribute("data-state"), "active");
  assert.equal(await page.locator('[data-async-lane="cpu"]').getAttribute("data-status"), "yielded");
  assert.equal(await page.locator('[data-async-lane="read"]').getAttribute("data-status"), "pending");
});

test("the project-prefix link opens the context lab and preserves its tool-result sequence", async (t) => {
  const page = await openSite(t);
  await page.getByRole("link", { name: "Jump to the context lab" }).click();
  await page.waitForFunction(() => document.querySelector("[data-context-lab]")?.dataset.enhanced === "true");
  await page.waitForFunction(() => document.querySelector('section[id="5"]').closest("svg").classList.contains("bespoke-marp-active"));
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition"));
  for (let step = 0; step < 3; step += 1) await page.locator('[data-context-action="step"]').click();
  assert.equal(await page.locator('[data-context-item="evidence"]').getAttribute("data-present"), "false");
  await page.locator('[data-context-action="step"]').click();
  assert.equal(await page.locator('[data-context-item="evidence"]').getAttribute("data-present"), "true");
  await page.locator('[data-context-action="step"]').click();
  assert.equal(await page.locator("[data-context-lab]").getAttribute("data-state"), "complete");
});

test("preview redirects to the project path and never serves source files", { skip: Boolean(process.env.SITE_URL) }, async (t) => {
  const context = await browser.newContext();
  t.after(() => context.close());
  const root = new URL("/", siteUrl).href;
  const redirect = await context.request.get(root, { maxRedirects: 0 });
  assert.equal(redirect.status(), 302);
  assert.equal(redirect.headers().location, "/marp-demo/");
  for (const path of ["basic.html", "Slides.pdf", "README.md", "../README.md"]) {
    assert.equal((await context.request.get(new URL(path, siteUrl).href)).status(), 404, path);
  }
  assert.equal((await context.request.get(`${siteUrl}%2e%2e%2fREADME.md`)).status(), 403);
  assert.equal((await context.request.get(`${siteUrl}%00`)).status(), 404);
  assert.equal((await context.request.get(`${siteUrl}%ZZ`)).status(), 400);
  assert.equal((await context.request.post(siteUrl)).status(), 405);
  const head = await context.request.head(new URL("animated.html", siteUrl).href);
  assert.equal(head.status(), 200);
  assert.equal((await head.body()).length, 0);
});
