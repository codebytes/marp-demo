(() => {
  "use strict";

  let playerScript;
  function loadPlayer() {
    if (!playerScript) {
      playerScript = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "assets/lottie.min.js";
        script.onload = () => resolve(window.lottie);
        script.onerror = () => reject(new Error("Could not load the local Lottie player."));
        document.head.append(script);
      });
    }
    return playerScript;
  }

  function initialize() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const printMedia = window.matchMedia("print");
    const experiments = [...document.querySelectorAll("[data-motion-technique]")].map((root) => {
      const slide = root.closest("svg[data-marpit-svg]");
      const controls = root.querySelector(".ml-controls");
      const toggle = root.querySelector('[data-motion-action="toggle"]');
      const replay = root.querySelector('[data-motion-action="replay"]');
      const status = root.querySelector("[data-motion-status]");
      const svg = root.querySelector(".ml-motion-svg");
      const motion = svg?.querySelector("animateMotion");
      const video = root.querySelector("video");
      const vector = root.querySelector(".ml-lottie");
      let player;
      let requested = false;
      let ready = !vector;
      let state = "idle";
      let active = false;
      let enabled = false;

      if (svg) svg.pauseAnimations();

      function render() {
        root.dataset.motionState = state;
        root.classList.toggle("ml-playing", state === "running" && active && enabled);
        toggle.textContent = { idle: "Play once", running: "Pause", paused: "Resume", complete: "Play again", error: "Unavailable" }[state];
        toggle.disabled = replay.disabled = !ready || !active || state === "error";
        status.textContent = state === "error" ? "Could not load / see console"
          : !ready ? "Loading local vector data..." : {
          idle: "Ready / plays once", running: video ? "Playing / local video" : "Playing / 4 seconds",
          paused: "Paused / resume when ready", complete: "Complete / replay to compare",
        }[state];
      }

      function reset() {
        state = "idle";
        root.classList.remove("ml-armed", "ml-playing");
        if (svg) {
          svg.pauseAnimations();
          svg.setCurrentTime(0);
        }
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        if (player) player.goToAndStop(0, true);
        render();
      }

      function finish() {
        if (state !== "running") return;
        state = "complete";
        if (svg) svg.pauseAnimations();
        if (player) player.pause();
        render();
      }

      function fail(error) {
        reset();
        state = "error";
        console.error("Motion Lab playback failed:", error);
        render();
      }

      async function prepareVector() {
        requested = true;
        try {
          const [lottie, response] = await Promise.all([
            loadPlayer(),
            fetch("assets/motion-lab/specimen.lottie.json"),
          ]);
          if (!response.ok) throw new Error(`Lottie data returned HTTP ${response.status}.`);
          player = lottie.loadAnimation({
            container: vector, renderer: "svg", loop: false, autoplay: false,
            animationData: await response.json(),
          });
          player.addEventListener("DOMLoaded", () => {
            ready = true;
            render();
          });
          player.addEventListener("complete", finish);
          player.addEventListener("data_failed", () => fail(new Error("Lottie could not render the local composition.")));
          player.addEventListener("error", (event) => fail(new Error(`Lottie renderer: ${event.message || event.type}`)));
        } catch (error) {
          fail(error);
        }
      }

      function play(restart = false) {
        if (!active || !enabled || !ready || state === "error") return;
        if (restart || state !== "paused") {
          reset();
          // Removing the animation for one style calculation gives Replay a fresh CSS timeline.
          void root.offsetWidth;
          root.classList.add("ml-armed");
          if (motion) motion.beginElement();
        }
        state = "running";
        if (svg) svg.unpauseAnimations();
        if (player) player.play();
        if (video) video.play().catch((error) => {
          if (error.name === "AbortError" && state !== "running") return;
          fail(error);
        });
        render();
      }

      function pause() {
        if (state !== "running") return;
        state = "paused";
        if (svg) svg.pauseAnimations();
        if (video) video.pause();
        if (player) player.pause();
        render();
      }

      toggle.addEventListener("click", () => state === "running" ? pause() : play());
      replay.addEventListener("click", () => play(true));
      root.addEventListener("animationend", () => {
        const animations = root.getAnimations({ subtree: true });
        if (animations.length && animations.every((animation) => animation.playState === "finished")) finish();
      });
      if (motion) motion.addEventListener("endEvent", finish);
      if (video) {
        video.addEventListener("ended", finish);
        video.addEventListener("error", () => fail(new Error(`Local video could not load or decode (code ${video.error?.code}).`)));
      }
      for (const name of ["keydown", "touchstart", "touchend"]) {
        controls.addEventListener(name, (event) => event.stopPropagation());
      }
      render();

      return {
        slide,
        update(audience) {
          const nextEnabled = audience && !reducedMotion.matches && !printMedia.matches;
          const nextActive = nextEnabled && slide.classList.contains("bespoke-marp-active") && !document.hidden;
          if (!nextEnabled && state !== "error" && (enabled || state !== "idle")) reset();
          else if (!nextActive) pause();
          enabled = nextEnabled;
          active = nextActive;
          controls.hidden = !enabled;
          root.dataset.enhanced = String(audience);
          root.dataset.motionControls = String(enabled);
          root.dataset.motionActive = String(active);
          if (vector && active && !requested) void prepareVector();
          render();
        },
      };
    });

    function update() {
      const audience = document.body.getAttribute("data-bespoke-view") === "";
      for (const experiment of experiments) experiment.update(audience);
    }

    const observer = new MutationObserver(update);
    for (const { slide } of experiments) observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-bespoke-view"] });
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    printMedia.addEventListener("change", update);
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
