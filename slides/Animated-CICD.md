---
marp: true
lang: en
theme: custom-default
paginate: true
math: mathjax
title: From commit to confidence
description: An interactive CI/CD platform story with local JavaScript and SVG animation.
transition: fade 350ms
---

<!-- _class: lead invert cicd cicd-cover -->
<!-- _paginate: skip -->

<div class="cicd-cover-copy">

<p class="cicd-eyebrow">PLATFORM ENGINEERING / IN MOTION</p>

# From commit<br> to confidence.

<p class="cicd-deck-subtitle">Don't just describe the delivery path.<br>Let people follow it.</p>

<p class="cicd-cover-tags"><span>Markdown</span><span>SVG</span><span>JavaScript</span></p>

</div>

<div class="cicd-hero">
  <div class="cicd-hero-heading"><span class="cicd-status-light"></span> DELIVERY SYSTEM <span>DEMO / 0142</span></div>
  <svg class="cicd-hero-map" viewBox="0 0 420 310" role="img" aria-labelledby="hero-title hero-desc">
    <title id="hero-title">A connected delivery system</title>
    <desc id="hero-desc">A source commit flows through verification and into a release. Moving light traces the delivery path in the HTML presentation.</desc>
    <path class="cicd-hero-rail" d="M64 74 H190 Q210 74 210 94 V216 Q210 236 230 236 H356"/>
    <path class="cicd-hero-signal" d="M64 74 H190 Q210 74 210 94 V216 Q210 236 230 236 H356"/>
    <circle class="cicd-hero-halo" cx="64" cy="74" r="32"/>
    <circle class="cicd-hero-point" cx="64" cy="74" r="10"/>
    <rect class="cicd-hero-core" x="166" y="112" width="88" height="88" rx="24"/>
    <path class="cicd-hero-check" d="m190 156 14 14 29-30"/>
    <circle class="cicd-hero-halo" cx="356" cy="236" r="32"/>
    <circle class="cicd-hero-point" cx="356" cy="236" r="10"/>
    <text x="64" y="134" text-anchor="middle">COMMIT</text>
    <text x="282" y="158">VERIFY</text>
    <text x="356" y="296" text-anchor="middle">RELEASE</text>
  </svg>
  <div class="cicd-hero-caption"><span>One artifact.</span><span>A visible path to production.</span></div>
</div>

<p class="cicd-bottomline">AN INTERACTIVE MARP EXPERIMENT <span>Use the arrow keys to explore</span></p>

<script src="assets/animated-cicd.js" defer></script>

<!--
This is a simulated delivery platform, not a connection to real CI/CD infrastructure.
The moving signal is decorative; the third slide contains the working simulation.
Use the exported HTML in a browser. PDF and PowerPoint exports are static.
-->

---

<!-- _class: invert cicd -->

<p class="cicd-eyebrow">01 / THE PLATFORM CONTRACT</p>

## Build once. Earn the right to ship.

<p class="cicd-subtitle">The platform turns a change into evidence, then into a release.</p>

<div class="cicd-contracts">
  <article class="cicd-contract">
    <span class="cicd-card-number">01</span>
    <p class="cicd-card-label">CREATE</p>
    <h3>One immutable artifact.</h3>
    <p>Compile once. Sign the result. Keep the same identity across environments.</p>
    <div class="cicd-mini-track"><span>source</span><i></i><span>image</span></div>
  </article>
  <article class="cicd-contract">
    <span class="cicd-card-number">02</span>
    <p class="cicd-card-label">VERIFY</p>
    <h3>Independent evidence.</h3>
    <p>Run tests and security checks in parallel. Both must pass before promotion.</p>
    <div class="cicd-mini-track"><span>tests</span><i></i><span>policy</span></div>
  </article>
  <article class="cicd-contract">
    <span class="cicd-card-number">03</span>
    <p class="cicd-card-label">PROMOTE</p>
    <h3>A deliberate release.</h3>
    <p>Validate in staging. Approve the gate. Increase production traffic gradually.</p>
    <div class="cicd-mini-track"><span>staging</span><i></i><span>production</span></div>
  </article>
