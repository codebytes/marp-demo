---
marp: true
theme: throttling
paginate: true
title: Throttle the burst
description: A token-bucket throttling story told through complete slide keyframes and native Marp morph transitions, with no custom animation runtime.
transition: fade 900ms
---

<!-- _class: th -->

<p class="th-eyebrow">01 / THE BUDGET <span>SLIDE KEYFRAMES + NATIVE MORPH</span></p>

# Throttle the burst.

<p class="th-subtitle">A small bucket absorbs a burst. One token buys admission for one request.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 0 s</span></div>

<div class="th-board" data-frame="1" data-time="0" data-tokens="3" data-admitted="0" data-rejected="0" role="group" aria-label="Initial burst: three available tokens and four arriving requests">
  <div class="th-arrivals-zone"><p>ARRIVING IN THIS BURST</p><small>Arrival order is illustrative.<br>This is not a server queue.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>3</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="incoming" data-morph="request-a"><b>A</b><span>request</span><small>ARRIVING</small></div>
  <div class="th-request request-b" data-request="b" data-status="incoming" data-morph="request-b"><b>B</b><span>request</span><small>ARRIVING</small></div>
  <div class="th-request request-c" data-request="c" data-status="incoming" data-morph="request-c"><b>C</b><span>request</span><small>ARRIVING</small></div>
  <div class="th-request request-d" data-request="d" data-status="incoming" data-morph="request-d"><b>D</b><span>request</span><small>ARRIVING</small></div>
  <i class="th-token token-1 available slot-1" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 available slot-2" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 available slot-3" data-morph="token-3" aria-hidden="true">3</i>
</div>

<div class="th-outcome"><p><b>START FULL.</b> Four arrivals meet a budget of three.</p><span>ADMITTED <b>0</b> / REJECTED <b>0</b></span></div>
<p class="th-note">Use the arrow keys. Each slide is a complete state; the transition supplies the motion.</p>

<!--
This is a provider-neutral token-bucket illustration, not a running rate limiter.
Policy: start with 3 tokens, refill 1 token at each whole-second tick, cap at 3,
charge 1 token per admitted attempt, and do not queue rejected requests.
All zero-second frames describe ordering within one burst before the first refill.
The admitted lane is a history of admission decisions, not concurrent execution.
The tokens drawn beside admitted requests are spent-token bookkeeping, not permits
returned on completion. HTTP 429 and Retry-After are explicit example choices.
Stable data-morph names identify the same requests and tokens on successive pages.
There is no custom JavaScript, timer, or in-slide CSS animation in this deck.
Sources: https://learn.microsoft.com/aspnet/core/performance/rate-limit#token-bucket-limiter
https://www.rfc-editor.org/rfc/rfc6585.html#section-4
-->

---

<!-- _class: th -->

<p class="th-eyebrow">02 / CONSUME A TOKEN <span>SAME OBJECTS / NEW POSITIONS</span></p>

## One request. One token.

<p class="th-subtitle">A is admitted. Its token moves out of the available budget and into the spent-token history.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 0 s</span></div>

<div class="th-board" data-frame="2" data-time="0" data-tokens="2" data-admitted="1" data-rejected="0" role="group" aria-label="Request A admitted: two tokens remain">
  <div class="th-arrivals-zone"><p>ARRIVING IN THIS BURST</p><small>Arrival order is illustrative.<br>This is not a server queue.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>2</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="admitted" data-morph="request-a"><b>A</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-b" data-request="b" data-status="incoming" data-morph="request-b"><b>B</b><span>request</span><small>ARRIVING</small></div>
  <div class="th-request request-c" data-request="c" data-status="incoming" data-morph="request-c"><b>C</b><span>request</span><small>ARRIVING</small></div>
  <div class="th-request request-d" data-request="d" data-status="incoming" data-morph="request-d"><b>D</b><span>request</span><small>ARRIVING</small></div>
  <i class="th-token token-1 spent" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 available slot-2" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 available slot-3" data-morph="token-3" aria-hidden="true">3</i>
</div>

<div class="th-outcome"><p><b>3 - 1 = 2.</b> Admission spends budget immediately.</p><span>ADMITTED <b>1</b> / REJECTED <b>0</b></span></div>
<p class="th-note">The small numbered dots beside admitted requests record tokens already spent.</p>

