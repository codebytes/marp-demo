---
marp: true
theme: async-await
paginate: true
title: Await the work. Not the thread.
description: A synchronized .NET async/await animation with execution, task lifetimes, and a side-by-side compiler-state-machine diagram.
transition: fade 550ms
---

<!-- _class: aw aw-cover -->
<!-- _paginate: skip -->
<!-- _transition: slide 600ms -->

<div class="aw-cover-copy">
<p class="aw-eyebrow">.NET / ASYNC UNDER THE SURFACE</p>

# Await the work.<br>Not the thread.

<p class="aw-cover-subtitle">Follow the execution.<br>Watch the state machine keep its place.</p>
<p class="aw-tags"><span>C# async / await</span><span>Tasks</span><span>Continuations</span></p>
</div>

<div class="aw-cover-visual">
  <div class="aw-cover-label"><span>ONE METHOD / TWO VIEWS</span><span>DEMO 03</span></div>
  <svg class="aw-cover-map" viewBox="0 0 430 350" role="img" aria-labelledby="aw-cover-title aw-cover-desc">
    <title id="aw-cover-title">An async method can suspend while I/O continues</title>
    <desc id="aw-cover-desc">Execution runs, suspends at an incomplete await, and resumes after completion. A saved state connects the two execution segments without a dedicated thread waiting for the I/O.</desc>
    <text class="aw-svg-kicker" x="24" y="33">METHOD EXECUTION</text>
    <path class="aw-cover-rail" d="M24 82 H128 M280 82 H406"/>
    <path class="aw-cover-dash" d="M128 82 H280"/>
    <path class="aw-cover-beam" d="M24 82 H128 M280 82 H406"/>
    <rect class="aw-cover-point" x="53" y="69" width="25" height="25" rx="7"/>
    <rect class="aw-cover-point" x="343" y="69" width="25" height="25" rx="7"/>
    <text class="aw-svg-label" x="64" y="119" text-anchor="middle">RUN</text>
    <text class="aw-svg-label aw-amber" x="204" y="119" text-anchor="middle">SUSPEND</text>
    <text class="aw-svg-label" x="357" y="119" text-anchor="middle">RESUME</text>
    <path class="aw-cover-drop" d="M128 83 V175 H169 M260 213 H282 V83"/>
    <rect class="aw-cover-memory" x="110" y="165" width="190" height="95" rx="17"/>
    <text class="aw-svg-label" x="205" y="194" text-anchor="middle">SAVED STATE</text>
    <text class="aw-svg-small" x="205" y="220" text-anchor="middle">awaiter + resume point</text>
    <text class="aw-svg-small" x="205" y="242" text-anchor="middle">not a waiting thread</text>
    <path class="aw-cover-io" d="M24 304 H406"/>
    <text class="aw-svg-kicker aw-amber" x="24" y="333">I/O PROCEEDS INDEPENDENTLY</text>
  </svg>
  <p class="aw-cover-caption"><strong>One logical method.</strong> More than one execution segment.</p>
</div>

<p class="aw-bottomline">AN ILLUSTRATIVE .NET MODEL <span>Arrow keys to explore &middot; Synchronized lab on slide 3</span></p>

<script src="assets/async-await.js" defer></script>

<!--
This deck models a Task-returning C# method awaiting a naturally asynchronous I/O
operation. It is a browser-local teaching simulation, not a running .NET process,
profiler trace, benchmark, or exact compiler dump.
Calling an async method begins running its body synchronously. When an awaiter is
incomplete, the method can suspend and return control to its caller. The thread
is not blocked by that await. The caller may continue or itself await.
A Task is an operation/completion representation, not a dedicated thread.
The execution lane is a logical view of this method, not a fixed OS thread ID.
Source: https://learn.microsoft.com/dotnet/csharp/language-reference/operators/await
-->

---

<!-- _class: aw -->
<!-- _transition: reveal 550ms -->

<p class="aw-eyebrow">01 / THE DECISION AT AWAIT <span>CHECK FIRST / SUSPEND ONLY IF NEEDED</span></p>

## The same code. Two possible paths.

<p class="aw-subtitle">The caller supplies a task representing a read. The method returns a different task representing the count.</p>

