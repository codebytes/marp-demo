(() => {
  "use strict";

  const deckKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const printMedia = window.matchMedia("print");
  const paths = {
    pending: ["enter", "inspect", "suspend", "waiting", "resume", "get-result", "complete"],
    ready: ["enter", "inspect", "get-result", "complete"],
    fault: ["enter", "inspect", "suspend", "waiting", "resume", "get-result", "fault"],
  };
  const steps = {
    enter: { node: "running", edge: null, line: "enter", duration: 1100 },
    inspect: { node: "inspect", edge: "inspect", line: "await", duration: 1400 },
    suspend: { node: "suspended", edge: "suspend", line: "await", duration: 1300 },
    waiting: { node: "suspended", edge: null, line: "await", duration: 2800 },
    resume: { node: "resume", edge: "resume", line: "await", duration: 1300 },
    "get-result": { node: "get-result", edge: "continue", line: "await", duration: 1400 },
    complete: { node: "completed", edge: "success", line: "return", duration: 0 },
    fault: { node: "faulted", edge: "error", line: "await", duration: 0 },
  };

  function createLab(root) {
    const controls = root.querySelector(".aw-controls");
    const toggle = root.querySelector('[data-async-action="toggle"]');
    const stepButton = root.querySelector('[data-async-action="step"]');
    const progress = root.querySelector("[data-async-progress]");
    const lanes = Object.fromEntries([...root.querySelectorAll("[data-async-lane]")].map((lane) => [lane.dataset.asyncLane, lane]));
    const nodes = [...root.querySelectorAll("[data-async-node]")];
    const edges = [...root.querySelectorAll("[data-async-edge]")];
    let scenario = "pending";
    let index = 0;
    let elapsed = 0;
    let mode = "idle";
    let speed = 1;
    let visible = false;
    let enhanced = false;
    let frame = null;
    let lastTime = null;

    function snapshot() {
      const name = paths[scenario][index];
      const current = steps[name];
      const done = name === "complete" || name === "fault";
      const suspended = name === "suspend" || name === "waiting";
      const inputFinished = scenario === "ready" || ["resume", "get-result", "complete", "fault"].includes(name);
      const failedRead = scenario === "fault" && inputFinished;
      const returned = done || (scenario !== "ready" && index >= 2);
      return {
        name, ...current, done, suspended, inputFinished, returned,
        edge: name === "get-result" && scenario === "ready" ? "fast" : current.edge,
        cpu: suspended ? "yielded" : done ? "finished" : "executing",
        read: failedRead ? "faulted" : inputFinished ? "completed" : "pending",
        result: name === "fault" ? "faulted" : name === "complete" ? "completed" : "pending",
      };
    }

    function renderProgress() {
      const state = snapshot();
      const fraction = state.done ? 1 : Math.min(elapsed / state.duration, 1);
      progress.value = state.done ? 1 : (index + fraction) / (paths[scenario].length - 1);
      const amounts = {
        cpu: state.cpu === "executing" ? fraction : state.cpu === "finished" ? 1 : 0,
        read: state.inputFinished ? 1 : state.name === "waiting" ? fraction : 0,
        result: state.done ? 1 : 0,
      };
      for (const [name, lane] of Object.entries(lanes)) {
        lane.querySelector(".aw-track > i").style.width = `${amounts[name] * 100}%`;
        const token = lane.querySelector(".aw-track > span");
        const moving = (name === "cpu" && state.cpu === "executing") || (name === "read" && state.name === "waiting");
        token.dataset.active = String(moving && !reducedMotion.matches);
        token.style.opacity = moving && !reducedMotion.matches ? "1" : "0";
        token.style.left = `calc(${fraction * 100}% - ${fraction * 12}px)`;
      }
    }

    function render() {
      const state = snapshot();
      const visited = paths[scenario].slice(0, index).map((name) => ({
        ...steps[name], edge: name === "get-result" && scenario === "ready" ? "fast" : steps[name].edge,
      }));
      root.dataset.state = mode;
      root.dataset.step = state.name;
      root.dataset.scenario = scenario;
      root.dataset.machine = state.node;
      root.dataset.saved = String(state.suspended);
      root.dataset.returned = String(state.returned);
      root.querySelector("[data-async-status]").textContent =
        `${{ idle: "READY", running: "PLAYING", paused: "PAUSED", complete: "FINISHED" }[mode]} / ${state.node.toUpperCase()}`;
      toggle.textContent = mode === "running" ? "Pause" : mode === "paused" ? "Resume" : state.done ? "Run again" : "Run";
      stepButton.disabled = state.done;
      for (const node of nodes) {
        node.dataset.state = node.dataset.asyncNode === state.node ? "active"
          : visited.some((item) => item.node === node.dataset.asyncNode) ? "visited" : "queued";
      }
      for (const edge of edges) {
        edge.dataset.state = edge.dataset.asyncEdge === state.edge ? "active"
          : visited.some((item) => item.edge === edge.dataset.asyncEdge) ? "visited" : "queued";
      }
      for (const line of root.querySelectorAll("[data-async-code]")) {
        line.dataset.active = String(line.dataset.asyncCode === state.line);
      }

      const cpuText = state.suspended ? "Control returned; no thread held by this await."
        : state.done ? "Method finished; no execution remains."
        : ["resume", "get-result"].includes(state.name) && scenario !== "ready" ? "Continuation executing (thread may differ)."
        : "Calling thread executes the method.";
      const readText = state.read === "faulted" ? 'Faulted: "Read failed".'
        : state.read === "completed" ? 'Completed with "hello".' : "Pending; I/O proceeds independently.";
      const resultText = state.result === "completed" ? "Completed with 5."
        : state.result === "faulted" ? 'Faulted: "Read failed".'
        : state.returned ? "Pending; already held by the caller." : "Pending; call has not returned yet.";
      for (const [name, text] of [["cpu", cpuText], ["read", readText], ["result", resultText]]) {
        lanes[name].dataset.status = state[name];
        lanes[name].querySelector("[data-async-value]").textContent = text;
      }
      root.querySelector("[data-async-memory]").textContent = state.suspended ? "Resume point + awaiter retained."
        : state.name === "resume" ? "Restore resume point; consume saved awaiter."
        : scenario === "ready" ? "This await does not suspend or save a resume point."
        : state.name === "get-result" ? "Awaiter consumed; no suspended state."
        : state.done ? "No suspended state remains." : "No suspended await state yet.";

      const summaries = {
        enter: "CountAsync begins synchronously. The input read task and the method's return task are different operations.",
        inspect: scenario === "ready" ? "IsCompleted is true. Skip suspension and continue on the calling thread."
          : "IsCompleted is false. The compiler-generated machinery must preserve where to resume.",
        suspend: "Save the awaiter and resume point, arrange a continuation, and return the pending count task to the caller.",
        waiting: "The method is suspended, not executing. No dedicated thread waits for the pictured I/O; both tasks are still pending.",
        resume: "The read task has finished. Resume the method; the count task is still pending until the method finishes.",
        "get-result": scenario === "fault" ? "GetResult observes the read failure and throws inside CountAsync."
          : 'GetResult supplies "hello". Execution can now evaluate text.Length.',
        complete: scenario === "ready" ? "The whole method completed synchronously. The caller receives a completed task containing 5."
          : "The continuation returns 5. The method's count task is now complete, after the read task.",
        fault: "The uncaught read exception faults the count task. Its caller observes the error when awaiting that task.",
      };
      root.querySelector("[data-async-summary]").textContent = summaries[state.name];
      renderProgress();
    }

    function advance() {
      index = Math.min(index + 1, paths[scenario].length - 1);
      elapsed = 0;
      if (index === paths[scenario].length - 1) mode = "complete";
      render();
    }

    function tick(now) {
      frame = null;
      if (!visible || mode !== "running") return;
      if (lastTime !== null) elapsed += (now - lastTime) * speed;
      lastTime = now;
      if (elapsed >= snapshot().duration) advance();
      else renderProgress();
      if (mode === "running") frame = requestAnimationFrame(tick);
      else lastTime = null;
    }

    function syncClock() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
      if (visible && mode === "running") frame = requestAnimationFrame(tick);
    }

    function reset() {
      index = 0;
      elapsed = 0;
      mode = "idle";
    }

    function run() {
      if (mode === "complete") reset();
      mode = "running";
      render();
      syncClock();
    }

    toggle.addEventListener("click", () => {
      if (mode === "running") {
        mode = "paused";
        render();
        syncClock();
      } else run();
    });
    stepButton.addEventListener("click", () => {
      mode = "paused";
      advance();
      syncClock();
    });
    root.querySelector('[data-async-action="replay"]').addEventListener("click", () => {
      reset();
      run();
    });
    root.querySelector("[data-async-scenario]").addEventListener("change", (event) => {
      scenario = event.target.value;
      reset();
      render();
      syncClock();
    });
    root.querySelector("[data-async-speed]").addEventListener("change", (event) => {
      speed = Number(event.target.value);
    });
    // Keys stay with the controls, but navigation keys on a focused button release it and go back to the
    // deck: Marp ignores every key aimed at a button, and presenters expect arrows and clickers to work.
    controls.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.target.tagName !== "BUTTON" || !deckKeys.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      event.target.blur();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: event.key, code: event.code, shiftKey: event.shiftKey, bubbles: true, cancelable: true }));
    });
    for (const name of ["touchstart", "touchend"]) {
      controls.addEventListener(name, (event) => event.stopPropagation());
    }

    return {
      update(isVisible, isAudience) {
        visible = isVisible && isAudience;
        if (enhanced !== isAudience) {
          enhanced = isAudience;
          root.dataset.enhanced = String(enhanced);
          controls.hidden = !enhanced;
          if (enhanced) render();
        }
        syncClock();
      },
      reduceMotion() {
        if (reducedMotion.matches && mode === "running") mode = "paused";
        if (enhanced) render();
      },
    };
  }

  function initialize() {
    const entries = [...document.querySelectorAll("section.aw")].map((section) => ({
      section,
      slide: section.closest("svg[data-marpit-svg]") || section,
      lab: section.querySelector("[data-async-lab]") ? createLab(section.querySelector("[data-async-lab]")) : null,
    }));
    function update() {
      const audience = document.body.getAttribute("data-bespoke-view") === "";
      for (const { section, slide, lab } of entries) {
        const active = audience && slide.classList.contains("bespoke-marp-active")
          && !document.hidden && !printMedia.matches;
        section.classList.toggle("aw-active", active && !reducedMotion.matches);
        if (lab) lab.update(active, audience);
      }
    }
    const observer = new MutationObserver(update);
    for (const { slide } of entries) observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-bespoke-view"] });
    document.addEventListener("visibilitychange", update);
    printMedia.addEventListener("change", update);
    reducedMotion.addEventListener("change", () => {
      for (const { lab } of entries) if (lab) lab.reduceMotion();
      update();
    });
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
