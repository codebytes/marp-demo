# marp-demo

A playground for presentations built with [Marp](https://marp.app/): Markdown,
native SVG, and small, local JavaScript experiments.

**[Explore the site](https://chris-ayers.com/marp-demo/)**

| Demo | Browser presentation | Static export |
| --- | --- | --- |
| **Await the work. Not the thread.** - .NET async/await, four slides | [HTML](https://chris-ayers.com/marp-demo/async-await.html) | [PDF](https://chris-ayers.com/marp-demo/Async-Await.pdf) |
| **From prompt to action** - agent context, six slides | [HTML](https://chris-ayers.com/marp-demo/agent-context.html) | [PDF](https://chris-ayers.com/marp-demo/Agent-Context.pdf) |
| **From commit to confidence** - CI/CD, four slides | [HTML](https://chris-ayers.com/marp-demo/animated.html) | [PDF](https://chris-ayers.com/marp-demo/Animated-CICD.pdf) |

## Await the work. Not the thread.

A synchronized .NET async/await animation with **execution and task lifetimes on
the left** and a **conceptual compiler state machine on the right**. The
[async lab on slide 3](https://chris-ayers.com/marp-demo/async-await.html#3) highlights
the active C# line, CPU activity, the awaited `Task<string>`, the method's returned
`Task<int>`, saved state, and the corresponding diagram node/edge from one snapshot.

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
  assets/agent-context.js
  assets/animated-cicd.js
  assets/async-await.js
  themes/agent-context.css
  themes/custom-default.css
  themes/animated-cicd.css
  themes/async-await.css
  .nojekyll
```

Keep this directory together when hosting or sharing the HTML: each runtime uses
its relative `assets/` path. No external fonts, icon CDN, or
animation library are required. Generated exports and dependencies are ignored
by Git.

Build only trusted Markdown and assets: HTML and local-file access are enabled
for these demos. Marp's current build-tool dependency tree has upstream `npm audit`
advisories, including archive-extraction issues. Compatible fixes are captured
in the lockfile; `npm audit fix --force` currently proposes an obsolete Marp
release, so it is not a safe upgrade path. These Node.js dependencies are not
deployed with the static site.

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

`ANIMATED_DECK_HTML`, `AGENT_DECK_HTML`, and `ASYNC_DECK_HTML` can target other local HTML exports.
To run the same browser checks against a deployed site:

```powershell
$env:SITE_URL = "https://chris-ayers.com/marp-demo/"
$env:ANIMATED_DECK_URL = "$($env:SITE_URL)animated.html"
$env:AGENT_DECK_URL = "$($env:SITE_URL)agent-context.html"
$env:ASYNC_DECK_URL = "$($env:SITE_URL)async-await.html"
npm test
Remove-Item Env:SITE_URL, Env:ANIMATED_DECK_URL, Env:AGENT_DECK_URL, Env:ASYNC_DECK_URL
```

`SITE_URL` must end with `/`. Only the local preview-server checks are skipped
when testing a deployment.

## Edit the three layers

| File | Purpose |
| --- | --- |
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
| [site/index.html](site/index.html) | The three-deck showcase page. |

Keep the `default` and `animated-cicd` imports in `custom-default.css`, and pass
the whole theme directory to Marp. Inline theme imports in Markdown are not a
replacement for this composition. The agent-context and async-await themes import
Marp's `default` directly and do not change the CI/CD theme. All HTML exports use
`--bespoke.osc=false` so Marp's on-screen toolbar does not cover the controls.

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