</div>

<p class="cicd-takeaway"><span>THE KEY IDEA</span> Promotion moves the artifact, not a new build.</p>

<!--
This is an illustrative platform contract, not a claim that every organization needs
a manual approval. Automated policy gates can serve the same purpose.
The demo deliberately models tests and security as independent checks.
Introduce the three responsibilities, then move to the live delivery path.
-->

---

<!-- _class: invert cicd cicd-demo -->

<p class="cicd-eyebrow">02 / FOLLOW THE ARTIFACT <span>INTERACTIVE SIMULATION</span></p>

## Watch the platform work.

<p class="cicd-subtitle">Parallel checks. A human gate. A progressive release.</p>

<div class="cicd-board" data-pipeline role="group" aria-label="Interactive CI/CD pipeline">
  <div class="cicd-board-heading"><span><b>release / 0142</b> <span class="cicd-muted">main &middot; example commit</span></span><span class="cicd-run-state" data-run-state>STATIC VIEW</span></div>
  <svg class="cicd-diagram" viewBox="0 0 1120 272" role="img" aria-labelledby="pipeline-title pipeline-desc">
    <title id="pipeline-title">From source commit to production</title>
    <desc id="pipeline-desc">Commit to build, then parallel tests and security checks. Both checks must succeed to publish a signed artifact. The same artifact is validated in staging, waits for approval, and rolls out to production. Failed tests block all downstream work.</desc>
    <text class="cicd-lane-label" x="24" y="30">CONTINUOUS INTEGRATION</text>
    <text class="cicd-lane-label" x="564" y="30">CONTINUOUS DELIVERY</text>
    <path class="cicd-lane-divider" d="M548 48 V260"/>
    <g class="cicd-routes" fill="none">
      <path data-edge="commit-build" d="M152 154 H196"/>
      <path data-edge="build-tests" d="M324 154 H344 Q352 154 352 146 V102 Q352 94 360 94 H376"/>
      <path data-edge="build-security" d="M324 154 H344 Q352 154 352 162 V206 Q352 214 360 214 H376"/>
      <path data-edge="tests-artifact" d="M520 94 H532 Q540 94 540 102 V146 Q540 154 548 154 H564"/>
      <path data-edge="security-artifact" d="M520 214 H532 Q540 214 540 206 V162 Q540 154 548 154 H564"/>
      <path data-edge="artifact-staging" d="M712 154 H760"/>
      <path data-edge="staging-production" d="M908 154 H956"/>
    </g>
    <g class="cicd-node" data-node="commit" transform="translate(24 110)">
      <rect width="128" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Commit</text>
      <text class="cicd-node-detail" x="16" y="49">git push</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-node" data-node="build" transform="translate(196 110)">
      <rect width="128" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Build</text>
      <text class="cicd-node-detail" x="16" y="49">Compile + cache</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-node" data-node="tests" transform="translate(376 50)">
      <rect width="144" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Tests</text>
      <text class="cicd-node-detail" x="16" y="49">Unit + integration</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-node" data-node="security" transform="translate(376 170)">
      <rect width="144" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Security</text>
      <text class="cicd-node-detail" x="16" y="49">Scan + policy</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-node" data-node="artifact" transform="translate(564 110)">
      <rect width="148" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Artifact</text>
      <text class="cicd-node-detail" x="16" y="49">Sign + publish</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-node" data-node="staging" transform="translate(760 110)">
      <rect width="148" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Staging</text>
      <text class="cicd-node-detail" x="16" y="49">Smoke tests</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-node" data-node="production" transform="translate(956 110)">
      <rect width="140" height="88" rx="14"/>
      <text class="cicd-node-title" x="16" y="28">Production</text>
      <text class="cicd-node-detail" x="16" y="49">Canary rollout</text>
      <text class="cicd-node-state" x="16" y="73" data-node-state></text>
    </g>
    <g class="cicd-gate" data-gate transform="translate(932 154)">
      <circle r="10"/>
      <path d="M-3-1 V-4 a3 3 0 0 1 6 0 V-1 M-4-1 H4 V5 H-4 Z"/>
      <text x="0" y="-61" text-anchor="middle">APPROVAL</text>
    </g>
  </svg>
  <div class="cicd-runtime cicd-console">
    <span class="cicd-console-prompt" aria-hidden="true">&gt;</span>
    <span data-summary role="status" aria-live="polite" aria-atomic="true">Ready to follow a commit.</span>
    <progress data-progress max="1" value="0" aria-label="Current stage progress"></progress>
    <span class="cicd-percent" data-percent aria-hidden="true">0%</span>
  </div>
  <div class="cicd-controls" hidden>
    <button type="button" class="cicd-primary" data-action="toggle">Run pipeline</button>
    <button type="button" data-action="step">Step</button>
    <button type="button" data-action="replay">Replay</button>
    <button type="button" class="cicd-approve" data-action="approve" disabled>Approve release</button>
    <label>Scenario <select data-scenario><option value="healthy">Healthy run</option><option value="fail">Fail tests</option></select></label>
    <label>Speed <select data-speed><option value="1">1x</option><option value="2">2x</option></select></label>
  </div>
  <p class="cicd-static-note">Both checks must pass. Approval unlocks production. Open the HTML export for playback controls.</p>
