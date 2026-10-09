# marp-demo

A playground for presentations built with [Marp](https://marp.app/): Markdown,
native SVG, and small, local JavaScript experiments.

**[Explore the site](https://chris-ayers.com/marp-demo/)** |
**[Open the presentation](https://chris-ayers.com/marp-demo/animated.html)** |
**[Download the PDF](https://chris-ayers.com/marp-demo/Animated-CICD.pdf)**

## The first demo

**From commit to confidence** is the only deck in this repository. Its four slides
introduce a delivery platform, explain the contract, run an interactive CI/CD
simulation, and show how to customize it.

On [slide 3](https://chris-ayers.com/marp-demo/animated.html#3), a commit flows through
a build, parallel tests and security checks, artifact publication, staging, a
manual approval gate, and progressive production rollout.

| Control | Behavior |
| --- | --- |
| Run / Pause / Resume | Control timed playback. |
| Step | Advance one stage; never bypass the approval gate. |
| Replay | Restart the selected scenario. |
| Approve release | Unlock production after staging succeeds. |
| Scenario | Choose a healthy run or failed tests that block downstream work. |
| Speed | Switch between 1x and 2x. |

The HTML starts playback when the simulation slide becomes active. Reduced-motion
users start manually; Step works without moving particles. Playback is suspended
while the slide or browser tab is hidden. Operate the controls in the **audience
window**: presenter previews remain static, and playback state is not synchronized
between windows. Use the arrow keys to navigate the four slides.

The PDF, print view, and JavaScript-disabled view retain the readable static SVG.
This is a simulation, not a connection to real CI/CD infrastructure.

## Build and preview locally

Use Node.js **24 LTS** (minimum 22.20) and npm:

```sh
npm ci
npx playwright install chromium
npm run build
npm run preview
```

Open **http://127.0.0.1:8080/marp-demo/**. The preview deliberately includes the
project URL prefix, just like GitHub Pages. Stop it with Ctrl+C. Re-run
`npm run build` after editing; the preview is not a file watcher. Set `PORT` to
choose another local port.

The lockfile pins the build tools. Both local builds and GitHub Actions run the
same `npm run build` command with **Marp CLI 4.5.1** and Playwright's Chromium.
On Linux, install browser system libraries with
`npx playwright install --with-deps chromium`. For PDF export, `CHROME_PATH` can
override Chromium with an installed Chrome/Chromium executable.

The build replaces the generated `build` directory and exports exactly:

```text
build/
  index.html
  animated.html
  Animated-CICD.pdf
  assets/animated-cicd.js
  themes/custom-default.css
  themes/animated-cicd.css
  .nojekyll
```

Keep this directory together when hosting or sharing the HTML: its runtime uses
the relative `assets/animated-cicd.js` path. No external fonts, icon CDN, or
animation library are required. Generated exports and dependencies are ignored
by Git.

Build only trusted Markdown and assets: HTML and local-file access are enabled
for this demo. Marp's current build-tool dependency tree has upstream `npm audit`
advisories, including archive-extraction issues. Compatible fixes are captured
in the lockfile; `npm audit fix --force` currently proposes an obsolete Marp
release, so it is not a safe upgrade path. These Node.js dependencies are not
deployed with the static site.

## Check the demo

After building, run:

```sh
npm test
```

The eight animation checks cover slide/SVG overflow, parallel stages, the approval
gate, timed playback and speed, failed tests, replay, particles, pause/resume,
hidden slides/tabs, reduced motion, keyboard controls, and print/presenter/no-JS
fallbacks. Site checks exercise the packaged HTML/PDF/assets and a responsive
single-deck landing page under `/marp-demo/`.

`ANIMATED_DECK_HTML` can target another local HTML export. To run the same browser
checks against a deployed site, use these PowerShell commands:

```powershell
$env:SITE_URL = "https://chris-ayers.com/marp-demo/"
$env:ANIMATED_DECK_URL = "$($env:SITE_URL)animated.html"
npm test
Remove-Item Env:SITE_URL, Env:ANIMATED_DECK_URL
```

`SITE_URL` must end with `/`. Only the local preview-server checks are skipped
when testing a deployment.

## Edit the three layers

| File | Purpose |
| --- | --- |
| [slides/Animated-CICD.md](slides/Animated-CICD.md) | Narrative, accessible SVG, and speaker notes. |
| [slides/assets/animated-cicd.js](slides/assets/animated-cicd.js) | Stages, timing, and interaction. |
| [slides/themes/animated-cicd.css](slides/themes/animated-cicd.css) | Scoped styling, motion, and print fallback. |
| [slides/themes/custom-default.css](slides/themes/custom-default.css) | Composes Marp's default theme with the demo theme. |
| [site/index.html](site/index.html) | The single-deck showcase page. |

Keep the `default` and `animated-cicd` imports in `custom-default.css`, and pass
the whole theme directory to Marp. Inline theme imports in Markdown are not a
replacement for this composition. The HTML export uses `--bespoke.osc=false`
so Marp's on-screen toolbar does not cover the simulation controls.

## Publish

[Publish marp-demo](.github/workflows/marp-pages.yml) builds and checks the site
on every push to `main` or a manual Actions run, then deploys `build` with the
official GitHub Pages actions. Repository **Settings > Pages > Source** must be
**GitHub Actions**. The current site inherits the account's `chris-ayers.com`
domain; the repository does not need a `CNAME` file.

The page uses relative asset and download links so the package also works under
the standard `https://codebytes.github.io/marp-demo/` project path. New demos can
be added later; no starter or placeholder decks are shipped.

## Attribution

MIT licensed, retaining **Copyright (c) 2023 Chris Ayers**. See [LICENSE](LICENSE).
The original demo comes from
[codebytes/marp-slides-template](https://github.com/codebytes/marp-slides-template).
Visual inspiration: [Awesome-Marp](https://github.com/favourhong/Awesome-Marp)
(typographic hierarchy, section labels, and card layouts). The SVG and animation
code are original; slide transitions use Marp's built-in fade.
