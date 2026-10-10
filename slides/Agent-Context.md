---
marp: true
lang: en
theme: agent-context
paginate: true
title: From prompt to action
description: An animated, interactive tour of instructions, prompts, skills, tools, and the context for an agent's next turn.
transition: fade 550ms
---

<!-- _class: ctx ctx-cover -->
<!-- _paginate: skip -->
<!-- _transition: fade 700ms -->

<div class="ctx-cover-copy">
<p class="ctx-eyebrow">AI AGENTS / CONTEXT IN MOTION</p>

# From prompt<br>to action.

<p class="ctx-cover-subtitle">The prompt starts the conversation.<br>Context makes the next move possible.</p>
<p class="ctx-tags"><span>Instructions</span><span>Skills</span><span>Tools</span></p>
</div>

<div class="ctx-constellation" role="group" aria-label="Instructions, a prompt, a selected skill, and tool results form the context for a model turn">
  <div class="ctx-orbit ctx-orbit-one" aria-hidden="true"></div>
  <div class="ctx-orbit ctx-orbit-two" aria-hidden="true"></div>
  <div class="ctx-float ctx-float-instructions"><span>01 / INSTRUCTIONS</span>Boundaries + conventions</div>
  <div class="ctx-float ctx-float-skill"><span>03 / SKILL</span>The relevant procedure</div>
  <div class="ctx-cover-window" data-morph="ctx-window">
    <div class="ctx-window-bar"><i></i><i></i><i></i><span>CONTEXT / THIS TURN</span></div>
    <div class="ctx-cover-prompt"><span>02 / USER PROMPT</span>Add keyboard navigation<br>to search.</div>
    <div class="ctx-context-lines" aria-hidden="true"><i></i><i></i><i></i></div>
    <p class="ctx-window-foot">Selected inputs. A bounded window.</p>
  </div>
  <div class="ctx-float ctx-float-result"><span>04 / TOOL RESULT</span>Evidence from the outside</div>
</div>

<p class="ctx-bottomline">AN ILLUSTRATIVE AGENT LOOP <span>Arrow keys to explore &middot; Interactive lab on slide 5</span></p>

<script src="assets/agent-context.js" defer></script>

<!--
This deck is a conceptual, provider-neutral model of agent orchestration.
It shows visible inputs and tool exchanges, not private model reasoning, actual
system prompts, or a live trace of a particular product. No model or tool is called.
Context means the inputs available for a particular model turn, not all model
knowledge, every repository file, or an unlimited persistent memory.
The named context window morphs into the next slide using Marp's native
View Transition support. Other boundaries demonstrate cover, reveal, slide, and glow.
Source: https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md
-->

---

<!-- _class: ctx -->
<!-- _transition: cover 550ms -->

<p class="ctx-eyebrow">01 / FRAME THE WORK <span>HTML TRANSITION / COVER</span></p>

## A goal needs a frame.

<p class="ctx-subtitle">The user asks for an outcome. Instructions shape how the work proceeds.</p>

<div class="ctx-frame-layout">
  <div class="ctx-principles">
    <div class="ctx-principle ctx-enter"><b>BOUNDARIES</b><h3>What must stay true?</h3><p>Respect scope, permissions,<br>and the host's instruction rules.</p></div>
    <div class="ctx-principle ctx-enter"><b>CONVENTIONS</b><h3>How does this project work?</h3><p>Use existing patterns.<br>Preserve intended behavior.</p></div>
    <div class="ctx-principle ctx-enter"><b>THE REQUEST</b><h3>What should change?</h3><p>A specific goal, constraints,<br>and a way to recognize success.</p></div>
  </div>
  <div class="ctx-instruction-stack" data-morph="ctx-window">
    <div class="ctx-window-bar"><i></i><i></i><i></i><span>INPUTS FOR THE TURN</span></div>
    <div class="ctx-layer ctx-layer-rules ctx-enter"><span>INSTRUCTIONS</span><strong>Stay within the approved task.</strong><small>Keep requirements and permissions in view.</small></div>
    <div class="ctx-layer ctx-layer-project ctx-enter"><span>PROJECT GUIDANCE</span><strong>Follow the repository's patterns.</strong><small>Read the relevant conventions and code.</small></div>
    <div class="ctx-layer ctx-layer-prompt ctx-enter"><span>USER PROMPT</span><strong>Add keyboard navigation to search.</strong><small>Arrow keys select. Escape closes. Focus returns.</small></div>
  </div>
