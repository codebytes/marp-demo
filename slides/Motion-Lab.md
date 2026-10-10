---
marp: true
theme: custom-default
paginate: true
math: mathjax
title: Motion Lab
description: One diagram, nine animation techniques. CSS, native SVG, sprites, local video, Lottie, and Marp morphs with complete static frames.
transition: fade 300ms
---

<!-- _class: invert ml ml-cover -->
<!-- _paginate: skip -->
<!-- _transition: cover 600ms -->

<p class="ml-eyebrow">MOTION LAB <span>AN EXPERIMENT IN PRESENTATION DESIGN</span></p>

# Same diagram.<br>Different verbs.

<p class="ml-intro">From CSS and SVG to frames, film, and vectors.<br>Change the technique, not the subject.</p>

<div class="ml-cover-board">
  <div class="ml-board-label"><span>THE SPECIMEN</span><span>3 NODES / 1 RELATIONSHIP</span></div>
  <div class="ml-map" role="img" aria-label="Our specimen: A, start, connects through B, shape, to C, land.">
    <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/></svg>
    <div class="ml-node ml-node-a"><b>A</b><span>START</span></div>
    <div class="ml-node ml-node-b"><b>B</b><span>SHAPE</span></div>
    <div class="ml-node ml-node-c"><b>C</b><span>LAND</span></div>
  </div>
</div>

<p class="ml-cover-foot">NINE TECHNIQUES. ONE SPECIMEN.<br><span>Arrow keys navigate. Play once starts each experiment. Next cut: Marp cover.</span></p>

<script src="assets/motion-lab.js" defer></script>

<!--
This is a lab about animation techniques, not a simulation of another engineering
system. A, B, and C are an intentionally neutral specimen: start, shape, land.
The same positions, dimensions, connecting path, and labels recur in the next eight
experiments. Only the motion mechanism changes. The morph pair then changes layout
while keeping the identities. Every slide is understandable as a still.
Animations start manually, run once, and can be paused or replayed in the audience
window. CSS and native SVG interpolate the first examples. Frames and video are
pre-rendered, and Lottie requires a locally packaged JavaScript vector renderer.
Shared JavaScript manages playback, slide activation, and accessibility; Marp itself
also uses JavaScript. None of these examples claim "no JavaScript anywhere."
The opening boundary visibly demonstrates Marp's built-in cover transition.
-->

---

<!-- _class: invert ml -->

<p class="ml-eyebrow">01 / SEQUENCE <span>CSS KEYFRAME CHOREOGRAPHY</span></p>

## Give the eye an order.

<p class="ml-subtitle">A leads. B answers. C lands. The diagram never changes its meaning.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-choreography" data-motion-technique="css" role="group" aria-label="CSS choreography experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>CSS / 4 SECONDS</span></div>
    <div class="ml-map" role="img" aria-label="A connects through B to C. CSS lifts and highlights each node in that order.">
      <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/></svg>
      <div class="ml-node ml-node-a" data-ml-animate><b>A</b><span>START</span></div>
      <div class="ml-node ml-node-b" data-ml-animate><b>B</b><span>SHAPE</span></div>
      <div class="ml-node ml-node-c" data-ml-animate><b>C</b><span>LAND</span></div>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>Keyframes + delays.</h3>
    <p>One gesture, staggered across three objects.</p>
    <pre><code>animation: lift 2s both;
animation-delay: 1s;</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> order and emphasis.<br><b>Watch for</b> too many entrances.</p>
  </aside>
</div>

<p class="ml-takeaway">Choreography changes <strong>when attention arrives.</strong></p>

<!--
The three HTML node cards share the ml-lift CSS keyframes, delayed by 0, 1, and
2 seconds. Each gesture lasts 2 seconds, so the whole sequence ends at 4 seconds.
Only transform and box-shadow change; labels and the connecting path stay visible.
The JavaScript toggles CSS playback classes. CSS, not JavaScript, interpolates the
frames. Pause sets animation-play-state; Replay removes and restarts the keyframes.
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations
-->

---

<!-- _class: invert ml -->

<p class="ml-eyebrow">02 / TRACE <span>SVG STROKE DRAWING / TIMED BY CSS</span></p>

## Draw the relationship.

