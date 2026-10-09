import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { createPreviewServer } from "../scripts/preview.mjs";

let server;
let browser;
let siteUrl;

before(async () => {
  if (process.env.SITE_URL) {
    siteUrl = new URL(process.env.SITE_URL).href;
    assert.ok(siteUrl.endsWith("/"), "SITE_URL must end with a slash.");
  } else {
    assert.deepEqual(readdirSync("slides").filter((name) => name.endsWith(".md")), ["Animated-CICD.md"]);
    assert.deepEqual(readdirSync("build").filter((name) => /\.(html|pdf)$/.test(name)).sort(),
      ["Animated-CICD.pdf", "animated.html", "index.html"]);
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

test("the single-deck landing page fits desktop and mobile without JavaScript", async (t) => {
  const page = await openSite(t, { javaScriptEnabled: false });
  assert.match(await page.title(), /marp-demo/);
  assert.equal(await page.locator("article.demo").count(), 1);
  assert.equal(await page.locator("h1").count(), 1);
  assert.match(await page.locator("#demo-title").innerText(), /From commit\s+to confidence/);
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `Landing page overflows by ${overflow}px at ${width}px.`);
    assert.equal(await page.getByRole("link", { name: "Open presentation" }).isVisible(), true);
    assert.equal(await page.getByRole("link", { name: "Download PDF" }).isVisible(), true);
  }
});

test("relative presentation links load all four slides and the local runtime under the project prefix", async (t) => {
  const page = await openSite(t);
  await page.getByRole("link", { name: "Open presentation" }).click();
  const loaded = new URL(page.url());
  loaded.hash = "";
  assert.equal(loaded.href, new URL("animated.html", siteUrl).href);
  await page.waitForFunction(() => document.querySelector("[data-pipeline]")?.dataset.enhanced === "true");
  assert.equal(await page.locator("section.cicd").count(), 4);
  const script = await page.locator('script[src$="assets/animated-cicd.js"]').getAttribute("src");
  assert.equal(new URL(script, page.url()).href, new URL("assets/animated-cicd.js", siteUrl).href);
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

test("the PDF, runtime, and composed themes are included in the published package", async (t) => {
  const page = await openSite(t);
  const href = await page.getByRole("link", { name: "Download PDF" }).getAttribute("href");
  assert.equal(new URL(href, siteUrl).href, new URL("Animated-CICD.pdf", siteUrl).href);
  const pdf = await page.request.get(new URL(href, siteUrl).href);
  assert.equal(pdf.status(), 200);
  assert.match(pdf.headers()["content-type"], /application\/pdf/);
  const bytes = await pdf.body();
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 10_000, "The PDF must contain the rendered deck.");
  for (const path of ["assets/animated-cicd.js", "themes/custom-default.css", "themes/animated-cicd.css"]) {
    const asset = await page.request.get(new URL(path, siteUrl).href);
    assert.equal(asset.status(), 200, path);
    assert.ok((await asset.body()).length > 100, `${path} must not be empty.`);
  }
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