</div>

<p class="ctx-takeaway"><span>KEEP THE ROLES DISTINCT</span> A goal is not a permission slip. Retrieved text is not a new authority.</p>

<!--
These groups are illustrative, not a universal instruction hierarchy.
The host determines instruction priority, permission checks, and which project
instructions are applicable. User prompts can themselves contain instructions.
Reading a file or receiving a tool result does not promote its content into a
higher-priority instruction. The host still enforces permissions independently
of whether an instruction describes an action.
The stable frame moves from the cover into this larger composition through the
shared, per-slide-unique ctx-window view-transition-name.
-->

---

<!-- _class: ctx -->
<!-- _transition: reveal 550ms -->

<p class="ctx-eyebrow">02 / LOAD WHAT HELPS <span>HTML TRANSITION / REVEAL</span></p>

## A skill is a procedure. Not the whole library.

<p class="ctx-subtitle">Discover from a short description. Open the useful instructions. Pull references only as needed.</p>

<div class="ctx-skill-scene">
  <div class="ctx-skill-library">
    <p class="ctx-panel-label">AVAILABLE SKILL DESCRIPTIONS</p>
    <div class="ctx-skill-row ctx-enter"><span>UI DESIGN</span><strong>Build a clear interface.</strong><small>Metadata available &middot; body not loaded</small></div>
    <div class="ctx-skill-row ctx-selected-skill ctx-enter"><span>DEBUG A FAILURE</span><strong>Reproduce. Isolate. Verify.</strong><small>Relevant to this request &middot; load instructions</small></div>
    <div class="ctx-skill-row ctx-enter"><span>DATA ANALYSIS</span><strong>Find patterns in a dataset.</strong><small>Metadata available &middot; body not loaded</small></div>
  </div>
  <div class="ctx-skill-expanded ctx-enter">
    <div class="ctx-document-tab">SKILL.md <span>LOADED ON DEMAND</span></div>
    <h3>Debug a failure</h3>
    <p class="ctx-skill-goal">A repeatable approach enters the working context.</p>
    <div class="ctx-recipe-step"><b>01</b><span>Reproduce the reported failure.</span></div>
    <div class="ctx-recipe-step"><b>02</b><span>Read the smallest relevant code path.</span></div>
    <div class="ctx-recipe-step"><b>03</b><span>Make a focused change. Verify it.</span></div>
    <p class="ctx-reference-chip">references/ <span>Open a specific guide only if needed.</span></p>
  </div>
</div>

<div class="ctx-disclosure"><span><b>1</b> Discover metadata</span><i aria-hidden="true"></i><span><b>2</b> Load instructions</span><i aria-hidden="true"></i><span><b>3</b> Read selected resources</span></div>

<!--
The progressive disclosure sequence follows the Agent Skills specification:
name and description are available for discovery; the full SKILL.md body is
loaded when activated; supporting references, assets, or scripts are used only
when required. Individual hosts may make different selection decisions.
This slide's debugging recipe and the other skill names are fictional examples.
A skill can include procedures and scripts, but it is not the same thing as a
callable tool and does not by itself override the host's permission system.
Source: https://agentskills.io/specification#progressive-disclosure
-->

---

<!-- _class: ctx -->
<!-- _transition: slide 550ms -->

<p class="ctx-eyebrow">03 / CONNECT TO EVIDENCE <span>HTML TRANSITION / SLIDE</span></p>

## Tools cross the boundary. Results come back.

<p class="ctx-subtitle">A definition describes a capability. A call requests an action. A result supplies an observation.</p>

