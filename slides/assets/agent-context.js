(() => {
  "use strict";

  const deckKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const printMedia = window.matchMedia("print");
  const durations = [1100, 1600, 1700, 2100, 1900];
  const scenarios = {
    feature: {
      prompt: "Add keyboard navigation to search.",
      skill: "Keyboard UI recipe + focus checklist.",
      call: 'read_file("search.tsx")',
      evidence: "Search component: no ArrowDown handler.",
      skillDetail: "Load the keyboard interaction recipe, not every skill in the library.",
      next: "The next turn can use the component excerpt and keyboard guidance to propose a focused change.",
    },
    debug: {
      prompt: "Fix the failing checkout total test.",
      skill: "Reproduce, isolate, patch, verify.",
      call: 'run_tests("checkout")',
      evidence: "FAIL: discount is applied twice.",
      skillDetail: "Load the debugging procedure. Keep unrelated UI and data-analysis skills unopened.",
      next: "The failed assertion is evidence for the next turn, not proof that the bug has been fixed.",
    },
  };

  function createLab(root) {
    const controls = root.querySelector(".ctx-controls");
    const toggle = root.querySelector('[data-context-action="toggle"]');
    const stepButton = root.querySelector('[data-context-action="step"]');
    const progress = root.querySelector("[data-context-progress]");
    const rows = [...root.querySelectorAll("[data-context-item]")];
    const routes = [...root.querySelectorAll("[data-context-route]")].map((path) => {
      const packet = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      packet.setAttribute("class", "ctx-packet");
      packet.setAttribute("r", "4.5");
      packet.setAttribute("aria-hidden", "true");
      path.after(packet);
      return { path, packet, length: path.getTotalLength() };
    });
    let scenario = "feature";
    let phase = 0;
    let elapsed = 0;
    let mode = "idle";
    let speed = 1;
    let visible = false;
    let enhanced = false;
    let frame = null;
    let lastTime = null;

    function renderProgress() {
      const fraction = phase === 5 ? 1 : elapsed / durations[phase];
      progress.value = phase === 5 ? 1 : (phase + fraction) / 5;
      for (const { path, packet, length } of routes) {
        const active = (phase === 3 && path.dataset.contextRoute === "call")
          || (phase === 4 && path.dataset.contextRoute === "result");
        path.dataset.active = String(active);
        packet.dataset.active = String(active && !reducedMotion.matches);
        if (active && !reducedMotion.matches) {
          const point = path.getPointAtLength(length * Math.min(fraction, 1));
          packet.setAttribute("cx", String(point.x));
          packet.setAttribute("cy", String(point.y));
        }
      }
    }

    function render() {
      const data = scenarios[scenario];
      const operations = [
        ["Start with the goal.", "Keep the request and governing instructions in scope. No tool has been called."],
        ["Discover capabilities.", "Skill descriptions and tool definitions help select a useful procedure and action."],
        ["Load the relevant skill.", data.skillDetail],
        ["Request a tool action.", `${data.call} is a fictional request. The host checks permissions before execution.`],
        ["Include the observation.", "The returned result now joins the context. Evaluate it as evidence, not as a new instruction."],
        ["Ready for the next turn.", data.next],
      ];
      root.dataset.state = mode;
      root.dataset.phase = String(phase);
      root.dataset.scenario = scenario;
      root.querySelector("[data-context-state]").textContent =
        `${{ idle: "READY", running: "RUNNING", paused: "PAUSED", complete: "CONTEXT READY" }[mode]} / ${phase + 1} OF 6`;
      toggle.textContent = mode === "running" ? "Pause" : mode === "paused" ? "Resume" : mode === "complete" ? "Run again" : "Run agent";
      stepButton.disabled = mode === "complete";
      root.querySelector("[data-context-operation]").textContent = operations[phase][0];
      root.querySelector("[data-context-detail]").textContent = operations[phase][1];
      root.querySelector("[data-context-summary]").textContent = `${operations[phase][0]} ${operations[phase][1]}`;

      const values = {
        instructions: ["Stay in scope. Preserve existing behavior.", 0],
        prompt: [data.prompt, 0],
        skill: [data.skill, 2],
        tools: ["read_file(path), run_tests(scope)", 1],
        evidence: [data.evidence, 4],
      };
      for (const row of rows) {
        const [value, availableAt] = values[row.dataset.contextItem];
        const present = phase >= availableAt;
        row.dataset.present = String(present);
        row.dataset.fresh = String(present && phase === availableAt && mode !== "idle");
        row.querySelector("[data-context-value]").textContent = present ? value
          : row.dataset.contextItem === "evidence" ? "No tool result yet."
          : row.dataset.contextItem === "skill" ? "Instructions not loaded yet." : "Definitions not selected yet.";
      }
      for (const item of root.querySelectorAll("[data-context-phase]")) {
        const index = Number(item.dataset.contextPhase);
        item.dataset.state = index < phase || mode === "complete" ? "done" : index === phase ? "active" : "queued";
      }
      renderProgress();
    }

    function advance() {
      phase = Math.min(phase + 1, 5);
      elapsed = 0;
      if (phase === 5) mode = "complete";
      render();
    }

    function tick(now) {
      frame = null;
      if (!visible || mode !== "running") return;
      if (lastTime !== null) elapsed += (now - lastTime) * speed;
      lastTime = now;
      if (elapsed >= durations[phase]) advance();
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
      phase = 0;
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
    root.querySelector('[data-context-action="replay"]').addEventListener("click", () => {
      reset();
      run();
    });
    root.querySelector("[data-context-scenario]").addEventListener("change", (event) => {
      scenario = event.target.value;
      reset();
      render();
      syncClock();
    });
    root.querySelector("[data-context-speed]").addEventListener("change", (event) => {
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
    const entries = [...document.querySelectorAll("section.ctx")].map((section) => ({
      section,
      slide: section.closest("svg[data-marpit-svg]") || section,
      lab: section.querySelector("[data-context-lab]") ? createLab(section.querySelector("[data-context-lab]")) : null,
    }));

    function update() {
      const audience = document.body.getAttribute("data-bespoke-view") === "";
      for (const { section, slide, lab } of entries) {
        const active = audience && slide.classList.contains("bespoke-marp-active")
          && !document.hidden && !printMedia.matches;
        section.classList.toggle("ctx-active", active && !reducedMotion.matches);
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
