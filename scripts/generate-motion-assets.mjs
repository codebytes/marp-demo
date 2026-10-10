import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const directory = fileURLToPath(new URL("../slides/assets/motion-lab/", import.meta.url));
const specimen = readFileSync(join(directory, "specimen.svg"), "utf8");
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  const media = await page.evaluate(async (source) => {
    const canvas = document.createElement("canvas");
    canvas.width = 680;
    canvas.height = 300;
    const context = canvas.getContext("2d");
    const sheet = document.createElement("canvas");
    sheet.width = 680 * 12;
    sheet.height = 300;
    const sheetContext = sheet.getContext("2d");

    async function draw(time) {
      const document = new DOMParser().parseFromString(source, "image/svg+xml");
      const lift = Math.sin(Math.PI * time) ** 2;
      const shape = document.getElementById("node-b");
      shape.setAttribute("transform", `translate(340 104) rotate(${Math.sin(time * Math.PI * 2) * 9}) scale(${1 + lift * 0.24}) translate(-340 -104)`);
      const route = document.getElementById("route");
      route.setAttribute("stroke", time > 0 && time < 1 ? "#97ebe1" : "#8e7a8c");
      const xml = new XMLSerializer().serializeToString(document);
      const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        context.fillStyle = "#211c29";
        context.fillRect(0, 0, 680, 300);
        context.drawImage(image, 0, 0);
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    for (let frame = 0; frame < 12; frame += 1) {
      await draw(frame / 11);
      sheetContext.drawImage(canvas, frame * 680, 0);
    }
    await draw(0);
    const type = "video/webm;codecs=vp9";
    if (!MediaRecorder.isTypeSupported(type)) throw new Error("This Chromium cannot record the required VP9 WebM.");
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 1_400_000 });
    const chunks = [];
    const recorded = new Promise((resolve, reject) => {
      recorder.addEventListener("dataavailable", ({ data }) => chunks.push(data));
      recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type })));
      recorder.addEventListener("error", (event) => reject(new Error(`Video recording failed: ${event.error?.message}`)));
    });
    recorder.start();
    const start = performance.now();
    for (let frame = 0; frame <= 120; frame += 1) {
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, start + frame * (1000 / 30) - performance.now())));
      await draw(frame / 120);
    }
    recorder.stop();
    const blob = await recorded;
    for (const track of stream.getTracks()) track.stop();
    return { sprite: sheet.toDataURL("image/png").split(",")[1], video: Array.from(new Uint8Array(await blob.arrayBuffer())) };
  }, specimen);
  writeFileSync(join(directory, "sprite.png"), Buffer.from(media.sprite, "base64"));
  writeFileSync(join(directory, "specimen.webm"), Buffer.from(media.video));
} finally {
  await browser.close();
}