<div class="aw-explain-grid">
<div class="aw-source-card">
<p class="aw-panel-label">THE C# METHOD</p>

```csharp
static async Task<int> CountAsync(
    Task<string> readTask)
{
    string text = await readTask;
    return text.Length;
}
```

<div class="aw-task-pair"><p><b>readTask</b><span>Task&lt;string&gt; &middot; the read result</span></p><p><b>CountAsync(...)</b><span>Task&lt;int&gt; &middot; the method result</span></p></div>
</div>
<div class="aw-path-cards">
  <div class="aw-path-card aw-enter"><span class="aw-path-label">AWAITER ALREADY COMPLETED</span><h3>Keep going.</h3><p>Get the result immediately.<br>No suspension at this await.</p><div class="aw-mini-path"><b>Run</b><i></i><b>GetResult</b><i></i><b>Finish</b></div></div>
  <div class="aw-path-card aw-slow aw-enter"><span class="aw-path-label">AWAITER NOT YET COMPLETED</span><h3>Save. Yield. Resume.</h3><p>Save the resume point and awaiter.<br>Continue after completion.</p><div class="aw-mini-path"><b>Run</b><i></i><b>Suspend</b><i></i><b>Resume</b></div></div>
</div>
</div>

<p class="aw-takeaway"><span>IMPORTANT DISTINCTION</span> The read can finish before the method's returned task finishes.</p>

<!--
The example is adapted to take a Task<string> so the demonstration can control
whether the awaited operation is pending or already complete. A real caller
might supply a task returned by HttpClient.GetStringAsync, but this deck performs
no network I/O. Successful scenarios use the string "hello", whose Length is 5.
The awaiter protocol checks IsCompleted. An incomplete await stores state and
arranges a continuation; an already-complete await proceeds without suspending.
GetResult retrieves a successful result or throws for a failed/canceled operation.
This diagram focuses on Task<T>. Scheduling/context behavior, multiple awaits,
cancellation, race handling, and exact generated field layout are omitted.
Sources:
https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model
https://learn.microsoft.com/dotnet/csharp/language-reference/operators/await
-->

---

<!-- _class: aw aw-lab-slide -->
<!-- _transition: glow 550ms -->

<p class="aw-eyebrow">02 / WATCH BOTH SIDES <span>SYNCHRONIZED / NOT REAL TIMINGS</span></p>

## Execution on the left. State on the right.

