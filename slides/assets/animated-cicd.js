(() => {
  "use strict";

  const stages = [
    { nodes: ["commit"], edges: [], duration: 1100, message: "Commit received. A new delivery run begins." },
    { nodes: ["build"], edges: ["commit-build"], duration: 1900, message: "Build workers compile the application and reuse cached layers." },
    { nodes: ["tests", "security"], edges: ["build-tests", "build-security"], duration: 2600, message: "Tests and security checks run in parallel. Both must pass." },
    { nodes: ["artifact"], edges: ["tests-artifact", "security-artifact"], duration: 1700, message: "Checks passed. Sign and publish one immutable artifact." },
    { nodes: ["staging"], edges: ["artifact-staging"], duration: 2300, message: "Deploy the same artifact to staging and run smoke tests." },
    { nodes: ["production"], edges: ["staging-production"], duration: 4200, message: "Release approved. Increase canary traffic while checking health." },
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const printMedia = window.matchMedia("print");

  function createPipeline(root) {
    const controls = root.querySelector(".cicd-controls");
    const toggle = root.querySelector('[data-action="toggle"]');
    const step = root.querySelector('[data-action="step"]');
    const approve = root.querySelector('[data-action="approve"]');
    const summary = root.querySelector("[data-summary]");
    const progress = root.querySelector("[data-progress]");
    const percent = root.querySelector("[data-percent]");
    const nodes = [...root.querySelectorAll("[data-node]")];
    const routes = [...root.querySelectorAll("[data-edge]")].map((path) => {
      const packet = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      packet.setAttribute("class", "cicd-packet");
      packet.setAttribute("r", "4.5");
      packet.setAttribute("aria-hidden", "true");
      path.after(packet);
      return { path, packet, length: path.getTotalLength() };
    });
    let stage = 0;
    let elapsed = 0;
    let mode = "idle";
    let scenario = "healthy";
    let speed = 1;
    let visible = false;
    let enhanced = false;
    let started = false;
    let frame = null;
    let lastTime = null;

    function renderProgress() {
      const value = mode === "complete" || mode === "failed" ? 1 : elapsed / stages[stage].duration;
      progress.value = value;
      percent.textContent = `${Math.round(value * 100)}%`;
      if (stage === stages.length - 1 && (mode === "running" || mode === "paused")) {
        const traffic = value < 0.3 ? 10 : value < 0.6 ? 25 : value < 0.9 ? 50 : 100;
        root.querySelector('[data-node="production"] [data-node-state]').textContent = `CANARY ${traffic}%`;
      }
      for (const { path, packet, length } of routes) {
        const active = path.dataset.state === "active" && !reducedMotion.matches;
        packet.dataset.active = String(active);
        if (active) {
          const point = path.getPointAtLength(length * ((elapsed / 1100) % 1));
          packet.setAttribute("cx", String(point.x));
          packet.setAttribute("cy", String(point.y));
        }
      }
    }

    function render() {
      root.dataset.state = mode;
      root.dataset.stage = String(stage);
      const labels = { idle: "READY", running: "RUNNING", paused: "PAUSED", approval: "AWAITING APPROVAL", failed: "RELEASE BLOCKED", complete: "RELEASE COMPLETE" };
      root.querySelector("[data-run-state]").textContent = labels[mode];
      toggle.textContent = mode === "running" ? "Pause" : mode === "paused" ? "Resume" : mode === "complete" || mode === "failed" ? "Run again" : "Run pipeline";
      toggle.disabled = mode === "approval";
      step.disabled = ["approval", "failed", "complete"].includes(mode);
      approve.disabled = mode !== "approval";

      const messages = {
        idle: "Ready. Run the pipeline, or use Step to explain one stage at a time.",
        approval: "Staging is healthy. Waiting for your approval to release.",
        failed: "Tests failed. No artifact published; staging and production stay unchanged.",
        complete: "Release complete. The verified artifact now serves 100% of traffic.",
      };
      summary.textContent = messages[mode] || `${mode === "paused" ? "Paused: " : ""}${stages[stage].message}`;
      for (const node of nodes) {
        const index = stages.findIndex((item) => item.nodes.includes(node.dataset.node));
        let state = "queued";
        let label = "QUEUED";
        if (mode !== "idle") {
          if (index < stage || mode === "complete") {
            state = "done";
            label = "PASSED";
          } else if (index === stage && mode !== "approval") {
            state = "active";
            label = mode === "paused" ? "PAUSED" : "RUNNING";
          }
          if (mode === "approval" && index === stage) label = "LOCKED";
          if (mode === "failed" && index >= stage) {
            state = index > stage ? "blocked" : node.dataset.node === "tests" ? "failed" : "done";
            label = index > stage ? "NOT RUN" : node.dataset.node === "tests" ? "FAILED" : "PASSED";
          }
        }
        node.dataset.state = state;
        node.querySelector("[data-node-state]").textContent = label;
      }
      for (const { path } of routes) {
        const index = stages.findIndex((item) => item.edges.includes(path.dataset.edge));
        path.dataset.state = mode === "idle" ? "queued"
          : index < stage || mode === "complete" ? "done"
          : index === stage && ["running", "paused"].includes(mode) ? "active" : "queued";
      }
      renderProgress();
    }

    function finishStage(nextMode) {
      if (stage === 2 && scenario === "fail") {
        mode = "failed";
      } else if (stage === stages.length - 1) {
        mode = "complete";
      } else {
        stage += 1;
        elapsed = 0;
        mode = stage === stages.length - 1 ? "approval" : nextMode;
      }
      render();
    }

    function tick(now) {
      frame = null;
      if (!visible || mode !== "running") return;
      if (lastTime !== null) elapsed += (now - lastTime) * speed;
      lastTime = now;
      if (elapsed >= stages[stage].duration) finishStage("running");
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

    function run() {
      if (["idle", "failed", "complete"].includes(mode)) {
        stage = 0;
        elapsed = 0;
      }
      started = true;
      mode = "running";
      render();
      syncClock();
    }

    toggle.addEventListener("click", () => {
      if (mode === "running") {
        mode = "paused";
        render();
        syncClock();
      } else {
        run();
      }
    });
    step.addEventListener("click", () => {
      started = true;
      finishStage("paused");
      syncClock();
    });
    root.querySelector('[data-action="replay"]').addEventListener("click", () => {
      mode = "idle";
      run();
    });
    approve.addEventListener("click", () => {
      mode = "running";
      render();
      syncClock();
    });
    root.querySelector("[data-scenario]").addEventListener("change", (event) => {
      scenario = event.target.value;
      stage = 0;
      elapsed = 0;
      mode = "idle";
      started = true;
      render();
      syncClock();
    });
    root.querySelector("[data-speed]").addEventListener("change", (event) => {
      speed = Number(event.target.value);
    });
    for (const event of ["keydown", "touchstart", "touchend"]) {
      controls.addEventListener(event, (e) => e.stopPropagation());
    }

    return {
      update(isVisible, isAudience) {
        visible = isVisible && isAudience;
        if (enhanced !== isAudience) {
          enhanced = isAudience;
          root.dataset.enhanced = String(enhanced);
          controls.hidden = !enhanced;
          render();
        }
        if (visible && !started && !reducedMotion.matches) run();
        else syncClock();
      },
      reduceMotion() {
        if (reducedMotion.matches && mode === "running") mode = "paused";
        render();
      },
    };
  }

  function initialize() {
    const entries = [...document.querySelectorAll("section.cicd")].map((section) => ({
      section,
      slide: section.closest("svg[data-marpit-svg]") || section,
      pipeline: section.querySelector("[data-pipeline]") ? createPipeline(section.querySelector("[data-pipeline]")) : null,
    }));

    function update() {
      // Marp's audience, presenter, and next-slide windows have separate DOMs.
      const audience = document.body.getAttribute("data-bespoke-view") === "";
      for (const { section, slide, pipeline } of entries) {
        const active = audience && slide.classList.contains("bespoke-marp-active")
          && !document.hidden && !printMedia.matches;
        section.classList.toggle("cicd-live", active && !reducedMotion.matches);
        if (pipeline) pipeline.update(active, audience);
      }
    }

    const observer = new MutationObserver(update);
    for (const { slide } of entries) observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-bespoke-view"] });
    document.addEventListener("visibilitychange", update);
    printMedia.addEventListener("change", update);
    reducedMotion.addEventListener("change", () => {
      for (const { pipeline } of entries) if (pipeline) pipeline.reduceMotion();
      update();
    });
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