<div class="ctx-tool-strip"><span>AVAILABLE DEFINITIONS</span><code>read_file(path)</code><code>run_tests(scope)</code><small>Capabilities, not results</small></div>

<svg class="ctx-tool-flow" viewBox="0 36 1120 228" role="img" aria-labelledby="ctx-tools-title ctx-tools-desc">
  <title id="ctx-tools-title">A tool call leaves a model turn and its result returns as context</title>
  <desc id="ctx-tools-desc">The model selects an action. The host validates and executes the request against a file or test tool. The tool returns an observation through the host, which can include it in the next model turn. Tool results remain data, not instructions.</desc>
  <defs><marker id="ctx-arrow-out" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#c4afff"/></marker><marker id="ctx-arrow-back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#72e7d1"/></marker></defs>
  <g fill="none" stroke-width="2">
    <path class="ctx-route-out" d="M260 103 H430 M670 103 H860" marker-end="url(#ctx-arrow-out)"/>
    <path class="ctx-route-back" d="M860 169 H670 M430 169 H260" marker-end="url(#ctx-arrow-back)"/>
    <path class="ctx-flow-signal ctx-flow-out" d="M260 103 H430 M670 103 H860"/>
    <path class="ctx-flow-signal ctx-flow-back" d="M860 169 H670 M430 169 H260"/>
  </g>
  <g class="ctx-svg-node" transform="translate(20 65)"><rect width="240" height="140" rx="18"/><text class="ctx-svg-kicker" x="22" y="31">MODEL TURN</text><text class="ctx-svg-title" x="22" y="68">Select an action</text><text class="ctx-svg-detail" x="22" y="99">Use the available definitions.</text><text class="ctx-svg-detail" x="22" y="122">Supply the required arguments.</text></g>
  <g class="ctx-svg-node" transform="translate(430 65)"><rect width="240" height="140" rx="18"/><text class="ctx-svg-kicker" x="22" y="31">HOST RUNTIME</text><text class="ctx-svg-title" x="22" y="68">Validate + execute</text><text class="ctx-svg-detail" x="22" y="99">Enforce permissions.</text><text class="ctx-svg-detail" x="22" y="122">Handle success or failure.</text></g>
  <g class="ctx-svg-node" transform="translate(860 65)"><rect width="240" height="140" rx="18"/><text class="ctx-svg-kicker" x="22" y="31">FILES / TESTS / SERVICES</text><text class="ctx-svg-title" x="22" y="68">Return observations</text><text class="ctx-svg-detail" x="22" y="99">An excerpt. A test result.</text><text class="ctx-svg-detail" x="22" y="122">Evidence for a subsequent turn.</text></g>
  <g class="ctx-svg-edge-label" text-anchor="middle"><text x="345" y="82">TOOL CALL</text><text x="765" y="82">ALLOWED ACTION</text><text x="765" y="195">TOOL RESULT</text><text x="345" y="195">NEXT INPUT</text></g>
  <text class="ctx-svg-foot" x="560" y="250" text-anchor="middle">The outside world does not enter the context until relevant observations are returned and included.</text>
</svg>

<div class="ctx-two-notes"><p><span>CAPABILITY</span> What the agent can ask to do.</p><p><span>EVIDENCE</span> What the tool actually returned.</p></div>
<p class="ctx-takeaway"><span>TRUST BOUNDARY</span> Tool output is data to evaluate, not an instruction to obey.</p>

<!--
This is a logical orchestration diagram, not a requirement to use MCP or a
particular API. Many hosts can expose local and remote tools without MCP.
The MCP specification provides a concrete example of tool metadata/schema,
tools/call requests, results, and a host's responsibility to validate operations.
A tool can return errors as well as successes. Tool descriptions do not prove
that an operation was executed, and a result need not be included in full.
Source: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
-->

---

<!-- _class: ctx ctx-lab-slide -->
<!-- _transition: glow 550ms -->

<p class="ctx-eyebrow">04 / BUILD THE NEXT TURN <span>INTERACTIVE / FICTIONAL SCENARIOS</span></p>