<!--
Advancing one slide moves request A and token 1 through Marp's native morph.
The token is spent at admission; this frame makes no claim about whether A's
handler has started or finished. B, C, and D still await their admission decision
within the same illustrated burst, not in a configured server-side waiting queue.
-->

---

<!-- _class: th -->

<p class="th-eyebrow">03 / ABSORB THE BURST <span>BURST CAPACITY IS NOT A PER-SECOND COUNT</span></p>

## Three tokens. Three admissions.

<p class="th-subtitle">B and C use the remaining tokens. The bucket is empty before the next clock tick.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 0 s</span></div>

<div class="th-board" data-frame="3" data-time="0" data-tokens="0" data-admitted="3" data-rejected="0" role="group" aria-label="Requests A, B, and C admitted: zero tokens remain, with request D still arriving">
  <div class="th-arrivals-zone"><p>ARRIVING IN THIS BURST</p><small>Arrival order is illustrative.<br>This is not a server queue.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>0</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="admitted" data-morph="request-a"><b>A</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-b" data-request="b" data-status="admitted" data-morph="request-b"><b>B</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-c" data-request="c" data-status="admitted" data-morph="request-c"><b>C</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-d" data-request="d" data-status="incoming" data-morph="request-d"><b>D</b><span>request</span><small>ARRIVING</small></div>
  <i class="th-token token-1 spent" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 spent" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 spent" data-morph="token-3" aria-hidden="true">3</i>
</div>

<div class="th-outcome"><p><b>2 - 2 = 0.</b> The initial burst consumed the stored budget.</p><span>ADMITTED <b>3</b> / REJECTED <b>0</b></span></div>
<p class="th-note">A refill rate of one token per second can still allow an initial burst of three.</p>

<!--
Two admission decisions are grouped into this keyframe so B/C and their tokens
morph together. Each admission still costs one token. This is not a claim that
the limiter performs one atomic two-request operation.
Token bucket permits an initial burst from saved capacity; its refill rate is
not the same as a fixed-window maximum of one request in every second.
-->

---

<!-- _class: th -->

<p class="th-eyebrow">04 / ENFORCE THE BOUNDARY <span>EMPTY BUCKET / NO WAITING QUEUE</span></p>

## No token? Reject. Don't queue.

<p class="th-subtitle">D cannot be admitted. This example returns HTTP 429 and tells the client when to try again.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 0 s</span></div>

<div class="th-board" data-frame="4" data-time="0" data-tokens="0" data-admitted="3" data-rejected="1" role="group" aria-label="Request D rejected with HTTP 429 because there is no token and no waiting queue">
  <div class="th-arrivals-zone"><p>ARRIVING IN THIS BURST</p><small>The client may retry later.<br>The server is not holding D.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>0</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="admitted" data-morph="request-a"><b>A</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-b" data-request="b" data-status="admitted" data-morph="request-b"><b>B</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-c" data-request="c" data-status="admitted" data-morph="request-c"><b>C</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-d" data-request="d" data-status="rejected" data-morph="request-d"><b>D</b><span>first attempt</span><small>REJECTED</small></div>
  <i class="th-token token-1 spent" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 spent" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 spent" data-morph="token-3" aria-hidden="true">3</i>
  <p class="th-rejection"><b>429 Too Many Requests</b><span>Retry-After: 1 &middot; illustrative response</span></p>
</div>

<div class="th-outcome"><p><b>0 TOKENS.</b> Rejecting D does not spend a token.</p><span>ADMITTED <b>3</b> / REJECTED <b>1</b></span></div>
<p class="th-note">429 and Retry-After are policy choices here, not universal defaults for every rate limiter.</p>

<!--
RFC 6585 defines HTTP 429 for rate limiting and permits a Retry-After header.
This example chooses a one-second delay because the next refill is at t=1.
A real application must configure its response and calculate meaningful retry
metadata; other implementations may queue, return a different status, or drop.
Nothing about a Retry-After header guarantees success: another request may spend
the newly available token first. D was rejected, not retained for later execution.
-->

---

<!-- _class: th -->

<p class="th-eyebrow">05 / ADVANCE THE CLOCK <span>REFILL IS TIME-DRIVEN</span></p>

## The clock creates the next token.

<p class="th-subtitle">One second passes. A new token appears, and the client sends a new attempt: D2.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 1 s</span></div>