const value = (k) => ({ a: 0, k });
const rgb = (hex) => [...hex.matchAll(/[a-f0-9]{2}/gi)].map(([channel]) => parseInt(channel, 16) / 255);
const fill = (color) => ({ ty: "fl", c: value(rgb(color)), o: value(100), r: 1 });
const stroke = (color, width) => ({ ty: "st", c: value(rgb(color)), o: value(100), w: value(width), lc: 2, lj: 2 });
const transform = (position = [0, 0, 0]) => ({
  o: value(100), r: value(0), p: value(position), a: value([0, 0, 0]), s: value([100, 100, 100]),
});
const keyed = (states) => ({
  a: 1,
  k: states.map(([t, s], index) => index === states.length - 1 ? { t, s }
    : { t, s, e: states[index + 1][1], i: { x: 0.65, y: 1 }, o: { x: 0.35, y: 0 } }),
});
const layer = (ind, nm, ks, shapes) => ({ ddd: 0, ind, ty: 4, nm, sr: 1, ks, shapes, ip: 0, op: 120, st: 0, bm: 0 });
const path = (vertices, closed = false) => ({
  ty: "sh", ks: value({ i: vertices.map(() => [0, 0]), o: vertices.map(() => [0, 0]), v: vertices, c: closed }),
});
const letters = {
  A: [[[ -11, 12 ], [0, -14], [11, 12]], [[-7, 4], [7, 4]]],
  B: [[[-10, 12], [-10, -14], [3, -14], [10, -10], [10, -5], [3, -1], [-10, -1]], [[3, -1], [11, 3], [11, 8], [4, 12], [-10, 12]]],
  C: [[[11, -10], [4, -14], [-5, -14], [-11, -7], [-11, 6], [-5, 12], [4, 12], [11, 8]]],
  D: [[[-10, -14], [-10, 12], [2, 12], [11, 5], [11, -7], [2, -14], [-10, -14]]],
  E: [[[10, -14], [-10, -14], [-10, 12], [10, 12]], [[-10, -1], [7, -1]]],
  H: [[[-10, -14], [-10, 12]], [[10, -14], [10, 12]], [[-10, -1], [10, -1]]],
  L: [[[-10, -14], [-10, 12], [10, 12]]],
  N: [[[-10, 12], [-10, -14], [10, 12], [10, -14]]],
  P: [[[-10, 12], [-10, -14], [3, -14], [10, -8], [10, -3], [3, 1], [-10, 1]]],
  R: [[[-10, 12], [-10, -14], [3, -14], [10, -8], [10, -3], [3, 1], [-10, 1]], [[0, 1], [11, 12]]],
  S: [[[11, -10], [4, -14], [-4, -14], [-10, -9], [-10, -5], [9, 3], [10, 8], [4, 12], [-4, 12], [-11, 8]]],
  T: [[[-11, -14], [11, -14]], [[0, -14], [0, 12]]],
};
const layers = [];
for (const [index, name, x, y] of [[0, "A", 96, 174], [1, "B", 340, 104], [2, "C", 584, 174]]) {
  const ks = transform([x, y, 0]);
  if (name === "B") {
    ks.r = keyed([[0, [0]], [30, [9]], [60, [0]], [90, [-9]], [119, [0]]]);
    ks.s = keyed([[0, [100, 100, 100]], [60, [124, 124, 100]], [119, [100, 100, 100]]]);
  }
  layers.push(layer(index + 1, `Node ${name} / vector outlines`, ks, [
    ...[...{ A: "START", B: "SHAPE", C: "LAND" }[name]].map((letter, index, word) => ({
      ty: "gr", it: [
        ...letters[letter].map((vertices) => path(vertices)),
        stroke(name === "B" ? "ffb3a7" : "c6b7c2", 3.1),
        { ty: "tr", ...transform([(index - (word.length - 1) / 2) * 8.8, 22, 0]), s: value([32, 32, 100]) },
      ],
    })),
    { ty: "gr", it: [
      ...letters[name].map((vertices) => path(vertices)),
      stroke(name === "B" ? "ffb3a7" : "fff4ee", 2.7),
      { ty: "tr", ...transform([0, -9, 0]) },
    ] },
    { ty: "gr", it: [
      { ty: "rc", p: value([0, 0]), s: value([104, 100]), r: value(20) },
      fill(name === "B" ? "4a3038" : "302733"),
      stroke(name === "B" ? "ffb3a7" : "a38c9c", 1),
      { ty: "tr", ...transform() },
    ] },
  ]));
}
const route = {
  i: [[0, 0], [0, 0], [0, 15.46], [0, 0], [-15.46, 0], [0, 0], [0, -15.46], [0, 0], [-15.46, 0], [0, 0]],
  o: [[0, 0], [15.46, 0], [0, 0], [0, -15.46], [0, 0], [15.46, 0], [0, 0], [0, 15.46], [0, 0], [0, 0]],
  v: [[96, 174], [192, 174], [220, 146], [220, 132], [248, 104], [432, 104], [460, 132], [460, 146], [488, 174], [584, 174]],
  c: false,
};
layers.push(layer(4, "Route / trimmed accent", transform(), [
  { ty: "sh", ks: value(route) }, stroke("97ebe1", 4),
  { ty: "tm", s: value(0), e: keyed([[0, [0]], [100, [100]], [119, [100]]]), o: value(0), m: 1 },
]));
layers.push(layer(5, "Route / complete still", transform(), [{ ty: "sh", ks: value(route) }, stroke("8e7a8c", 3)]));
writeFileSync(join(directory, "specimen.lottie.json"), `${JSON.stringify({
  v: "5.13.0", fr: 30, ip: 0, op: 120, w: 680, h: 300,
  nm: "Motion Lab / original author-time vector keyframes", ddd: 0, assets: [], layers,
}, null, 2)}\n`);
console.log("Generated original 12-frame sprite, four-second VP9 clip, and Lottie vector keyframes.");