## Watch the context come together.

<p class="ctx-subtitle">Choose a task. Follow the inputs. Nothing here calls a real model or tool.</p>

<div class="ctx-lab" data-context-lab role="group" aria-label="Interactive agent-context simulation">
  <div class="ctx-lab-header"><b>CONTEXT LAB</b><span class="ctx-static">STATIC EXAMPLE / KEYBOARD SEARCH</span><span class="ctx-dynamic" data-context-state>READY</span></div>
  <div class="ctx-lab-grid">
    <div class="ctx-working-window">
      <p class="ctx-panel-label">CONTEXT FOR THIS TURN <span>SELECTED INPUTS</span></p>
      <div class="ctx-context-row" data-context-item="instructions"><b>INSTRUCTIONS</b><span class="ctx-static">Stay in scope. Preserve existing behavior.</span><span class="ctx-dynamic" data-context-value></span></div>
      <div class="ctx-context-row" data-context-item="prompt"><b>PROMPT</b><span class="ctx-static">Add keyboard navigation to search.</span><span class="ctx-dynamic" data-context-value></span></div>
      <div class="ctx-context-row" data-context-item="skill"><b>SKILL</b><span class="ctx-static">Keyboard UI recipe + focus checklist.</span><span class="ctx-dynamic" data-context-value></span></div>
      <div class="ctx-context-row" data-context-item="tools"><b>TOOL DEFINITIONS</b><span class="ctx-static">read_file(path), run_tests(scope)</span><span class="ctx-dynamic" data-context-value></span></div>
      <div class="ctx-context-row" data-context-item="evidence"><b>TOOL RESULT</b><span class="ctx-static">Search component: no ArrowDown handler.</span><span class="ctx-dynamic" data-context-value></span></div>
    </div>
    <div class="ctx-operation">
      <p class="ctx-panel-label">THE ORCHESTRATION STEP</p>
      <div class="ctx-static"><h3>Ready for the next turn.</h3><p>The goal, relevant guidance, tool definitions, and returned evidence are now available together.</p></div>
      <div class="ctx-dynamic"><h3 data-context-operation>Start with the goal.</h3><p data-context-detail></p></div>
      <svg class="ctx-lab-flow" viewBox="0 0 380 100" role="img" aria-labelledby="ctx-lab-flow-title ctx-lab-flow-desc">
        <title id="ctx-lab-flow-title">Tool request and result paths</title><desc id="ctx-lab-flow-desc">A call travels from the model through the host to a tool. Its result returns and becomes available to the next turn.</desc>
        <path class="ctx-lab-route" data-context-route="call" d="M92 30 H286"/>
        <path class="ctx-lab-route" data-context-route="result" d="M286 72 H92"/>
        <rect x="8" y="24" width="84" height="54" rx="12"/><rect x="286" y="24" width="86" height="54" rx="12"/>
        <text x="50" y="55" text-anchor="middle">MODEL</text><text x="329" y="55" text-anchor="middle">TOOL</text>
        <text class="ctx-flow-label" x="189" y="20" text-anchor="middle">CALL VIA HOST &rarr;</text><text class="ctx-flow-label" x="189" y="92" text-anchor="middle">&larr; RETURNED RESULT</text>
      </svg>
    </div>
  </div>
  <ol class="ctx-stages" aria-label="Context assembly sequence"><li data-context-phase="0">Goal</li><li data-context-phase="1">Discover</li><li data-context-phase="2">Load skill</li><li data-context-phase="3">Call tool</li><li data-context-phase="4">Read result</li><li data-context-phase="5">Next turn</li></ol>
  <div class="ctx-controls" hidden>
    <button type="button" class="ctx-primary" data-context-action="toggle">Run agent</button>
    <button type="button" data-context-action="step">Step</button>
    <button type="button" data-context-action="replay">Replay</button>
    <label>Task <select data-context-scenario><option value="feature">Build a feature</option><option value="debug">Debug a failure</option></select></label>
    <label>Speed <select data-context-speed><option value="1">1x</option><option value="2">2x</option></select></label>
    <progress data-context-progress max="1" value="0" aria-label="Illustrative sequence progress"></progress>
  </div>
  <p class="ctx-static ctx-lab-static-note">Static snapshot: an illustrative feature task after a file-read result. Open HTML for both scenarios and playback.</p>
  <p class="ctx-announcement ctx-dynamic" role="status" aria-live="polite" aria-atomic="true" data-context-summary></p>