<p class="ml-subtitle">Keep the nodes still. Let the connection become the sentence.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-drawing" data-motion-technique="stroke" role="group" aria-label="SVG stroke drawing experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>SVG + CSS / 4 SECONDS</span></div>
    <div class="ml-map" role="img" aria-label="A connects through B to C. A colored SVG stroke draws along the already-visible route.">
      <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true">
        <path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/>
        <path class="ml-ink ml-drawn-route" pathLength="1" data-ml-animate d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/>
      </svg>
      <div class="ml-node ml-node-a"><b>A</b><span>START</span></div>
      <div class="ml-node ml-node-b"><b>B</b><span>SHAPE</span></div>
      <div class="ml-node ml-node-c"><b>C</b><span>LAND</span></div>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>A dash becomes a line.</h3>
    <p>Normalize the path length to 1. Animate its dash offset to 0.</p>
    <pre><code>stroke-dasharray: 1;
/* offset: 1 to 0 */</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> a connection or outline.<br><b>Watch for</b> complex path order.</p>
  </aside>
</div>

<p class="ml-takeaway">Stroke drawing changes <strong>how a connection is discovered.</strong></p>

<!--
The SVG path has pathLength="1". CSS sets stroke-dasharray: 1 and animates
stroke-dashoffset from 1 to 0 over four seconds. This is SVG geometry with a CSS
animation, not SMIL and not a JavaScript path-length calculation.
A muted full route remains underneath, including in the starting frame. The static
and print states show the entire colored route. Pausing freezes the drawn length.
Source: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/pathLength
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dashoffset
-->

---

<!-- _class: invert ml -->

<p class="ml-eyebrow">03 / TRAVEL <span>DECLARATIVE SVG / ANIMATEMOTION</span></p>

## Move something. Not everything.

<p class="ml-subtitle">A single signal follows the same route. The browser handles the geometry.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-travel" data-motion-technique="svg" role="group" aria-label="Declarative SVG motion experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>NATIVE SVG / 4 SECONDS</span></div>
    <div class="ml-map" role="img" aria-label="A connects through B to C. One signal follows the route with SVG animateMotion.">
      <svg class="ml-rails ml-motion-svg" viewBox="0 0 680 300" aria-hidden="true">
        <path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/>
        <circle class="ml-rest-signal" cx="504" cy="174" r="8"/>
        <circle id="ml-route-signal" class="ml-packet" r="8"/>
        <animateMotion href="#ml-route-signal" begin="indefinite" dur="4s" repeatCount="1" fill="freeze" calcMode="paced" path="M148 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H528"/>
      </svg>
      <div class="ml-node ml-node-a"><b>A</b><span>START</span></div>
      <div class="ml-node ml-node-b"><b>B</b><span>SHAPE</span></div>
      <div class="ml-node ml-node-c"><b>C</b><span>LAND</span></div>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>The path is the timeline.</h3>
    <p><code>animateMotion</code> moves the signal at a paced speed.</p>
    <pre><code>&lt;animateMotion
  path="M148 174 ..."
  dur="4s" /&gt;</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> travel along a route.<br><b>Watch for</b> SVG clock control.</p>
  </aside>
</div>

<p class="ml-takeaway">Path motion changes <strong>where attention is carried.</strong></p>

<!--
The signal is a native SVG animateMotion element (SMIL). begin="indefinite" stops
it from running on every hidden slide when the document opens. beginElement starts
it; pauseAnimations and unpauseAnimations control the SVG clock. JavaScript never
computes positions. The signal follows the visible route between the outer cards,
passing behind B, and repeatCount="1" makes it finite.
The sibling animation uses an explicit href target; this also avoids HTML
normalization treating a nested SVG circle as an empty element during export.
CSS animation-play-state does not pause SMIL: it needs its own SVG clock methods.
Print, no-JS, reduced-motion, and presenter views hide the moving signal and show
a separate authored static marker. Changing browser motion preferences resets it.
Source: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion
Source: https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement/pauseAnimations
-->

---

<!-- _class: invert ml -->
<!-- _transition: ml-aperture 700ms -->

<p class="ml-eyebrow">04 / REVEAL <span>CSS MASK / SOFT-EDGE WIPE</span></p>

## Reveal ink, not new structure.

