(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const printMedia = window.matchMedia("print");
  const morphNames = ["stage", "kicker", "title", "dek", "step-1", "step-2", "step-3", "stat", "note"].map((name) => `sl-live-${name}`);
  const deckKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

  function transitionActive() {
    try {
      return document.documentElement.matches(":active-view-transition");
    } catch {
      return false;
    }
  }

  // Load every bundled face up front, so a slide transition never captures text that is still invisible.
  function preloadFonts() {
    for (const face of document.fonts) {
      if (face.family.replace(/["']/g, "").startsWith("SL ") && face.status === "unloaded") {
        face.load().catch((error) => console.warn("Style Lab could not load a bundled font:", error));
      }
    }
  }

  function installMorphTiming() {
    const style = document.createElement("style");
    const groups = morphNames.map((name) => `::view-transition-group(${name})`).join(", ");
    const images = morphNames.map((name) => `::view-transition-old(${name}), ::view-transition-new(${name})`).join(", ");
    // Cross-fade quickly, then let the shared boxes glide, so the in-between frames stay crisp.
    style.textContent = `${groups} { animation-duration: 720ms; animation-timing-function: cubic-bezier(.45, 0, .2, 1); } ${images} { animation-duration: 300ms; animation-timing-function: ease-out; }`;
    document.head.append(style);
  }

  function createLab(root) {
    const stage = root.querySelector("[data-live-stage]");
    const controls = root.querySelector(".sl-live-controls");
    const buttons = [...controls.querySelectorAll("[data-style-choice]")];
    const status = root.querySelector("[data-style-status]");
    const authored = stage.dataset.style;
    let current = authored;
    let enhanced = false;

    function describe(style) {
      const label = document.querySelector(`.sl-stage[data-style="${style}"] > .sl-label`);
      return label ? `${label.querySelector("h2").textContent}: ${label.lastElementChild.textContent}` : style;
    }

    function mark(style) {
      for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.styleChoice === style));
      status.textContent = describe(style);
    }

    function restage(style) {
      stage.classList.replace(`sl-${current}`, `sl-${style}`);
      stage.dataset.style = style;
      current = style;
    }

    function apply(style) {
      mark(style);
      restage(style);
    }

    function choose(style) {
      if (!enhanced || style === current) return;
      const canMorph = typeof document.startViewTransition === "function" && !reducedMotion.matches && !transitionActive();
      if (!canMorph) {
        apply(style);
        return;
      }
      // Update the controls before the old snapshot, so only the stage morphs.
      mark(style);
      root.classList.add("sl-morphing");
      const transition = document.startViewTransition(() => restage(style));
      transition.ready.catch(() => {});
      transition.finished.finally(() => root.classList.remove("sl-morphing"));
    }

    for (const button of buttons) button.addEventListener("click", () => choose(button.dataset.styleChoice));
    // Space and Enter press the focused button. Marp ignores every key aimed at a button, so
    // navigation keys release focus and go back to the deck, where arrows and clickers expect them.
    controls.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") event.stopPropagation();
      else if (deckKeys.has(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.stopPropagation();
        event.preventDefault();
        event.target.blur();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: event.key, code: event.code, shiftKey: event.shiftKey, bubbles: true, cancelable: true }));
      }
    });
    for (const name of ["touchstart", "touchend"]) {
      controls.addEventListener(name, (event) => event.stopPropagation());
    }
    status.textContent = describe(current);

    return {
      update(audience) {
        const nextEnhanced = audience && !printMedia.matches;
        if (!nextEnhanced && current !== authored) apply(authored);
        enhanced = nextEnhanced;
        root.dataset.enhanced = String(enhanced);
        controls.hidden = !enhanced;
      },
    };
  }

  function initialize() {
    const entries = [...document.querySelectorAll("section.sl")].map((section) => ({
      section,
      slide: section.closest("svg[data-marpit-svg]") || section,
    }));
    const labs = [...document.querySelectorAll("[data-style-lab]")].map(createLab);

    function update() {
      const audience = document.body.getAttribute("data-bespoke-view") === "";
      for (const { section, slide } of entries) {
        const active = audience && slide.classList.contains("bespoke-marp-active") && !document.hidden && !printMedia.matches;
        section.classList.toggle("sl-active", active && !reducedMotion.matches);
      }
      for (const lab of labs) lab.update(audience);
    }

    preloadFonts();
    if (labs.length) installMorphTiming();
    const observer = new MutationObserver(update);
    for (const { slide } of entries) observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-bespoke-view"] });
    document.addEventListener("visibilitychange", update);
    printMedia.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