<div class="th-board" data-frame="5" data-time="1" data-tokens="1" data-admitted="3" data-rejected="1" role="group" aria-label="One refill token is available and D2 is a new retry attempt">
  <div class="th-arrivals-zone"><p>NEW ARRIVAL / CLIENT RETRY</p><small>D2 is a new attempt.<br>D's earlier rejection remains.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>1</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="admitted" data-morph="request-a"><b>A</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-b" data-request="b" data-status="admitted" data-morph="request-b"><b>B</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-c" data-request="c" data-status="admitted" data-morph="request-c"><b>C</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-d" data-request="d" data-status="rejected" data-morph="request-d"><b>D</b><span>first attempt</span><small>REJECTED</small></div>
  <div class="th-request request-retry" data-request="retry" data-attempt="2" data-status="incoming" data-morph="request-retry"><b>D2</b><span>new attempt</span><small>ARRIVING</small></div>
  <i class="th-token token-1 spent" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 spent" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 spent" data-morph="token-3" aria-hidden="true">3</i>
  <i class="th-token token-4 available slot-1" data-morph="token-4" aria-hidden="true">4</i>
  <p class="th-rejection"><b>429 Too Many Requests</b><span>Earlier response to D, not a waiting request</span></p>
</div>

<div class="th-outcome"><p><b>0 + 1 = 1.</b> Request completion did not refill this bucket.</p><span>ADMITTED <b>3</b> / REJECTED <b>1</b></span></div>
<p class="th-note">A rate limit budgets admission over time. It does not directly limit concurrent in-flight work.</p>

<!--
At t=1 exactly one periodic refill has occurred. Token 4 is new; tokens 1-3 stay
in spent history so the visual does not imply they were returned by completed work.
D2 is a new client attempt after waiting, not D being dequeued by the server.
Other arrivals and timer jitter are omitted. A real retry may still be rejected.
Concurrency limiters replenish permits on completion; token buckets replenish
over time. That is the distinction this frame is meant to make visible.
-->

---

<!-- _class: th -->

<p class="th-eyebrow">06 / RECHECK ADMISSION <span>A RETRY NEEDS ITS OWN TOKEN</span></p>

## The retry earns the next token.

<p class="th-subtitle">D2 is admitted this time. The original rejected attempt is still part of the history.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 1 s</span></div>

<div class="th-board" data-frame="6" data-time="1" data-tokens="0" data-admitted="4" data-rejected="1" role="group" aria-label="D2 admitted using the refill token: four admissions total and zero tokens left">
  <div class="th-arrivals-zone"><p>NO NEW ARRIVALS</p><small>D2 was checked again.<br>Retries are not exempt.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>0</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="admitted" data-morph="request-a"><b>A</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-b" data-request="b" data-status="admitted" data-morph="request-b"><b>B</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-c" data-request="c" data-status="admitted" data-morph="request-c"><b>C</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-d" data-request="d" data-status="rejected" data-morph="request-d"><b>D</b><span>first attempt</span><small>REJECTED</small></div>
  <div class="th-request request-retry" data-request="retry" data-attempt="2" data-status="admitted" data-morph="request-retry"><b>D2</b><span>new attempt</span><small>ADMITTED</small></div>
  <i class="th-token token-1 spent" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 spent" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 spent" data-morph="token-3" aria-hidden="true">3</i>
  <i class="th-token token-4 spent" data-morph="token-4" aria-hidden="true">4</i>
  <p class="th-rejection"><b>429 Too Many Requests</b><span>Earlier response to D, not a waiting request</span></p>
</div>

<div class="th-outcome"><p><b>1 - 1 = 0.</b> Four admissions used three initial tokens plus one refill.</p><span>ADMITTED <b>4</b> / REJECTED <b>1</b></span></div>
<p class="th-note">There are no competing arrivals in this example. Production retries still need backoff and careful policy handling.</p>

<!--
This keyframe shows the favorable retry outcome for a quiet system. The client
waited for the next refill and then submitted a new request. The admission check
is performed again; the prior rejection does not reserve a future token.
No claim is made that every real retry succeeds or that 429 handling is universal.
-->

---

<!-- _class: th -->

<p class="th-eyebrow">07 / RESPECT THE CAP <span>BURST BUDGET / LONG-RUN REFILL</span></p>