<p class="ml-subtitle">A moving aperture exposes the highlight. Nothing underneath changes position.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-masking" data-motion-technique="mask" role="group" aria-label="CSS mask wipe experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>CSS MASK / 4 SECONDS</span></div>
    <div class="ml-map" role="img" aria-label="A connects through B to C. A soft mask reveals colored outlines from left to right, while labels remain visible.">
      <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/></svg>
      <div class="ml-node ml-node-a"><b>A</b><span>START</span></div>
      <div class="ml-node ml-node-b"><b>B</b><span>SHAPE</span></div>
      <div class="ml-node ml-node-c"><b>C</b><span>LAND</span></div>
      <svg class="ml-rails ml-mask-ink" data-ml-animate viewBox="0 0 680 300" aria-hidden="true">
        <path class="ml-ink" d="M148 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H288 M392 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H532"/>
        <g class="ml-ink"><rect x="44" y="124" width="104" height="100" rx="20"/><rect x="288" y="54" width="104" height="100" rx="20"/><rect x="532" y="124" width="104" height="100" rx="20"/></g>
      </svg>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>Move the aperture.</h3>
    <p>A gradient mask controls alpha. Shift the mask, not the nodes.</p>
    <pre><code>mask-image:
  linear-gradient(...);
/* position: 100% to 0 */</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> a reveal or spotlight.<br><b>Watch for</b> hidden labels.</p>
  </aside>
</div>

<p class="ml-takeaway">A mask changes <strong>what is visible through a window.</strong></p>
<p class="ml-boundary">NEXT CUT / A custom Marp clip-path aperture opens the next slide.</p>

<!--
The overlay SVG contains only colored connector segments and card outlines.
Its CSS alpha mask is a wide black-to-transparent linear gradient. Animating
mask-position from 100% to 0% exposes the overlay left-to-right; a soft gradient
edge distinguishes this mask from a hard clip-path wipe.
The underlying diagram, especially the labels, stays complete and stationary.
At rest, in print, and without JavaScript the mask is removed, showing all ink.
Masks can add painting/compositing work; do not assume every effect is GPU-only.
The next slide boundary is a separate custom Marp transition, ml-aperture. Its
clip-path keyframes create a hard-edged opening across the complete slide.
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/mask-position
-->

---

<!-- _class: invert ml -->

<p class="ml-eyebrow">05 / TILT <span>CSS 3D TRANSFORMS</span></p>

## Give a flat diagram depth.

<p class="ml-subtitle">Tilt the plane. Lift B toward the viewer. Return to a readable, flat frame.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-depth" data-motion-technique="depth" role="group" aria-label="CSS 3D transform experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>CSS 3D / 4 SECONDS</span></div>
    <div class="ml-perspective">
      <div class="ml-map ml-plane" data-ml-animate role="img" aria-label="A connects through B to C. The diagram tilts in perspective and B lifts away from the connector plane.">
        <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/></svg>
        <div class="ml-node ml-node-a"><b>A</b><span>START</span></div>
        <div class="ml-node ml-node-b" data-ml-animate><b>B</b><span>SHAPE</span></div>
        <div class="ml-node ml-node-c"><b>C</b><span>LAND</span></div>
      </div>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>A plane and a z-axis.</h3>
    <p>Perspective on the parent. Preserve depth on the plane.</p>
    <pre><code>perspective: 850px;
transform-style:
  preserve-3d;</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> layers or hierarchy.<br><b>Watch for</b> distorted text.</p>
  </aside>
</div>

<p class="ml-takeaway">Perspective changes <strong>what feels closer.</strong></p>

<!--
This is CSS 3D, not WebGL. An HTML parent supplies perspective; the diagram plane
uses transform-style: preserve-3d. CSS rotates the plane around X/Y and translates
B along Z. All frames come from CSS keyframes, with a finite four-second duration.
Overflow, filters, opacity, and other grouping properties on a preserve-3d parent
can flatten descendants. The plane avoids them. The surrounding slide still has
Marp's SVG/foreignObject wrapper; verify the actual export, not just a plain div.
The final, print, reduced-motion, no-JS and presenter states are flat and readable.
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
-->

---

<!-- _class: invert ml -->

