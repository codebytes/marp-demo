---
marp: true
lang: en
theme: style-lab
paginate: true
title: Style Lab
description: One slide of HTML dressed eight ways, from a risograph zine to LaTeX Beamer, with bundled open fonts and a live restyle.
transition: fade 500ms
---

<!-- _class: sl sl-frame sl-cover -->
<!-- _paginate: skip -->
<!-- _transition: fade 600ms -->

<h1 class="sl-cover-title"><span class="sl-word-swiss">Same</span> <span class="sl-word-riso" data-text="words.">words.</span><br><span class="sl-word-editorial">Different</span> <span class="sl-word-sketch">worlds.</span></h1>

<p class="sl-intro"><strong>Style Lab.</strong> One slide of HTML, dressed eight ways.<br>Change the stylesheet. Keep the story.</p>

<ul class="sl-wall" aria-label="The eight styles in this deck">
  <li><div class="sl-swatch sl-house" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>00</b> House style</p></li>
  <li><div class="sl-swatch sl-riso" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>01</b> Risograph zine</p></li>
  <li><div class="sl-swatch sl-swiss" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>02</b> Swiss poster</p></li>
  <li><div class="sl-swatch sl-brutal" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>03</b> Neo-brutalist</p></li>
  <li><div class="sl-swatch sl-sketch" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>04</b> Sketchnote</p></li>
  <li><div class="sl-swatch sl-blueprint" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>05</b> Blueprint</p></li>
  <li><div class="sl-swatch sl-editorial" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>06</b> Broadsheet</p></li>
  <li><div class="sl-swatch sl-beamer" aria-hidden="true"><span data-text="Aa">Aa</span></div><p><b>07</b> LaTeX Beamer</p></li>
</ul>

<p class="sl-cover-foot">Arrow keys to explore. Near the end, restyle the same slide live.</p>

<script src="assets/style-lab.js" defer></script>

<!--
Style Lab is CSS Zen Garden for slides. Every style slide repeats the same HTML
specimen; only one class on its stage changes. Eight complete styles follow: the
house style of the other decks as a control, then a risograph zine, a Swiss
poster, neo-brutalism, a sketchnote, a blueprint, a broadsheet front page, and
LaTeX Beamer, the look the Marp community recreates most often.
Every departure bundles its fonts locally under open licenses, so the HTML and
the PDF render the same type on any machine; the house control keeps the other
decks' system fonts. Textures are CSS gradients, blend modes, and SVG
data URIs; the deck contains no raster images.
The live restyle slide morphs one element tree between styles with the View
Transition API. Source: https://www.csszengarden.com/
-->

---

<!-- _class: sl sl-frame sl-setup -->

## One specimen. Eight stylesheets.

<p class="sl-subtitle">Every style slide repeats this HTML. Only one class on the stage changes.</p>

<div class="sl-setup-grid">
<pre class="sl-code"><code>&lt;div class="sl-stage <mark>sl-riso</mark>"&gt;
  &lt;article class="sl-specimen"&gt;
    &lt;p class="sl-kicker"&gt;Field notes · Vol. 1&lt;/p&gt;
    &lt;h3 class="sl-title"&gt;Good ideas travel…&lt;/h3&gt;
    &lt;p class="sl-dek"&gt;Sketch it, shape it…&lt;/p&gt;
    &lt;ol class="sl-steps"&gt;Sketch · Shape · Ship&lt;/ol&gt;
    &lt;p class="sl-stat"&gt;3 steps, one idea&lt;/p&gt;
    &lt;p class="sl-note"&gt;Same words on every…&lt;/p&gt;
  &lt;/article&gt;
&lt;/div&gt;</code></pre>
<ul class="sl-levers">
  <li><b>Type</b><span>Eight type systems. Seven ship as bundled open fonts.</span></li>
  <li><b>Color</b><span>Palettes, blend modes, and overprinted inks.</span></li>
  <li><b>Texture</b><span>Grain, halftones, paper, and grids drawn by CSS.</span></li>
  <li><b>Layout</b><span>The same elements, placed by different grids.</span></li>
  <li><b>Motion</b><span>A signature entrance and transition for each style.</span></li>
</ul>
</div>

<p class="sl-takeaway">What stays fixed: <strong>the words, their order, and their meaning.</strong></p>