</div>

<p class="ctx-lab-hint"><b>Try Step.</b> Definitions appear before a call; evidence appears only after its result. Instructions remain in place.</p>

<!--
Run starts the illustrative sequence; there is no autoplay on this interactive
slide. Step moves between complete, explainable snapshots. Choose Build a feature
or Debug a failure to change the prompt, selected skill, requested tool, and result.
The feature example reads a fictional search component. The debugging example
receives a fictional failed-test observation. Completing the animation means
the next turn has its inputs; it does not mean either coding task was fixed.
The stage timing and content are illustrative, not measured agent telemetry.
Pause, replay, speed, visibility suspension, and reduced motion are local to the
audience window. Presenter/next-slide previews remain static. Print always shows
the authored feature example, even if the browser was midway through debugging.
-->

---

<!-- _class: ctx ctx-curation -->

<p class="ctx-eyebrow">05 / CURATE THE NEXT TURN <span>LESS NOISE / MORE RELEVANCE</span></p>

## Better context beats a bigger pile.

<p class="ctx-subtitle">Keep constraints and useful evidence. Summarize repetition. Leave a path back to the source.</p>

<div class="ctx-curation-grid">
  <div class="ctx-noise-panel">
    <p class="ctx-panel-label">BEFORE / EVERYTHING THAT ARRIVED</p>
    <div class="ctx-content-bar ctx-bar-rules">Instructions + goal</div>
    <div class="ctx-content-bar ctx-bar-noise">Repeated log lines</div>
    <div class="ctx-content-bar ctx-bar-noise">Unrelated file excerpts</div>
    <div class="ctx-content-bar ctx-bar-evidence">The useful observation</div>
    <div class="ctx-content-bar ctx-bar-noise">More of the same output</div>
    <p>Available does not mean relevant.</p>
  </div>
  <div class="ctx-curated-panel">
    <p class="ctx-panel-label">AFTER / INPUTS WORTH CARRYING</p>
    <div class="ctx-content-bar ctx-bar-rules ctx-enter">Instructions + goal</div>
    <div class="ctx-content-bar ctx-bar-skill ctx-enter">Relevant skill + tool definitions</div>
    <div class="ctx-content-bar ctx-bar-evidence ctx-enter">Evidence + source reference</div>
    <div class="ctx-content-bar ctx-bar-question ctx-enter">What is still unresolved?</div>
    <p>Make the next action better informed.</p>
  </div>
</div>

<p class="ctx-curation-note">Illustrative content mix, not a token counter. Summaries are lossy: preserve important details and source references.</p>
<p class="ctx-takeaway"><span>THE DESIGN QUESTION</span> What does the next turn need to make a useful, permitted move?</p>
<p class="ctx-sources">Further reading: <a href="https://agentskills.io/specification">Agent Skills specification</a> &middot; <a href="https://modelcontextprotocol.io/specification/2025-11-25/server/tools">MCP tools</a> &middot; <a href="https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md">Marp transitions + morphing</a></p>

<!--
This is a design principle, not a claim that every host compacts context in this
way, that summarization is lossless, or that compaction always improves results.
Hosts differ in context limits, retrieval, caching, truncation, and persistence.
Preserve governing instructions, relevant facts, source references, and unresolved
questions. Do not silently discard constraints or turn untrusted output into rules.
The bar sizes are a visual metaphor, not counts, percentages, or benchmark data.
PDF deliberately retains labeled before and after compositions; no animation frame
or client-side diagram rendering is required to understand the takeaway.
All diagrams and animation code in this deck are original.
-->