<p class="ml-eyebrow">06 / FLIP THROUGH FRAMES <span>SPRITE SHEET / CSS STEPS</span></p>

## Twelve stills become a gesture.

<p class="ml-subtitle">The same specimen, baked into a strip of images. No shape is interpolated live.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-frames" data-motion-technique="sprite" role="group" aria-label="Sprite sheet animation experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>12 FRAMES / 4 SECONDS</span></div>
    <div class="ml-media-frame" role="img" aria-label="A connects through B to C. Twelve sprite frames make B rock and grow, with visibly discrete steps.">
      <img class="ml-media-still" src="assets/motion-lab/specimen.svg" alt="">
      <div class="ml-sprite ml-media-live" data-ml-animate aria-hidden="true"></div>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>Move the filmstrip.</h3>
    <p>CSS jumps between twelve fixed image cells.</p>
    <pre><code>animation: frames 4s
  steps(11, end) both;
/* 12 cells, 11 jumps */</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> an authored frame style.<br><b>Watch for</b> size and resolution.</p>
  </aside>
</div>

<p class="ml-takeaway">Frame animation changes <strong>which still is on screen.</strong></p>

<!--
This is a real PNG sprite sheet: twelve 680 by 300 cells laid out horizontally.
CSS background-position advances from 0 to -7480px with steps(11, end), preserving
the first and last cells. There is no smoothing or JavaScript frame selection.
The deliberately low frame count makes the stepped character visible. The next
slide uses the same authored gesture in a pre-rendered 30 fps clip.
Original artwork and source: assets/motion-lab/specimen.svg. Regenerate the sprite,
video, and authored Lottie data with npm run motion:assets. No stock media is used.
Source: https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/steps
-->

---

<!-- _class: invert ml -->

<p class="ml-eyebrow">07 / PLAY THE RENDER <span>LOCAL VIDEO / MOTION GRAPHICS</span></p>

## Same gesture. Baked pixels.

<p class="ml-subtitle">The motion was rendered before the talk. The browser only decodes the clip.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-video" data-motion-technique="video" role="group" aria-label="Pre-rendered local video experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>LOCAL VP9 WEBM / ABOUT 4 SECONDS</span></div>
    <div class="ml-media-frame" role="img" aria-label="A connects through B to C. The same rocking and growing gesture is played as a pre-rendered video. There is no audio.">
      <img class="ml-media-still" src="assets/motion-lab/specimen.svg" alt="">
      <video class="ml-film ml-media-live" src="assets/motion-lab/specimen.webm" poster="assets/motion-lab/specimen.svg" preload="none" muted playsinline aria-hidden="true"></video>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>Render once. Decode later.</h3>
    <p>One local, silent video. No network service or live rendering.</p>
    <pre><code>&lt;video playsinline
  src="specimen.webm"
  poster="specimen.svg"&gt;</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> a finished motion piece.<br><b>Watch for</b> codecs and file size.</p>
  </aside>
</div>

<p class="ml-takeaway">Video changes <strong>who does the rendering, and when.</strong></p>

<!--
The repository contains a real, original VP9 WebM clip, recorded offline at 30 fps
from the specimen SVG with Chromium's Canvas/MediaRecorder APIs. Its frame gesture
matches the sprite example, but it contains many more encoded frames.
No animation loop renders this slide live: HTMLMediaElement decodes the local file.
Playback uses the common buttons and media play/pause/currentTime/ended APIs.
There is no audio; the accessible description and static poster describe the full
content, so there is no missing spoken information or caption track.
VP9 WebM is verified in Chromium. Codec support and decoding can vary; the poster
remains available and a decode/load failure is explicitly reported.
Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
-->

---

<!-- _class: invert ml -->
<!-- _transition: slide 600ms -->

<p class="ml-eyebrow">08 / PLAY AUTHORED VECTORS <span>LOTTIE / LOCAL JAVASCRIPT RENDERER</span></p>

## Ship keyframes, not pixels.