<!--
Marp scopes theme CSS to slides, so each style is a set of descendant rules
under one class: sl-house, sl-riso, sl-swiss, sl-brutal, sl-sketch, sl-blueprint,
sl-editorial, or sl-beamer. The specimen markup contains nothing style-specific.
Its data-text attribute feeds the risograph's second ink, but it is present on
every copy. Decorative labels such as the blueprint's QTY come from CSS generated
content with empty alternative text, so assistive technology reads only the
shared words.
Source: https://marpit.marp.app/theme-css
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: star 900ms -->

<div class="sl-stage sl-house" data-style="house">
<header class="sl-label"><p>00</p><h2>House style</h2><p>Dark panels, Segoe UI, thin borders, one mint accent</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
The control: the visual language of the other decks. A dark radial background,
Segoe UI with an Arial fallback, thin-bordered panels, and one accent color.
Every following style uses these exact words, in this order, with this markup.
The next cut uses Marp's star transition.
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: wipe 700ms -->

<div class="sl-stage sl-riso" data-style="riso">
<header class="sl-label"><p>01</p><h2>Risograph zine</h2><p>Two fluorescent inks, overprint, halftone, grain</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
A risograph prints one ink per drum, so colors overprint and drift out of
register. This page is a stapled two-page zine spread. The headline's second ink
is a pseudo-element with mix-blend-mode: multiply, so overlaps darken like real
overprint, and the three steps are overprinted circles. Halftone dots are a
repeating radial gradient under a mask; the grain is SVG feTurbulence in a data
URI. Fluorescent pink is decorative only: text uses dark navy for AA contrast.
Fonts: Bricolage Grotesque and the Special Elite typewriter face.
Source: https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: drop 800ms -->

<div class="sl-stage sl-swiss" data-style="swiss">
<header class="sl-label"><p>02</p><h2>Swiss poster</h2><p>Strict grid, heavy grotesque, signal red, one circle</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
The International Typographic Style: a visible column grid, flush-left and
ragged-right grotesque type, asymmetric balance, and one geometric form. The red
circle is the stat paragraph itself, rounded with border-radius. Rules above the
steps are borders; faint column lines are a repeating linear gradient.
Font: Archivo.
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: flip 800ms -->

<div class="sl-stage sl-brutal" data-style="brutal">
<header class="sl-label"><p>03</p><h2>Neo-brutalist</h2><p>Loud flat color, thick outlines, hard offset shadows</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
Neo-brutalism exaggerates the materials of an interface: thick black outlines,
hard offset shadows without blur, saturated flat fills, and heavy display type.
The arrows between steps are clip-path polygons, and the kicker rides the black
ticker strip at the bottom. Watch for color fatigue and hard shadows that crowd
small text.
Fonts: Dela Gothic One and Archivo.
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: clockwise 900ms -->

<div class="sl-stage sl-sketch" data-style="sketch">
<header class="sl-label"><p>04</p><h2>Sketchnote</h2><p>Dot-grid paper, marker lettering, highlighter, sticky note</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
A sketchnote is a hand-drawn summary: dot-grid paper, marker lettering, a
highlighter, and doodled frames. The three steps climb like a staircase. Box
outlines, arrows, and the circle around the number are SVG data URIs stretched
with preserveAspectRatio="none" and non-scaling strokes, so the line weight stays
even at any size. The highlighter is a thick text-decoration underline painted
behind the glyphs.
Font: Kalam.
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: cover 700ms -->

<div class="sl-stage sl-blueprint" data-style="blueprint">
<header class="sl-label"><p>05</p><h2>Blueprint</h2><p>Grid, callouts, dimensions, title block</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
Engineering drawings use a drafting grid, condensed upper-case lettering,
numbered balloon callouts, dimension lines, and a title block in the lower-right
corner. Here the kicker, stat, and label become title-block cells, and CSS
counters number the balloons. Light lines on cyanotype blue; text stays
near-white for contrast.
Font: Barlow Condensed.
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: push 700ms -->

<div class="sl-stage sl-editorial" data-style="editorial">
<header class="sl-label"><p>06</p><h2>Editorial broadsheet</h2><p>Blackletter nameplate, news serif, ruled columns</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
A broadsheet front page: a blackletter nameplate between two ears, a folio line,
a news-serif headline and italic deck, columns separated by rules with
a blackletter drop cap, a pull figure, and an editor's note box. The drop cap is
::first-letter; the column rules are borders.
Fonts: UnifrakturMaguntia and Old Standard TT.
-->

---

