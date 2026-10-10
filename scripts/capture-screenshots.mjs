import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createPreviewServer } from "./preview.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "docs", "screenshots");
if (!existsSync(join(root, "build", "index.html"))) {
  throw new Error("Run npm run build before capturing screenshots.");
}

const covers = [
  ["motion-lab", "motion-lab.html"],
  ["throttling", "throttling.html"],
  ["async-await", "async-await.html"],
  ["agent-context", "agent-context.html"],
  ["animated-cicd", "animated.html"],
];
// Each experiment is paused, then all of its clocks are moved to the same moment (ms).
const techniques = [
  { slide: 2, technique: "css", label: "CSS choreography", at: 2000 },
  { slide: 3, technique: "stroke", label: "SVG stroke drawing", at: 2000 },
  // At two seconds, the signal is hidden behind B.
  { slide: 4, technique: "svg", label: "Declarative SVG motion", at: 3200 },
  { slide: 5, technique: "mask", label: "Masks/wipes", at: 2000 },
  { slide: 6, technique: "depth", label: "CSS 3D", at: 2000 },
  { slide: 7, technique: "sprite", label: "Sprite animation", at: 2000 },
  { slide: 8, technique: "video", label: "Pre-rendered video", at: 2000 },
  { slide: 9, technique: "vector", label: "Authored vectors / Lottie", at: 2000 },
];

const server = createPreviewServer();
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const site = `http://127.0.0.1:${server.address().port}/marp-demo/`;
const browser = await chromium.launch();
const shots = new Map();

async function settle(page) {
  await page.waitForFunction(() => !document.documentElement.matches(":active-view-transition")
    && document.getAnimations().every((animation) => animation.playState !== "running"
      || animation.effect.getComputedTiming().endTime === Infinity));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function capture(path, { slide, motion = "reduce", scale = 1.5, prepare, element, clip } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: scale, reducedMotion: motion });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(`${site}${path}${slide ? `#${slide}` : ""}`);
    if (slide) {
      await page.waitForFunction(() => document.body.getAttribute("data-bespoke-view") === "");
      await page.waitForFunction((id) => document.querySelector(`section[id="${id}"]`).closest("svg").classList.contains("bespoke-marp-active"), slide);
      await page.waitForFunction(() => [...document.querySelectorAll("[data-enhanced]")].every((node) => node.dataset.enhanced === "true"));
    }
    await settle(page);
    if (prepare) await prepare(page);
    await settle(page);
    const image = element ? await page.locator(element).screenshot()
      : clip ? await page.screenshot({ fullPage: true, clip: await clip(page) }) : await page.screenshot();
    if (errors.length) throw new Error(`${path}: ${errors.join("; ")}`);
    return image;
  } finally {
    await context.close();
  }
}

async function step(page, selector, count) {
  for (let index = 0; index < count; index += 1) await page.locator(selector).click();
}

async function pauseAt(page, technique, at) {
  const root = page.locator(`[data-motion-technique="${technique}"]`);
  const toggle = root.locator('[data-motion-action="toggle"]');
  await toggle.click();
  // The preview server does not offer range requests, so the video plays to the moment instead of seeking.
  await root.evaluate((element, time) => new Promise((resolve, reject) => {
    const video = element.querySelector("video");
    if (!video) return resolve();
    const timeout = setTimeout(() => reject(new Error("The video never reached the requested frame.")), 10000);
    const presented = (now, frame) => {
      if (frame.mediaTime < time / 1000) return video.requestVideoFrameCallback(presented);
      clearTimeout(timeout);
      resolve();
    };
    video.requestVideoFrameCallback(presented);
  }), at);
  await toggle.click();
  await root.evaluate((element, time) => {
    for (const animation of element.getAnimations({ subtree: true })) animation.currentTime = time;
    element.querySelector(".ml-motion-svg")?.setCurrentTime(time / 1000);
    for (const animation of window.lottie?.getRegisteredAnimations() ?? []) animation.goToAndStop(time, false);
  }, at);
}

async function grid(cells) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  try {
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>
      body { margin: 0; padding: 28px 32px 30px; background: #1c1720; color: #c6b7c2; font: 600 15px "Segoe UI", Arial, sans-serif; letter-spacing: 0.02em; }
      main { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px 20px; }
      figure { margin: 0; }
      img { display: block; width: 100%; }
      figcaption { margin-top: 9px; }
    </style><main>${cells.map(({ image, label }) =>
      `<figure><img src="data:image/png;base64,${image.toString("base64")}" alt=""><figcaption>${label}</figcaption></figure>`).join("")}</main>`);
    return await page.locator("body").screenshot();
  } finally {
    await page.close();
  }
}

async function save(name, png) {
  const encoder = await browser.newPage();
  try {
    const webp = await encoder.evaluate(async (source) => {
      const bytes = Uint8Array.from(atob(source), (character) => character.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.9 });
      if (blob.type !== "image/webp") throw new Error("This Chromium cannot encode WebP.");
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }, png.toString("base64"));
    shots.set(name, Buffer.from(webp, "base64"));
  } finally {
    await encoder.close();
  }
}

try {
  await save("showcase", await capture("", {
    clip: async (page) => {
      const [first, second] = await Promise.all([0, 1].map((index) => page.locator("article.demo").nth(index).boundingBox()));
      return { x: 0, y: 0, width: 1280, height: Math.round((first.y + first.height + second.y) / 2) };
    },
  }));
  for (const [name, html] of covers) await save(`${name}-cover`, await capture(html, { slide: 1, scale: 0.5 }));

  const cells = [];
  for (const { slide, technique, label, at } of techniques) {
    cells.push({ label, image: await capture("motion-lab.html", {
      slide, motion: "no-preference", element: `[data-motion-technique="${technique}"]`,
      prepare: (page) => pauseAt(page, technique, at),
    }) });
  }
  cells.push({ label: "Shared-element morphing", image: await capture("motion-lab.html", { slide: 11, element: 'section[id="11"] .ml-demo' }) });
  await save("motion-lab-techniques", await grid(cells));

  for (const slide of [1, 4]) await save(`throttling-frame-${slide}`, await capture("throttling.html", { slide }));
  await save("async-await-lab", await capture("async-await.html", {
    slide: 3,
    prepare: async (page) => {
      await step(page, '[data-async-action="step"]', 3);
      await page.waitForFunction(() => document.querySelector("[data-async-lab]").dataset.step === "waiting");
    },
  }));
  await save("agent-context-lab", await capture("agent-context.html", {
    slide: 5,
    prepare: async (page) => {
      await step(page, '[data-context-action="step"]', 4);
      await page.waitForFunction(() => document.querySelector('[data-context-item="evidence"]').dataset.present === "true");
    },
  }));
  await save("animated-cicd-lab", await capture("animated.html", {
    slide: 3,
    prepare: async (page) => {
      await step(page, '[data-action="step"]', 5);
      await page.waitForFunction(() => document.querySelector("[data-pipeline]").dataset.state === "approval");
    },
  }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const [name, image] of shots) writeFileSync(join(output, `${name}.webp`), image);
console.log(`Captured ${shots.size} README screenshots in docs/screenshots.`);