<p class="ml-subtitle">The same motif is authored as vector layers. A player renders the in-between frames.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-vector" data-motion-technique="vector" role="group" aria-label="Authored Lottie vector animation experiment">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>LOTTIE JSON + SVG PLAYER / 4 SECONDS</span></div>
    <div class="ml-media-frame" role="img" aria-label="A connects through B to C. Authored Lottie keyframes rock and grow B while a vector stroke draws along the route.">
      <img class="ml-media-still" src="assets/motion-lab/specimen.svg" alt="">
      <div class="ml-lottie ml-media-live" aria-hidden="true"></div>
    </div>
    <div class="ml-controls" hidden><button type="button" data-motion-action="toggle">Play once</button><button type="button" data-motion-action="replay">Replay</button><span data-motion-status role="status" aria-live="polite">Ready / plays once</span></div>
    <p class="ml-still">STILL FRAME / A connects to B, then C. Motion adds emphasis, not information.</p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>An authoring format + player.</h3>
    <p>JSON stores shapes and keyframes. Lottie renders scalable SVG.</p>
    <pre><code>renderer: "svg"
autoplay: false
loop: false</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> designer-authored motion.<br><b>Watch for</b> player feature support.</p>
  </aside>
</div>

<p class="ml-takeaway">Authored vectors change <strong>how motion is handed off.</strong></p>
<p class="ml-boundary">NEXT CUT / Marp's built-in slide transition. Then compare a shared-element morph.</p>

<!--
This is a genuine Lottie composition rendered by the locally packaged MIT-licensed
lottie-web 5.13.0 SVG light player, not a screenshot, video, or CSS imitation.
The original composition contains vector card/letter outlines, authored rotation
and scale keyframes, and a trimmed route stroke. Its author-time data is generated
in scripts/generate-motion-assets.mjs; it was not exported from After Effects.
Lottie represents the designer-authored vector family in this lab; Rive is another
option, not an additional runtime required here. Supported export features vary.
The player runs JavaScript internally. This slide deliberately makes no CSS-only
or no-JavaScript claim. It loads locally only when this audience slide is active.
Use the local HTTP preview or Pages, not file://, to load the composition JSON.
Only this repository's trusted original JSON is rendered, not user-supplied data.
Source and license: https://github.com/airbnb/lottie-web/tree/v5.13.0
-->

---

<!-- _class: invert ml ml-morph-frame -->
<!-- _transition: fade 1400ms -->

<p class="ml-eyebrow">09 / MORPH <span>STATE A / OVERVIEW</span></p>

## Keep identity across a cut.

<p class="ml-subtitle">This slide is still. Press the right arrow to give B the stage.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-morph-board">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>SLIDE 10 &rarr; SLIDE 11</span></div>
    <div class="ml-map" role="img" aria-label="Overview state: A, B and C are the same size. B sits above the connecting route.">
      <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/></svg>
      <div class="ml-node ml-node-a" data-ml-morph="a"><b>A</b><span>START</span></div>
      <div class="ml-node ml-node-b" data-ml-morph="b"><b>B</b><span>SHAPE</span></div>
      <div class="ml-node ml-node-c" data-ml-morph="c"><b>C</b><span>LAND</span></div>
    </div>
    <p class="ml-navigation">PRESS &rarr; <span>Same names. New positions and sizes.</span></p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">THE MECHANISM</p>
    <h3>Name the same object.</h3>
    <p>Marp matches each name between two complete slides.</p>
    <pre><code>.ml-node-b {
  view-transition-name:
    ml-shape;
}</code></pre>
    <p class="ml-tradeoff"><b>Use for</b> continuity across slides.<br><b>Watch for</b> duplicate names.</p>
  </aside>
</div>

<p class="ml-takeaway">A morph changes <strong>layout without losing identity.</strong></p>

<!--
The next boundary uses Marp's fade transition with a 1400ms duration. A, B, and C
each have a unique view-transition-name on both slides. The View Transition API
interpolates their captured geometry while unnamed elements, including the route,
cross-fade. A morph is NOT SVG path interpolation; this route is deliberately not
named. No custom JavaScript is used for this transition.
Each name must be unique within a visible slide or the whole transition can fail.
Verified in Chromium; Marp documents Safari SVG/foreignObject-related limitations.
Unsupported browsers still navigate. Reduced motion removes the shared names and
lets Marp use its simple fade. Each PDF page is an independently complete layout.
Source: https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md#morphing-animations
-->

---

<!-- _class: invert ml ml-morph-frame ml-focus-frame -->