<!-- _class: sl sl-style-slide -->
<!-- _paginate: false -->
<!-- _transition: fade 500ms -->

<div class="sl-stage sl-beamer" data-style="beamer">
<header class="sl-label"><p>07</p><h2>LaTeX Beamer</h2><p>Frame title, theorem blocks, footline, Computer Modern</p></header>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
</div>

<!--
LaTeX Beamer is the academic slide class, and the look the Marp community
recreates most often: awesome-marp lists Beam, Neobeam, and marp-theme-academic.
Its grammar is a headline bar, a frame title, theorem-style blocks with colored
title bars, a three-part footline, navigation symbols, and Computer Modern type.
On entry, the pieces uncover in steps like Beamer's \pause overlays. This is
original CSS; no community theme code is copied.
Font: CMU Sans Serif (Computer Modern Unicode).
Sources: https://github.com/marp-team/awesome-marp and https://ctan.org/pkg/beamer
-->

---

<!-- _class: sl sl-frame sl-live-slide -->

## Restyle it live.

<div class="sl-live" data-style-lab>
  <div class="sl-live-frame">
    <div class="sl-stage sl-house" data-style="house" data-live-stage>
<article class="sl-specimen">
  <p class="sl-kicker"><span>Field notes</span> <span>Vol. 1</span></p>
  <h3 class="sl-title" data-text="Good ideas travel in small steps.">Good ideas travel in small steps.</h3>
  <p class="sl-dek">Sketch it, shape it with feedback, then ship it where people can use it.</p>
  <ol class="sl-steps"><li><b>Sketch</b> <span>Make the idea visible.</span></li><li><b>Shape</b> <span>Invite feedback early.</span></li><li><b>Ship</b> <span>Put it in people’s hands.</span></li></ol>
  <p class="sl-stat"><b>3</b> <span>steps, one idea</span></p>
  <p class="sl-note">Same words on every style slide. Only the stylesheet changes.</p>
</article>
    </div>
  </div>
  <div class="sl-live-panel">
    <p class="sl-live-intro">Choose a style. The same elements morph into their new places.</p>
    <div class="sl-live-controls" role="group" aria-label="Choose a style" hidden><button type="button" data-style-choice="house" aria-pressed="true">House</button><button type="button" data-style-choice="riso" aria-pressed="false">Riso</button><button type="button" data-style-choice="swiss" aria-pressed="false">Swiss</button><button type="button" data-style-choice="brutal" aria-pressed="false">Brutalist</button><button type="button" data-style-choice="sketch" aria-pressed="false">Sketch</button><button type="button" data-style-choice="blueprint" aria-pressed="false">Blueprint</button><button type="button" data-style-choice="editorial" aria-pressed="false">Broadsheet</button><button type="button" data-style-choice="beamer" aria-pressed="false">Beamer</button></div>
    <p class="sl-live-status" data-style-status role="status" aria-live="polite">House style</p>
    <p class="sl-live-still">In the HTML version, these buttons restyle the specimen live.</p>
  </div>
</div>

<!--
Choose a style. The runtime swaps one class on the stage inside
document.startViewTransition. Temporary view-transition-names let the browser
move each element from its old box to its new one while cross-fading the
rendering. The names exist only during a switch, so Marp's slide transitions
are unaffected. Reduced motion switches instantly. Print, presenter, and no-JS
views keep the authored house style, and the buttons appear only in the audience
window. Chrome and Edge morph the parts. Safari cross-fades the stage instead,
because WebKit misplaces elements inside Marp's scaled slides; browsers without
View Transitions cross-fade too.
Sources: https://developer.mozilla.org/docs/Web/API/View_Transition_API and
https://bugs.webkit.org/show_bug.cgi?id=23113
-->

---

<!-- _class: sl sl-frame sl-levers-slide -->

## Every place a Marp style can live.

<p class="sl-subtitle">Official levers, from a whole deck down to one slide. Checked levers drive this deck.</p>

