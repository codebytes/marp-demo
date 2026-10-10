import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "build");
const marp = fileURLToPath(import.meta.resolve("@marp-team/marp-cli/marp-cli.js"));
const browser = process.env.CHROME_PATH || chromium.executablePath();

if (!existsSync(browser)) {
  throw new Error("Chromium is missing. Run npx playwright install chromium, or set CHROME_PATH to a Chrome/Chromium executable.");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
copyFileSync(join(root, "site", "index.html"), join(output, "index.html"));
writeFileSync(join(output, ".nojekyll"), "");
for (const directory of ["assets", "themes"]) {
  cpSync(join(root, "slides", directory), join(output, directory), { recursive: true });
}
const lottiePackage = import.meta.resolve("lottie-web/package.json");
copyFileSync(fileURLToPath(new URL("build/player/lottie_light.min.js", lottiePackage)), join(output, "assets", "lottie.min.js"));
copyFileSync(fileURLToPath(new URL("LICENSE.md", lottiePackage)), join(output, "assets", "motion-lab", "LOTTIE-LICENSE.md"));

for (const [source, html] of [
  ["Animated-CICD", "animated.html"],
  ["Agent-Context", "agent-context.html"],
  ["Async-Await", "async-await.html"],
  ["Throttling", "throttling.html"],
  ["Motion-Lab", "motion-lab.html"],
]) {
  for (const [filename, options] of [
    [html, ["--bespoke.osc=false"]],
    [`${source}.pdf`, ["--pdf", "--allow-local-files"]],
  ]) {
    const result = spawnSync(process.execPath, [
      marp, "--no-stdin", "--html",
      "--theme-set", join(root, "slides", "themes"),
      ...options,
      "-o", join(output, filename),
      "--", join(root, "slides", `${source}.md`),
    ], {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, CHROME_PATH: browser },
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`Marp failed to export ${filename} (exit ${result.status}, signal ${result.signal}).`);
    }
  }
}

console.log("Built all presentations (HTML + PDF) and their local assets in build.");