<p class="ml-eyebrow">09 / MORPH <span>STATE B / FOCUS</span></p>

## Same B. More attention.

<p class="ml-subtitle">The object persists. Its role in the composition changes.</p>

<div class="ml-experiment">
  <div class="ml-demo ml-morph-board">
    <div class="ml-board-label"><span>THE SAME SPECIMEN</span><span>SLIDE 11 &larr; SLIDE 10</span></div>
    <div class="ml-map" role="img" aria-label="Focus state: B is enlarged in the middle. A is above left and C is below right, still connected through B.">
      <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M136 104 H192 Q220 104 220 132 V174 H340 V224 H584"/></svg>
      <div class="ml-node ml-node-a" data-ml-morph="a"><b>A</b><span>START</span></div>
      <div class="ml-node ml-node-b" data-ml-morph="b"><b>B</b><span>SHAPE</span></div>
      <div class="ml-node ml-node-c" data-ml-morph="c"><b>C</b><span>LAND</span></div>
    </div>
    <p class="ml-navigation">PRESS &larr; <span>Reverse the same transition.</span></p>
  </div>
  <aside class="ml-mechanism">
    <p class="ml-label">WHAT JUST MOVED?</p>
    <h3>Geometry, not meaning.</h3>
    <p>Named cards move and resize. The unnamed connector cross-fades.</p>
    <pre><code>State A: 104 x 100
State B: 208 x 156
Identity: ml-shape</code></pre>
    <p class="ml-tradeoff"><b>Browser note</b> Chromium verified.<br>Safari can differ; a still works.</p>
  </aside>
</div>

<p class="ml-takeaway">Two readable slides. <strong>One continuous object.</strong></p>

<!--
Compare B's rendered position and size with the previous slide. The visible motion
must come from the named view-transition group, not just the whole-slide fade.
The transition also works backward with the left arrow. Nothing animates between
navigations, and there is no timer or simulation state to keep synchronized.
A and C retain their own stable names as well, so three shared elements morph.
In browsers without the API, both layouts still display and the arrow keys work.
Do not claim universal cross-browser morph fidelity.
-->

---

<!-- _class: invert ml ml-closing -->

<p class="ml-eyebrow">THE DESIGN RULE <span>CHOOSE THE RELATIONSHIP FIRST</span></p>

## Motion should earn its place.

<div class="ml-closing-map">
  <div class="ml-map" role="img" aria-label="The original complete specimen: A connects through B to C.">
    <svg class="ml-rails" viewBox="0 0 680 300" aria-hidden="true"><path class="ml-rail" d="M96 174 H192 Q220 174 220 146 V132 Q220 104 248 104 H432 Q460 104 460 132 V146 Q460 174 488 174 H584"/></svg>
    <div class="ml-node ml-node-a"><b>A</b><span>START</span></div>
    <div class="ml-node ml-node-b"><b>B</b><span>SHAPE</span></div>
    <div class="ml-node ml-node-c"><b>C</b><span>LAND</span></div>
  </div>
</div>

<div class="ml-principles">
  <div><span>01 / INTENT</span><h3>Pick the relationship.</h3><p>Then choose live geometry,<br>authored vectors, or pixels.</p></div>
  <div><span>02 / RESTRAINT</span><h3>Give control.</h3><p>Play once. Pause. Replay.<br>Honor reduced motion.</p></div>
  <div><span>03 / RESILIENCE</span><h3>Keep the still.</h3><p>If the animation vanishes,<br>the idea must remain.</p></div>
</div>

<p class="ml-takeaway">Different mechanisms. <strong>The same controls and complete stills.</strong> Marp connects the slides.</p>

<!--
Compare a technique because it changes the audience's understanding, not because
it adds movement. The examples are intentionally finite and manually started.
The shared runtime manages CSS classes, SVG/media/player clocks, completion events,
and visibility. Only the Lottie example adds an animation library. Everything is
packaged locally; all artwork, frame sequences, and video are original.
The motif lives in this Markdown and assets/motion-lab/specimen.svg; opt-in ml
classes live in themes/motion-lab.css and controls in assets/motion-lab.js.
The custom-default theme composes the scoped stylesheet without changing the CI/CD
deck. Use the audience window for controls; presenter previews stay static.
-->