<div class="sl-lever-grid">
  <div><h3>Theme CSS</h3><ul>
    <li data-used><code>/* @theme style-lab */</code><span>Names the theme. Marp CLI finds it with <code>--theme-set</code>.</span></li>
    <li data-used><code>@import 'default';</code><span>Extends a built-in theme: default, gaia, or uncover.</span></li>
    <li data-used><code>section::after { … }</code><span>Styles the page number from <code>attr(data-marpit-pagination)</code>.</span></li>
    <li><code>/* @size 4:3 960px 720px */</code><span>Adds a slide size preset in Marp Core.</span></li>
  </ul></div>
  <div><h3>Markdown</h3><ul>
    <li data-used><code>&lt;!-- _class: sl sl-style-slide --&gt;</code><span>Classes one slide; without the underscore, every slide after it.</span></li>
    <li data-used><code>&lt;style scoped&gt;</code><span>Styles only the current slide, like the yellow code here.</span></li>
    <li><code>&lt;!-- backgroundColor: #111 --&gt;</code><span>Directives also set color, header, footer, and paginate.</span></li>
    <li><code>![bg left:40% sepia](photo.jpg)</code><span>Splits and filters background images.</span></li>
  </ul></div>
  <div><h3>Marp Core and CLI</h3><ul>
    <li><code>&lt;!-- class: invert --&gt;</code><span>Built-in color schemes; Gaia adds <code>gaia</code> and <code>lead</code>.</span></li>
    <li><code># &lt;!-- fit --&gt; Big title</code><span>Fits a heading when the theme enables <code>@auto-scaling</code>.</span></li>
    <li data-used><code>&lt;!-- _transition: drop --&gt;</code><span>Runs a slide transition in Marp CLI's HTML.</span></li>
    <li><code>@keyframes marp-incoming-transition-…</code><span>Defines a custom transition in theme CSS.</span></li>
  </ul></div>
</div>

<p class="sl-levers-more">Go further: <a href="https://github.com/marp-team/awesome-marp">awesome-marp</a> &middot; <a href="https://rnd195.github.io/marp-community-themes/">Marp Community Themes</a> &middot; <a href="https://yoanbernabeu.github.io/MARP-Template-Library/">Marp Template Library</a> &middot; <a href="https://github.com/marp-team/marp-core/blob/main/themes/README.md">Built-in themes</a> &middot; <a href="https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md">Bespoke transitions</a></p>

<style scoped>
.sl-lever-grid code { background: #fff1a8; }
</style>

<!--
A copyable map of the official styling levers. Theme CSS follows Marpit: the
@theme comment names a theme, @import extends another, and section::after styles
pagination. Marp Core adds @size presets, @auto-scaling for fitting headers, and
the built-in default, gaia, and uncover themes. Directives and inline styles work
from Markdown: _class targets one slide, and <style scoped> styles only this one.
Marp CLI's bespoke HTML adds slide transitions, including custom keyframes.
Sources: https://marpit.marp.app/theme-css, https://marpit.marp.app/directives,
https://github.com/marp-team/marp-core/blob/main/docs/theme-authoring.md,
https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md
-->

---

<!-- _class: sl sl-frame sl-closing -->

## Change the voice. Keep the words.

<div class="sl-principles">
  <div><h3>Content first.</h3><p>Write the words once. Let classes and stylesheets carry the personality.</p></div>
  <div><h3>Legible in every outfit.</h3><p>Contrast, reading order, and size must survive each style, and print.</p></div>
  <div><h3>Bring your fonts.</h3><p>The PDF is rendered on a runner that has none of your fonts installed.</p></div>
</div>

<ul class="sl-wall sl-wall-small" aria-hidden="true">
  <li><div class="sl-swatch sl-house"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-riso"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-swiss"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-brutal"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-sketch"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-blueprint"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-editorial"><span data-text="Aa">Aa</span></div></li>
  <li><div class="sl-swatch sl-beamer"><span data-text="Aa">Aa</span></div></li>
</ul>

<p class="sl-takeaway">Different worlds. <strong>The same words, still readable.</strong></p>
<p class="sl-sources">Further reading: <a href="https://www.csszengarden.com/">CSS Zen Garden</a> &middot; <a href="https://github.com/marp-team/awesome-marp">awesome-marp</a> &middot; <a href="https://marpit.marp.app/theme-css">Marpit theme CSS</a> &middot; <a href="https://developer.mozilla.org/docs/Web/API/View_Transition_API">View Transitions</a> &middot; <a href="https://openfontlicense.org/">SIL Open Font License</a></p>

<!--
Style is a layer on top of content. Keep the words, their order, and the semantic
markup stable; let classes carry type, color, texture, layout, and motion.
Check every style for contrast and reading order, and print it. Bundle fonts with
their licenses: the published PDF is rendered on a Linux runner.
Sources: https://www.csszengarden.com/ and https://openfontlicense.org/
-->