<div class="aw-lab" data-async-lab aria-label="Synchronized async await and state-machine simulation">
  <div class="aw-lab-heading"><b>COUNTASYNC / INPUT "hello"</b><span class="aw-static">STATIC MAP / ALL PATHS</span><span class="aw-dynamic" data-async-status>READY</span></div>
  <div class="aw-lab-grid">
    <div class="aw-execution">
      <p class="aw-panel-label">EXECUTION + TASK LIFETIMES</p>
      <pre class="aw-live-code"><code><span data-async-code="enter"><em>01</em> static async Task&lt;int&gt; CountAsync(Task&lt;string&gt; readTask)</span><span><em>02</em> {</span><span data-async-code="await"><em>03</em>     string text = await readTask;</span><span data-async-code="return"><em>04</em>     return text.Length;</span><span><em>05</em> }</span></code></pre>
      <div class="aw-lanes">
        <div class="aw-lane" data-async-lane="cpu"><b>THIS METHOD / CPU</b><span class="aw-static">Runs &rarr; yields &rarr; resumes</span><span class="aw-dynamic" data-async-value></span><div class="aw-track" aria-hidden="true"><i></i><span></span></div></div>
        <div class="aw-lane" data-async-lane="read"><b>READ TASK / STRING</b><span class="aw-static">Pending &rarr; value or error</span><span class="aw-dynamic" data-async-value></span><div class="aw-track" aria-hidden="true"><i></i><span></span></div></div>
        <div class="aw-lane" data-async-lane="result"><b>COUNT TASK / INT</b><span class="aw-static">Pending &rarr; 5 or fault</span><span class="aw-dynamic" data-async-value></span><div class="aw-track" aria-hidden="true"><i></i><span></span></div></div>
      </div>
      <p class="aw-memory"><b>SAVED STATE</b><span class="aw-static">Resume point + awaiter when suspended</span><span class="aw-dynamic" data-async-memory></span></p>
    </div>
    <div class="aw-machine-panel">
      <p class="aw-panel-label">CONCEPTUAL COMPILER STATE MACHINE</p>
      <svg class="aw-machine" viewBox="0 0 400 350" role="img" aria-labelledby="aw-machine-title aw-machine-desc">
        <title id="aw-machine-title">Async await state transitions synchronized with execution</title>
        <desc id="aw-machine-desc">Run synchronously, then inspect whether the awaiter is completed. If not, save state and suspend, then resume on completion. If already complete, go directly to GetResult. A successful result completes the method's task with 5; an uncaught error faults it. The two tasks and the method's execution are shown separately on the left.</desc>
        <defs><marker id="aw-machine-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="context-stroke"/></marker></defs>
        <g class="aw-machine-edges" fill="none" marker-end="url(#aw-machine-arrow)">
          <path data-async-edge="inspect" d="M200 48 V66"/>
          <path data-async-edge="suspend" d="M124 95 H81 V147"/>
          <path data-async-edge="fast" d="M276 95 H314 V220"/>
          <path data-async-edge="resume" d="M81 193 V220"/>
          <path data-async-edge="continue" d="M150 243 H242"/>
          <path data-async-edge="success" d="M314 266 V307"/>
          <path data-async-edge="error" d="M314 266 V287 H81 V307"/>
        </g>
        <g class="aw-machine-node" data-async-node="running" transform="translate(128 8)"><rect width="144" height="40" rx="10"/><text class="aw-node-title" x="72" y="25" text-anchor="middle">Run synchronously</text></g>
        <g class="aw-machine-node aw-decision" data-async-node="inspect" transform="translate(124 66)"><path d="M76 0 L152 29 L76 58 L0 29 Z"/><text class="aw-node-title" x="76" y="26" text-anchor="middle">Awaiter</text><text class="aw-node-detail" x="76" y="42" text-anchor="middle">completed?</text></g>
        <g class="aw-machine-node" data-async-node="suspended" transform="translate(12 147)"><rect width="138" height="46" rx="10"/><text class="aw-node-title" x="69" y="20" text-anchor="middle">Save + suspend</text><text class="aw-node-detail" x="69" y="36" text-anchor="middle">Return pending task</text></g>
        <g class="aw-machine-node" data-async-node="resume" transform="translate(12 220)"><rect width="138" height="46" rx="10"/><text class="aw-node-title" x="69" y="20" text-anchor="middle">Resume</text><text class="aw-node-detail" x="69" y="36" text-anchor="middle">Restore saved state</text></g>
        <g class="aw-machine-node" data-async-node="get-result" transform="translate(242 220)"><rect width="144" height="46" rx="10"/><text class="aw-node-title" x="72" y="20" text-anchor="middle">GetResult()</text><text class="aw-node-detail" x="72" y="36" text-anchor="middle">Value or exception</text></g>
        <g class="aw-machine-node" data-async-node="completed" transform="translate(242 307)"><rect width="144" height="35" rx="17"/><text class="aw-node-title" x="72" y="23" text-anchor="middle">Complete with 5</text></g>
        <g class="aw-machine-node" data-async-node="faulted" transform="translate(12 307)"><rect width="138" height="35" rx="17"/><text class="aw-node-title" x="69" y="23" text-anchor="middle">Fault the task</text></g>
        <g class="aw-edge-label"><text x="86" y="86">NO</text><text x="322" y="86">YES</text><text x="14" y="210">on completion</text><text x="176" y="233">continue</text><text x="324" y="299">value</text><text x="149" y="281">throws</text></g>
      </svg>
    </div>
  </div>
  <div class="aw-controls" hidden>
    <button type="button" class="aw-primary" data-async-action="toggle">Run</button>
    <button type="button" data-async-action="step">Step</button>
    <button type="button" data-async-action="replay">Replay</button>
    <label>Read task <select data-async-scenario><option value="pending">I/O pending</option><option value="ready">Already complete</option><option value="fault">I/O fails</option></select></label>
    <label>Speed <select data-async-speed><option value="1">1x</option><option value="2">2x</option></select></label>
    <progress data-async-progress max="1" value="0" aria-label="Illustrative sequence progress"></progress>
  </div>
  <p class="aw-summary aw-dynamic" data-async-summary role="status" aria-live="polite" aria-atomic="true"></p>
  <p class="aw-static aw-print-caption">Read the branches: incomplete &rarr; save / resume; already complete &rarr; direct to GetResult. No dedicated thread waits for the pictured I/O.</p>