</div>

<p class="cicd-demo-hint">Try <b>Fail tests</b> to block the release. <b>Step</b> advances one stage without bypassing approval.</p>

<!--
In the audience HTML window, this simulation starts when the slide becomes active.
It stops at the approval gate. Click Approve release to begin the canary rollout.
Pause and Step let you explain a stage; Replay starts the selected scenario again.
Changing Scenario resets the run. Choose Fail tests and Run pipeline to demonstrate
that failure prevents artifact publication, staging, and production.
Timing and traffic percentages are illustrative, not performance measurements.
Reduced-motion users start manually and can use Step without moving particles.
Custom playback state is local to each browser window, not synchronized with Marp
presenter view. Operate this demo in the audience window; presenter previews stay static.
-->

---

<!-- _class: invert cicd -->

<p class="cicd-eyebrow">03 / MAKE THE PATTERN YOURS</p>

## Motion is a layer, not the format.

<div class="cicd-recipe">
<div>

### Markdown tells the story.

Keep stages and decisions visible.<br>Move detail into speaker notes.

### JavaScript drives the timeline.

JavaScript moves SVG signals<br>and updates stage state.

### Keep a static fallback.

Even without JavaScript,<br>the delivery path stays readable.

</div>
<div class="cicd-code-card">

<p class="cicd-card-label">THREE EDITABLE LAYERS</p>

```text
Animated-CICD.md
  narrative + SVG + speaker notes

themes/animated-cicd.css
  color tokens + layout + motion

assets/animated-cicd.js
  stages + timing + interaction
```

<p class="cicd-code-caption">Local code. Browser-native playback.</p>

</div>
</div>

<p class="cicd-takeaway"><span>DESIGN RULE</span> Animate the relationship you want people to remember.</p>

<!--
Customize the stages and durations in assets/animated-cicd.js, the stage nodes and
connections in this Markdown file, and the scoped tokens in themes/animated-cicd.css.
The composed custom-default theme imports the animated-cicd companion stylesheet.
Its opt-in cicd classes keep the demo's styling scoped.
Visual inspiration: https://github.com/favourhong/Awesome-Marp (typographic hierarchy,
section labels, and card layouts). All diagram markup and animation code here are original.
Transitions use Marp's built-in fade:
https://github.com/marp-team/marp-cli/blob/main/docs/bespoke-transitions/README.md
-->