## Idle time never makes an infinite bucket.

<p class="th-subtitle">After several quiet seconds, the bucket is full again. Additional refill is discarded at the capacity limit.</p>
<div class="th-policy"><span><b>3</b> token capacity</span><span><b>+1</b> token each second</span><span><b>0</b> waiting slots</span><span class="th-clock" data-morph="clock">t = 5 s</span></div>

<div class="th-board" data-frame="7" data-time="5" data-tokens="3" data-admitted="4" data-rejected="1" role="group" aria-label="After idle refill, the bucket is capped at three tokens while admission history stays unchanged">
  <div class="th-arrivals-zone"><p>NO NEW ARRIVALS</p><small>No requests arrive<br>during this idle interval.</small></div>
  <div class="th-admitted-zone"><p>ADMITTED / HISTORY</p><small>Admission is not completion.</small></div>
  <div class="th-rejected-zone"><p>REJECTED / NOT QUEUED</p></div>
  <svg class="th-routes" viewBox="0 0 1160 365" aria-hidden="true"><path d="M256 131 H340 M680 131 H764 M510 264 V288"/><path d="m330 126 10 5-10 5 M754 126 l10 5-10 5 M505 278 l5 10 5-10"/></svg>
  <div class="th-bucket" data-morph="bucket"><p>ADMISSION BUDGET</p><div class="th-balance"><b data-token-count>3</b><span>of 3 available</span></div><div class="th-slots" aria-hidden="true"><i></i><i></i><i></i></div><p class="th-cost">1 token / request</p></div>
  <div class="th-request request-a" data-request="a" data-status="admitted" data-morph="request-a"><b>A</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-b" data-request="b" data-status="admitted" data-morph="request-b"><b>B</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-c" data-request="c" data-status="admitted" data-morph="request-c"><b>C</b><span>request</span><small>ADMITTED</small></div>
  <div class="th-request request-d" data-request="d" data-status="rejected" data-morph="request-d"><b>D</b><span>first attempt</span><small>REJECTED</small></div>
  <div class="th-request request-retry" data-request="retry" data-attempt="2" data-status="admitted" data-morph="request-retry"><b>D2</b><span>new attempt</span><small>ADMITTED</small></div>
  <i class="th-token token-1 spent" data-morph="token-1" aria-hidden="true">1</i>
  <i class="th-token token-2 spent" data-morph="token-2" aria-hidden="true">2</i>
  <i class="th-token token-3 spent" data-morph="token-3" aria-hidden="true">3</i>
  <i class="th-token token-4 spent" data-morph="token-4" aria-hidden="true">4</i>
  <i class="th-token token-5 available slot-1" data-morph="token-5" aria-hidden="true">5</i>
  <i class="th-token token-6 available slot-2" data-morph="token-6" aria-hidden="true">6</i>
  <i class="th-token token-7 available slot-3" data-morph="token-7" aria-hidden="true">7</i>
  <p class="th-rejection"><b>429 Too Many Requests</b><span>Earlier response to D, not a waiting request</span></p>
</div>

<div class="th-outcome"><p><b>MIN(3, 0 + 4) = 3.</b> The cap bounds the next burst.</p><span>ADMITTED <b>4</b> / REJECTED <b>1</b></span></div>
<p class="th-note">Sources: <a href="https://learn.microsoft.com/aspnet/core/performance/rate-limit#token-bucket-limiter">Token-bucket semantics</a> &middot; <a href="https://www.rfc-editor.org/rfc/rfc6585.html#section-4">HTTP 429</a> &middot; <a href="https://github.com/marp-team/marp-cli/blob/v4.5.1/docs/bespoke-transitions/README.md#morphing-animations">Native Marp morphing</a></p>

<!--
After the retry at t=1 the balance is zero. Ticks at t=2, 3, and 4 add tokens
5, 6, and 7. The t=5 refill cannot take the balance above 3 and is discarded.
The admitted-history lane remains unchanged: elapsed time is not evidence that
those requests have completed, and completion is not what replenishes the bucket.
This deck has only complete authored snapshots. Going backward rewinds the
explanation, not a real service. PDF/no-JS output contains all seven states.
The animation method uses stable view-transition-name values, one unique name per
object per slide. Marp supplies all transitions; no custom runtime is included.
-->