</div>

<!--
The left and right panels are driven by one state snapshot. Use Step to inspect
the exact relationships, especially while I/O is pending and just after it finishes.
The bright outline indicates the current state, also named in the header. Mint
paths have already been visited. Thread identity/scheduler details are abstracted.
The input readTask and the method's return task are distinct. While suspended,
readTask is pending, the count task is pending and held by the caller, and this
method does not occupy a thread merely to wait. After readTask completes, the
continuation gets its value and finishes the count task.
In the already-completed scenario, the method does not suspend: it executes its
body and returns an already-completed count task to the caller. The slowed-down
animation represents conceptual steps, not actual asynchronous scheduling here.
In the fault scenario the read task completes faulted, GetResult throws inside
the method, and the uncaught exception faults the returned task. Cancellation,
context capture, inline continuation races, and multiple await points are omitted.
Resume can run on the same or another thread, depending on context/scheduling.
The diagram's labels are conceptual, not exact compiler-generated numeric states.
Print/no-JS/presenter views always retain a neutral all-paths diagram and captions.
-->

---

<!-- _class: aw -->

<p class="aw-eyebrow">03 / WHAT THE COMPILER KEEPS <span>A RESUME POINT / NOT A RESERVED THREAD</span></p>

## The method remembers where to continue.

<div class="aw-memory-layout">
  <div class="aw-state-card aw-enter">
    <p class="aw-panel-label">WHILE THE METHOD IS SUSPENDED</p>
    <div class="aw-state-field"><b>RESUME POINT</b><span>Which await should continue?</span></div>
    <div class="aw-state-field"><b>AWAITER</b><span>How to observe completion and get the result.</span></div>
    <div class="aw-state-field"><b>NEEDED VALUES</b><span>Only state that must survive suspension.</span></div>
    <div class="aw-state-field"><b>METHOD BUILDER</b><span>Completes or faults the returned task.</span></div>
    <p class="aw-state-caption">A conceptual view. Generated fields and optimizations vary.</p>
  </div>
  <div class="aw-rules">
    <div class="aw-rule aw-enter"><span>01 / NO MAGIC THREAD</span><h3>async does not mean Task.Run.</h3><p>The body starts synchronously.<br>Naturally asynchronous I/O need not occupy a waiting thread.</p></div>
    <div class="aw-rule aw-enter"><span>02 / NO GUARANTEED YIELD</span><h3>await can keep going.</h3><p>An already-completed awaiter takes the fast path. A continuation need not change threads.</p></div>
    <div class="aw-rule aw-enter"><span>03 / NO CONFUSION ABOUT TASKS</span><h3>Completion belongs to an operation.</h3><p>The read task delivers text.<br>The count task delivers a number, or a fault.</p></div>
  </div>
</div>

<p class="aw-takeaway"><span>THE MENTAL MODEL</span> Split execution at an incomplete await. Preserve state. Continue when ready.</p>
<p class="aw-sources">Sources: <a href="https://learn.microsoft.com/dotnet/csharp/language-reference/operators/await">C# await operator</a> &middot; <a href="https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model">Task-based async model</a> &middot; <a href="https://learn.microsoft.com/dotnet/csharp/language-reference/language-specification/classes#1514-async-functions">C# async functions / state machines</a></p>

<!--
The compiler transforms a Task-returning async method into a state machine and
associated builder. This is a high-level mental model, not an exact layout:
optimization level and compiler/runtime versions affect generated code.
The saved state does not preserve an entire blocked thread stack. Required locals
can be lifted; values not needed across suspension need not be stored.
GetResult may throw. The async machinery reports an uncaught exception through
the returned task. A real caller should observe/await that task and handle failures.
Do not infer fixed thread IDs, forced thread-pool hops, equal task identities,
or guaranteed performance improvements from this illustrative diagram.
The sample method and controlled completed/pending/faulted inputs were checked
with .NET 10. Animations themselves are native browser SVG/CSS/JavaScript.
-->
