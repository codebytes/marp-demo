# marp-demo

A playground for presentations built with [Marp](https://marp.app/): Markdown,
native SVG, and small, local JavaScript experiments.

[![The marp-demo showcase page: "Markdown. Meet motion." above the Style Lab card](docs/screenshots/showcase.webp)](https://chris-ayers.com/marp-demo/)

**[Explore the site](https://chris-ayers.com/marp-demo/)**

| Preview | Demo | Browser presentation | Static export |
| --- | --- | --- | --- |
| <a href="https://chris-ayers.com/marp-demo/style-lab.html"><img src="docs/screenshots/style-lab-cover.webp" width="240" alt="Style Lab title slide: Same words. Different worlds. in four typefaces above eight style swatches."></a> | **Style Lab** - one slide of HTML, eight visual styles, thirteen slides | [HTML](https://chris-ayers.com/marp-demo/style-lab.html) | [PDF](https://chris-ayers.com/marp-demo/Style-Lab.pdf) |
| <a href="https://chris-ayers.com/marp-demo/motion-lab.html"><img src="docs/screenshots/motion-lab-cover.webp" width="240" alt="Motion Lab title slide: Same diagram. Different verbs."></a> | **Motion Lab** - one diagram, nine animation techniques, twelve slides | [HTML](https://chris-ayers.com/marp-demo/motion-lab.html) | [PDF](https://chris-ayers.com/marp-demo/Motion-Lab.pdf) |
| <a href="https://chris-ayers.com/marp-demo/throttling.html"><img src="docs/screenshots/throttling-cover.webp" width="240" alt="Throttle the burst, frame 1: a full three-token bucket meets four arriving requests."></a> | **Throttle the burst** - token-bucket admission, seven slide keyframes | [HTML](https://chris-ayers.com/marp-demo/throttling.html) | [PDF](https://chris-ayers.com/marp-demo/Throttling.pdf) |
| <a href="https://chris-ayers.com/marp-demo/async-await.html"><img src="docs/screenshots/async-await-cover.webp" width="240" alt="Await the work. Not the thread. title slide with a run, suspend, and resume timeline."></a> | **Await the work. Not the thread.** - .NET async/await, four slides | [HTML](https://chris-ayers.com/marp-demo/async-await.html) | [PDF](https://chris-ayers.com/marp-demo/Async-Await.pdf) |
| <a href="https://chris-ayers.com/marp-demo/agent-context.html"><img src="docs/screenshots/agent-context-cover.webp" width="240" alt="From prompt to action title slide with instruction, skill, prompt, and tool-result cards."></a> | **From prompt to action** - agent context, six slides | [HTML](https://chris-ayers.com/marp-demo/agent-context.html) | [PDF](https://chris-ayers.com/marp-demo/Agent-Context.pdf) |
| <a href="https://chris-ayers.com/marp-demo/animated.html"><img src="docs/screenshots/animated-cicd-cover.webp" width="240" alt="From commit to confidence title slide with a commit, verify, and release path."></a> | **From commit to confidence** - CI/CD, four slides | [HTML](https://chris-ayers.com/marp-demo/animated.html) | [PDF](https://chris-ayers.com/marp-demo/Animated-CICD.pdf) |

## Style Lab

**Same words. Different worlds.** In the spirit of the
[CSS Zen Garden](https://www.csszengarden.com/), every style slide repeats one
byte-identical HTML specimen: a kicker, headline, dek, three steps, a stat, and a
note. Only one class on its stage changes. The house style of the other decks is
the control; seven departures change type, color, texture, layout, and motion,
not just the palette.

[![Eight versions of the same "Good ideas travel in small steps." slide: house style, risograph zine, Swiss poster, neo-brutalist, sketchnote, blueprint, broadsheet, and LaTeX Beamer](docs/screenshots/style-lab-styles.webp)](https://chris-ayers.com/marp-demo/style-lab.html#3)

*The same markup on all eight style slides.*

| Slide | Style | What the CSS does |
| --- | --- | --- |
| 3 | House style | Dark panels, system UI type, thin borders, and one mint accent: the control. |
| 4 | Risograph zine | Two fluorescent inks overprint with `mix-blend-mode: multiply`; the headline's second, misregistered ink comes from `attr(data-text)`. Halftone dots and grain are CSS gradients and an SVG noise filter. |
| 5 | Swiss poster | A strict column grid, a heavy grotesque, signal red, and the stat set as one large circle. |
| 6 | Neo-brutalist | Loud flat color, thick outlines, hard `box-shadow` offsets, CSS counters, and a rotated sticker. |
| 7 | Sketchnote | Dot-grid paper, marker lettering, a thick `text-decoration` highlighter, slightly rotated cards, and a taped sticky note. |
| 8 | Blueprint | A drafting grid, numbered callouts, a dimension line, and a title block; labels such as `QTY` are generated content. |
| 9 | Editorial broadsheet | A blackletter nameplate, a news serif, ruled columns, ears, and generated dashes and end mark. |
| 10 | LaTeX Beamer | A frame-title bar, a theorem block, triangle bullets, a footline, and Computer Modern Sans. |

Each style slide also has its own entrance and leaves through a different Marp
transition: star, wipe, drop, flip, clockwise, cover, push, and fade.
Decorative labels and glyphs use CSS generated content with empty alternative
text, so assistive technology reads only the shared words. Every style's text
colors meet WCAG AA contrast.

On [slide 11](https://chris-ayers.com/marp-demo/style-lab.html#11), eight
buttons restyle the same specimen live. The runtime swaps the stage class inside
`document.startViewTransition()`, and temporary `view-transition-name` values let
each element move from its old box to its new one while the rendering
cross-fades. The names exist only during a switch, so Marp's slide transitions
are unaffected.

[![The live restyle slide mid-morph from house style to Swiss poster: the headline, steps, and red stat circle are still moving into place beside eight style buttons](docs/screenshots/style-lab-live.webp)](https://chris-ayers.com/marp-demo/style-lab.html#11)

*Caught mid-morph from the house style to the Swiss poster.*

Slide 12 maps every official place a Marp style can live: theme CSS (`@theme`,
`@import`, pagination, Marp Core's `@size` and `@auto-scaling`), Markdown
directives and `<style scoped>`, built-in color classes, and custom transitions.
Levers this deck actually uses are checked, and the slide demonstrates its own
`<style scoped>` rule. For finished themes, start with
[awesome-marp](https://github.com/marp-team/awesome-marp),
[Marp Community Themes](https://rnd195.github.io/marp-community-themes/), the
[Marp Template Library](https://yoanbernabeu.github.io/MARP-Template-Library/),
and the [built-in themes](https://github.com/marp-team/marp-core/blob/main/themes/README.md).

Type is part of each style, so the deck bundles **17 unmodified WOFF2 files from
11 open font families** (about 0.5 MB) with their licenses. The HTML and PDF
render the same fonts on any machine, including the Linux Pages runner, with no
font CDN. Textures are CSS gradients, blend modes, and SVG data URIs; the deck
contains no raster images. The PDF has all **thirteen pages** at about 1.7 MB:
it omits the film grain, which Chromium would rasterize on every page, and keeps
the authored house style on the live slide.

Reduced motion switches styles instantly and skips entrances. Print,
presenter, and no-JavaScript views keep the authored house style and hide the
buttons, which appear only in the audience window. The live morph is verified in
Chromium; browsers without View Transitions still switch styles.

## Motion Lab

**Same diagram. Different verbs.** A neutral three-node specimen stays the same
while eight in-slide experiments change how it moves. A two-slide morph then
rearranges those same objects. This is a comparison of **animation techniques**,
not another engineering simulation.

[![Nine panels of the same A, B, C diagram: eight experiments paused mid-run, each moving it differently, and the morph's enlarged B](docs/screenshots/motion-lab-techniques.webp)](https://chris-ayers.com/marp-demo/motion-lab.html#2)

*Eight experiments paused mid-run, plus the focus state the morph moves B into.*

| Slides | Technique | What actually animates |
| --- | --- | --- |
| 2 | CSS choreography | Shared keyframes lift/highlight A, B, then C using staggered delays. |
| 3 | SVG stroke drawing | CSS changes `stroke-dashoffset` on a normalized SVG path. |
| 4 | Declarative SVG motion | Native `animateMotion` carries a signal along the route. |
| 5 | Masks/wipes | CSS moves a soft gradient mask across colored ink; labels remain visible. |
| 6 | CSS 3D | A perspective plane tilts and B lifts along its z-axis. |
| 7 | Sprite animation | CSS `steps(11, end)` advances a real twelve-cell PNG filmstrip. |
| 8 | Pre-rendered video | A local, silent VP9 WebM plays the same authored gesture at 30 fps. |
| 9 | Authored vectors / Lottie | Local Lottie JSON stores shape layers, rotation/scale keyframes, and a trimmed stroke; the SVG player interpolates them. |
| 10-11 | Shared-element morphing | Marp matches three unique `view-transition-name` values across two complete layouts. |

Each in-slide experiment starts with **Play once**, lasts about four seconds, and offers
**Pause / Resume** and **Replay**. It does not autoplay or loop. Leaving a slide
or hiding the tab pauses it; returning leaves it paused until you resume.
On [the morph pair](https://chris-ayers.com/marp-demo/motion-lab.html#10),
the right/left arrows animate the same cards forward/backward. The connector
cross-fades: this is element-geometry morphing, **not SVG path interpolation**.

CSS and native SVG perform the early examples' interpolation. Sprites and video
are pre-rendered pixels; Lottie uses its **JavaScript vector renderer**. The shared
script manages native CSS playback controls, separate SVG/media/player clocks, completion
events, and visibility rather than recreating all effects in an animation loop.
That is **not** a claim of zero JavaScript: Marp and playback controls also use it.
CSS `animation-play-state` cannot pause SMIL, so the SVG example explicitly uses
`pauseAnimations()` and `unpauseAnimations()`.
For CSS, Pause also holds the native animation's current time synchronously;
a hidden Marp SVG can otherwise defer a style-only pause until another paint.

Reduced motion, print, no-JavaScript, and presenter views keep complete static
diagrams and hide playback controls. Printing mid-animation restores the authored
still rather than capturing a half-drawn line, partial mask, or tilted plane.
The PDF has all **twelve full pages**. Morphing is verified in Chromium, not claimed
identical across browsers; Marp documents Safari's SVG/foreignObject limitations.
Browsers without View Transitions still navigate to the complete slide states.
VP9 decoding and Lottie feature support can also vary by browser/player. Media
and player failures are reported, not silently presented as successful playback.
Use the HTTP preview or Pages for the Lottie JSON, not a `file://` URL.
Mechanisms, tradeoffs, and MDN/Marp/Lottie references are in the slides and notes.
Marp's built-in **cover** and **slide** transitions, plus a custom **clip-path
aperture**, make the slide boundaries part of the comparison as well.

The sprite, silent video, static SVG, and vector composition are original artwork,
not third-party downloads. `npm run motion:assets` regenerates the twelve-cell
PNG, roughly four-second WebM, and Lottie JSON from
`slides/assets/motion-lab/specimen.svg` and the author-time definitions in
`scripts/generate-motion-assets.mjs`, using the locked Chromium tooling.
The Lottie composition is hand-authored keyframe data, not an After Effects export.
Generated assets are committed; normal builds copy them rather than re-recording.
The clip's exact encoding/timing can vary slightly across Chromium/host versions.

## Throttle the burst

This deck demonstrates a different animation technique: **each slide is a complete
keyframe**, and **native Marp morph transitions** connect them. Use the arrow keys
to advance or rewind. Requests and tokens retain the same `view-transition-name`
across slides, so Marp animates changes to their position, size, and appearance.
There is **no custom runtime, autoplay, or within-slide animation**.

<p>
  <a href="https://chris-ayers.com/marp-demo/throttling.html#1"><img src="docs/screenshots/throttling-frame-1.webp" width="49%" alt="Frame 1: a full bucket of three tokens meets four arriving requests, A through D."></a>
  <a href="https://chris-ayers.com/marp-demo/throttling.html#4"><img src="docs/screenshots/throttling-frame-4.webp" width="49%" alt="Frame 4: A, B, and C are admitted, the bucket is empty, and D is rejected with 429 Too Many Requests."></a>
</p>

*Frames 1 and 4: the same named requests and tokens, rearranged one keyframe at a time.*

The seven frames illustrate a token bucket with **capacity 3**, **one new token
per second**, **one token per admission**, and **no waiting queue**:

| Frame | State |
| --- | --- |
| 1 | A full bucket meets four arrivals. |
| 2 | A is admitted; two tokens remain. |
| 3 | B and C are admitted; the bucket is empty. |
| 4 | D is rejected with an illustrative `429` and `Retry-After: 1`. |
| 5 | The clock reaches one second; a new token and a new client attempt D2 appear. |
| 6 | D2 spends the refill token and is admitted. |
| 7 | Idle time refills the bucket, but never beyond its capacity of three. |

The admitted lane is **history, not concurrent execution**. Tokens replenish with
time, not request completion. A rejected request is not secretly queued, and its
retry is a new attempt that must pass admission again. HTTP 429/Retry-After are
chosen responses here, not universal framework defaults or a promise that every
retry succeeds. The clock and policy are illustrative, not live measurements.

Every PDF page preserves its complete state, labels, and token accounting.
For reusable examples of this authoring method, compare the repeated objects in
[Throttling.md](slides/Throttling.md) with the named morph selectors in
[throttling.css](slides/themes/throttling.css).

## Await the work. Not the thread.

A synchronized .NET async/await animation with **execution and task lifetimes on
the left** and a **conceptual compiler state machine on the right**. The
[async lab on slide 3](https://chris-ayers.com/marp-demo/async-await.html#3) highlights
the active C# line, CPU activity, the awaited `Task<string>`, the method's returned
`Task<int>`, saved state, and the corresponding diagram node/edge from one snapshot.

[![The async lab suspended at await: line 3 is highlighted, the CPU lane says no thread is held, both tasks are pending, and the Save + suspend node is active](docs/screenshots/async-await-lab.webp)](https://chris-ayers.com/marp-demo/async-await.html#3)

*Stepped to the pending read: the method is suspended, and no thread waits for the I/O.*

Use **Run / Pause / Resume**, **Step**, **Replay**, and **1x / 2x** speed. Compare:

| Read task | What the animation demonstrates |
| --- | --- |
| **I/O pending** | Save the awaiter/resume point, return control, then resume after the read completes. No dedicated thread waits for this I/O. |
| **Already complete** | Skip suspension entirely. This example finishes synchronously and returns an already-completed count task. |
| **I/O fails** | Resume, observe the error at `GetResult`, and fault the method's returned task. |

The code counts the characters in `"hello"` (result: `5`). The sample was checked
with .NET 10, including its pending, completed, and faulted task behavior. The deck
itself is a browser-only simulation: it does not run .NET, fetch data, or report
real timings. The state diagram is conceptual, not an exact generated field dump.
The execution lane does not claim a fixed thread identity or a forced thread hop;
context capture, scheduling races, and cancellation are outside its scope.

PDF/print/no-JS/presenter views keep the code, both task descriptions, and a neutral
all-paths state diagram, regardless of the selected scenario or playback position.
The [C# await reference](https://learn.microsoft.com/dotnet/csharp/language-reference/operators/await)
and the [task-based async model](https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model)
ground the story; further sources and caveats are in the speaker notes.

## From prompt to action

An animation-first tour of the inputs to an agent's next turn: instructions,
the user's prompt, progressively loaded skills, tool definitions, and returned
evidence. Native Marp **fade, cover, reveal, slide, and glow** transitions connect
the ideas. A named context window **morphs** between the opening slides; layered
cards, skill reveals, and animated request/result paths explain the relationships.

The [context lab on slide 5](https://chris-ayers.com/marp-demo/agent-context.html#5)
has two fictional scenarios: **Build a feature** and **Debug a failure**. Use
**Run / Pause / Resume**, **Step**, **Replay**, and **1x / 2x** speed to follow
the sequence. Definitions become available before a call; evidence appears only
after its result. The lab starts manually, even without reduced-motion enabled.

[![The context lab at step 5 of 6: instructions, prompt, skill, tool definitions, and the tool result fill the context while the result returns from tool to model](docs/screenshots/agent-context-lab.webp)](https://chris-ayers.com/marp-demo/agent-context.html#5)

*Step 5 of 6 in "Build a feature": the tool result joins the context as evidence.*

No real model or tool is invoked. This is an educational orchestration diagram,
not private reasoning or a trace of a particular product. Its last step means
"inputs ready for the next turn," not "coding task completed." Skill loading and
tool flow are grounded in the
[Agent Skills specification](https://agentskills.io/specification) and
[MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools);
source links and caveats are retained in the speaker notes.

The PDF is intentionally static: all cards and diagrams are complete, the lab
shows a labeled feature-task snapshot, and the final slide keeps both the noisy
and curated context compositions. Printing during a different running scenario
still uses this authored snapshot, not a half-finished animation frame.

## From commit to confidence

Four slides introduce a delivery platform, explain the contract, run an interactive
CI/CD simulation, and show how to customize it.

On [slide 3](https://chris-ayers.com/marp-demo/animated.html#3), a commit flows through
a build, parallel tests and security checks, artifact publication, staging, a
manual approval gate, and progressive production rollout.

[![The CI/CD simulation awaiting approval: commit, build, tests, security, artifact, and staging passed, production is locked, and Approve release is highlighted](docs/screenshots/animated-cicd-lab.webp)](https://chris-ayers.com/marp-demo/animated.html#3)

*Stepped to the approval gate: staging is healthy, and production waits for a person.*

| Control | Behavior |
| --- | --- |
| Run / Pause / Resume | Control timed playback. |
| Step | Advance one stage; never bypass the approval gate. |
| Replay | Restart the selected scenario. |
| Approve release | Unlock production after staging succeeds. |
| Scenario | Choose a healthy run or failed tests that block downstream work. |
| Speed | Switch between 1x and 2x. |

The CI/CD simulation starts playback when its slide becomes active. Reduced-motion
users start manually; Step works without moving particles.

The PDF, print view, and JavaScript-disabled view retain the readable static SVG.
This is a simulation, not a connection to real CI/CD infrastructure.

## Presenting the decks

Use the arrow keys to navigate. Operate interactive controls in the **audience
window**: presenter and next-slide previews remain static, and playback state is
not synchronized between windows. Running playback is suspended while a slide
or the browser tab is hidden. Reduced-motion preferences disable the custom
motion; Marp reduces slide transitions to a fade.

Decorative cover signals, floating context cards, the selected-skill glow, and
the tool call/result flow loop while their slide is active and visible. Text/card
entrances still play once per entry, and interactive simulations do not restart
automatically when they finish. Hidden slides/tabs, presenter views, reduced
motion, and PDF/print output do not run decorative loops.

Slide transitions use the browser's View Transition API. Unsupported browsers
still navigate normally. Morphing is best viewed in current Chrome or Edge;
[Marp documents Safari limitations](https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md#morphing-animations).
All content remains understandable without animation or JavaScript.
The throttling deck deliberately uses navigation-only morphs. Motion Lab uses
manual, finite technique experiments and a navigation-only morph pair; it never
joins the other decks' decorative loops. Style Lab's entrances play once per
visit, and its live restyle runs only when you choose a style.

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
The Actions build pins Ubuntu 22.04 so Chromium can keep its sandbox enabled.
On newer Ubuntu hosts with AppArmor restrictions on downloaded browsers, use
`CHROME_PATH` with system-installed Chrome rather than disabling its sandbox.

The build replaces the generated `build` directory and exports exactly:

```text
build/
  index.html
  agent-context.html
  Agent-Context.pdf
  animated.html
  Animated-CICD.pdf
  async-await.html
  Async-Await.pdf
  motion-lab.html
  Motion-Lab.pdf
  style-lab.html
  Style-Lab.pdf
  throttling.html
  Throttling.pdf
  assets/agent-context.js
  assets/animated-cicd.js
  assets/async-await.js
  assets/motion-lab.js
  assets/lottie.min.js
  assets/motion-lab/specimen.svg
  assets/motion-lab/specimen.webm
  assets/motion-lab/specimen.lottie.json
  assets/motion-lab/sprite.png
  assets/motion-lab/LOTTIE-LICENSE.md
  assets/style-lab.js
  assets/style-lab/fonts/*.woff2      (17 files)
  assets/style-lab/fonts/LICENSE.md
  themes/agent-context.css
  themes/custom-default.css
  themes/animated-cicd.css
  themes/async-await.css
  themes/motion-lab.css
  themes/style-lab.css
  themes/throttling.css
  .nojekyll
```

Keep this directory together when hosting or sharing the HTML: each runtime uses
its relative `assets/` path. No external fonts or CDN are required; Style Lab's
fonts ship beside it with their SIL Open Font License and Apache 2.0 texts. Only Motion
Lab's authored-vector example adds a player: **lottie-web 5.13.0**, locked in npm
and packaged locally with its MIT license. Its dependency advisory check found no
known GitHub advisories for that version when added. Generated site exports and
dependencies are ignored by Git; the original motion media is tracked.
The throttling HTML is self-contained and has no custom runtime asset.

Build only trusted Markdown and assets: HTML and local-file access are enabled
for these demos. Marp's current build-tool dependency tree has upstream `npm audit`
advisories, including archive-extraction issues. Compatible fixes are captured
in the lockfile; `npm audit fix --force` currently proposes an obsolete Marp
release, so it is not a safe upgrade path. Marp's build-tool Node.js dependencies
are not deployed; the separately pinned Lottie browser player is shipped only
for Motion Lab.

## Check the demos

After building, run:

```sh
npm test
```

The CI/CD checks cover slide/SVG overflow, parallel stages, the approval
gate, timed playback and speed, failed tests, replay, particles, pause/resume,
hidden slides/tabs, reduced motion, keyboard controls, and print/presenter/no-JS
fallbacks. Agent-context checks exercise native transitions and morphing, card
visibility, definitions-before-results, both scenarios, playback, keyboard
controls, visibility/reduced-motion behavior, and deterministic static fallbacks.
Async/await checks assert state-machine, code, and task-lane synchronization across
all three paths, including the thread-free I/O wait and the no-suspension fast path.
Site checks exercise all packaged HTML/PDF exports and the responsive landing
page under `/marp-demo/`.
Decorative-motion checks wait beyond a complete loop to confirm that the visuals
keep moving, then check hidden-slide/tab, reduced-motion, and print behavior.
Throttling checks validate all seven accounting snapshots, real named morphs,
forward/backward navigation, static states between transitions, and print/no-JS
output.
Motion Lab checks measure actual changing transforms, dash offsets, masks, SVG
signal geometry, discrete sprite frames, decoded video pixels, rendered Lottie
vectors, and named transition geometry. They cover finite completion, replay/pause,
hidden slides/tabs, keyboard controls, transitions, static fallbacks, and slide fit.
Style Lab checks confirm that every style slide carries the identical specimen,
that each style renders its bundled fonts rather than platform fallbacks, and that
text never overflows or collides. They compute WCAG AA contrast for every style,
including each gradient's brightest wash and the text on the risograph inks, which
must also stay clear of the overprints. They confirm that every entrance rule
reaches a real part with its intended delay and ends exactly in the authored still.
They also run the live morph from the mouse and keyboard, where arrow keys still
change slides from a focused button. Reduced motion, transitions, print, presenter,
and no-JS fallbacks are covered, as are PDF pages and size and a license entry for
every font file.
README checks confirm every captured screenshot is shown, exists, and has alt text.

`ANIMATED_DECK_HTML`, `AGENT_DECK_HTML`, `ASYNC_DECK_HTML`, and `THROTTLE_DECK_HTML`
can target other local HTML exports. Motion Lab checks use the HTTP preview so
the Lottie JSON loads under normal browser origin rules; `MOTION_DECK_URL` can
target another HTTP preview. Style Lab checks also use the HTTP preview, for its
fonts; `STYLE_DECK_URL` can target another one.
To run the same browser checks against a deployed site:

```powershell
$env:SITE_URL = "https://chris-ayers.com/marp-demo/"
$env:ANIMATED_DECK_URL = "$($env:SITE_URL)animated.html"
$env:AGENT_DECK_URL = "$($env:SITE_URL)agent-context.html"
$env:ASYNC_DECK_URL = "$($env:SITE_URL)async-await.html"
$env:THROTTLE_DECK_URL = "$($env:SITE_URL)throttling.html"
$env:MOTION_DECK_URL = "$($env:SITE_URL)motion-lab.html"
$env:STYLE_DECK_URL = "$($env:SITE_URL)style-lab.html"
npm test
Remove-Item Env:SITE_URL, Env:ANIMATED_DECK_URL, Env:AGENT_DECK_URL, Env:ASYNC_DECK_URL, Env:THROTTLE_DECK_URL, Env:MOTION_DECK_URL, Env:STYLE_DECK_URL
```

`SITE_URL` must end with `/`. Only the local preview-server checks are skipped
when testing a deployment.

## Refresh the README screenshots

The images in [docs/screenshots](docs/screenshots) are captured from the built
site. After `npm run build`, run:

```sh
npm run screenshots
```

The script serves `build` under `/marp-demo/`, opens each deck in Playwright's
Chromium, and replaces `docs/screenshots` with WebP files only after every capture
succeeds. Labs are advanced with **Step** under reduced motion, so each image shows
a fixed state rather than a moment of timed playback. Motion Lab experiments are
paused, then their clocks are moved to two seconds (3.2 seconds for the SVG signal,
which B covers at two). The video plays to that frame instead, because the preview
server does not support seeking. The Style Lab grid composes its eight style
slides, and the live capture pauses the restyle's view-transition animations
330 ms into a switch to Swiss, so the image shows the morph in motion with crisp
text. Fonts and video timing can differ slightly by host.
The screenshots are tracked in Git but are not part of the published site.

## Edit the three layers

| File | Purpose |
| --- | --- |
| [slides/Style-Lab.md](slides/Style-Lab.md) | The shared specimen on eight style slides, the live restyle, the Marp levers map, and sourced notes. |
| [slides/themes/style-lab.css](slides/themes/style-lab.css) | Bundled `@font-face` rules, the gallery frame, all eight styles, entrances, and print rules. |
| [slides/assets/style-lab.js](slides/assets/style-lab.js) | Font preloading, entrance activation, and the live View Transition restyle. |
| [slides/assets/style-lab/fonts](slides/assets/style-lab/fonts) | Unmodified open-licensed WOFF2 files and their license texts. |
| [PRODUCT.md](PRODUCT.md) | Audience, purpose, and design constraints for the demos, including WCAG AA contrast. |
| [slides/Motion-Lab.md](slides/Motion-Lab.md) | Shared specimen, nine techniques, two morph states, and mechanism notes. |
| [slides/themes/motion-lab.css](slides/themes/motion-lab.css) | Scoped `ml` design, CSS keyframes/mask/3D, native morph names, and static states. |
| [slides/assets/motion-lab.js](slides/assets/motion-lab.js) | Manual playback, CSS/SMIL/media/Lottie clocks, slide visibility and accessibility. |
| [scripts/generate-motion-assets.mjs](scripts/generate-motion-assets.mjs) | Original frame/video production and author-time Lottie keyframes; not a slide runtime. |
| [slides/assets/motion-lab](slides/assets/motion-lab) | Original specimen SVG, sprite, video, and Lottie composition. |
| [slides/Throttling.md](slides/Throttling.md) | Seven complete token-bucket keyframes, stable object names, and notes. |
| [slides/themes/throttling.css](slides/themes/throttling.css) | Frame layouts and native morph names; no timed animation. |
| [slides/Async-Await.md](slides/Async-Await.md) | C# example, synchronized execution/state diagram, static views, and notes. |
| [slides/assets/async-await.js](slides/assets/async-await.js) | Three await paths and a single snapshot driving all animated panels. |
| [slides/themes/async-await.css](slides/themes/async-await.css) | Scoped task lanes, state-machine styling, motion, and print reset. |
| [slides/Agent-Context.md](slides/Agent-Context.md) | Agent-context story, accessible visuals, transitions, notes, and static snapshots. |
| [slides/assets/agent-context.js](slides/assets/agent-context.js) | Context-lab scenarios, sequencing, and playback. |
| [slides/themes/agent-context.css](slides/themes/agent-context.css) | Scoped visual compositions, morph naming, motion, and print styles. |
| [slides/Animated-CICD.md](slides/Animated-CICD.md) | Narrative, accessible SVG, and speaker notes. |
| [slides/assets/animated-cicd.js](slides/assets/animated-cicd.js) | Stages, timing, and interaction. |
| [slides/themes/animated-cicd.css](slides/themes/animated-cicd.css) | Scoped styling, motion, and print fallback. |
| [slides/themes/custom-default.css](slides/themes/custom-default.css) | Composes Marp's default theme with the demo theme. |
| [site/index.html](site/index.html) | The six-deck showcase page. |
| [scripts/capture-screenshots.mjs](scripts/capture-screenshots.mjs) | README screenshots: fixed lab states, paused Motion Lab clocks, the Style Lab grid and frozen morph, and WebP output. |

Keep the `default`, `animated-cicd`, and `motion-lab` imports in `custom-default.css`, and pass
the whole theme directory to Marp. Inline theme imports in Markdown are not a
replacement for this composition. The agent-context, async-await, style-lab, and throttling themes import
Marp's `default` directly and do not change the CI/CD theme. All HTML exports use
`--bespoke.osc=false` so Marp's on-screen toolbar does not cover the controls.
Motion Lab uses the required `custom-default` theme and opt-in `ml` selectors;
its companion stylesheet does not restyle CI/CD. Edit the common specimen
consistently across the examples, and keep each morph name unique within a slide.

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
The original CI/CD demo comes from
[codebytes/marp-slides-template](https://github.com/codebytes/marp-slides-template).
Visual inspiration: [Awesome-Marp](https://github.com/favourhong/Awesome-Marp)
(typographic hierarchy, section labels, and card layouts). The SVG and animation
code are original; slide transitions and morphing use Marp's native support.
The locally packaged [Lottie player](https://github.com/airbnb/lottie-web/tree/v5.13.0)
is MIT licensed, Copyright (c) 2015 Bodymovin; its license is copied beside the
published Motion Lab assets. All example media/compositions are original and
covered by this repository's MIT license.

Style Lab's premise follows Dave Shea's [CSS Zen Garden](https://www.csszengarden.com/).
Its styles are original CSS: the Beamer style is inspired by LaTeX Beamer and the
community themes collected in [awesome-marp](https://github.com/marp-team/awesome-marp),
but copies no theme code. The bundled fonts keep their own licenses, listed per
file with full texts in
[slides/assets/style-lab/fonts/LICENSE.md](slides/assets/style-lab/fonts/LICENSE.md):
Archivo, Barlow Condensed, Bricolage Grotesque, CMU Sans Serif, Dela Gothic One,
Hanken Grotesk, JetBrains Mono, Kalam, Old Standard TT, and UnifrakturMaguntia
under the SIL Open Font License 1.1, and Special Elite under the Apache License
2.0. They are not covered by this repository's MIT license.
