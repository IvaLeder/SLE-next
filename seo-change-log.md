# SEO change log

Use this file to connect SEO and UX changes to Search Console outcomes. Record
the production deployment date when a change goes live; review it after 14 days
for an early signal and after 28 days for the first meaningful comparison.

## Measurement rules

- Compare equivalent date ranges and account for seasonality, holidays, and
  large changes in average position.
- Judge CTR only when impressions and average position remain reasonably
  comparable. A CTR change caused by a different query mix is not necessarily a
  snippet win or loss.
- Search Console query exports are capped and anonymized. Use page-level totals
  for prioritization and query rows as directional evidence.
- Preserve URLs when refreshing content. Record redirects separately if a URL
  ever has to change.
- Change one page group at a time where practical so results remain attributable.

## Baseline: 25–31 August 2026

Source: Google Search Console Web Performance export attached on 2 September
2026. The query file contains 1,000 rows and covers about 32% of total clicks and
impressions; the property and device totals below are complete for the period.

### Property totals

| Metric | Baseline |
| --- | ---: |
| Clicks | 642 |
| Impressions | 59,730 |
| CTR | 1.07% |
| Impression-weighted average position | 7.10 |

### Device baseline

| Device | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 395 | 34,029 | 1.16% | 5.03 |
| Desktop | 242 | 24,647 | 0.98% | 10.06 |
| Tablet | 5 | 1,054 | 0.47% | 4.87 |

### Priority page baseline

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/en/how-to-make-origami-boat` | 124 | 8,804 | 1.41% | 1.96 |
| `/en/make-and-solve-tower-of-hanoi` | 15 | 5,978 | 0.25% | 6.02 |
| `/en/explore-number-pi` | 2 | 3,921 | 0.05% | 4.08 |
| `/en/heat-conduction-experiment` | 4 | 3,193 | 0.13% | 6.17 |
| `/en/how-to-demonstrate-diffusion` | 9 | 2,600 | 0.35% | 5.12 |
| `/en/developmental-leaps` | 27 | 2,439 | 1.11% | 8.27 |
| `/hr/skokovi-u-razvoju` | 96 | 1,017 | 9.44% | 5.17 |
| `/en/tools/birthday-in-pi` | 2 | 939 | 0.21% | 9.76 |
| `/en/how-to-make-fidget-spinner` | 0 | 638 | 0% | 9.70 |
| `/en/where-do-we-live-in-the-universe` | 1 | 388 | 0.26% | 8.75 |
| `/en/mobius-strip-activity` | 2 | 153 | 1.31% | 7.54 |

### Technical and UX baseline

| Signal | Baseline |
| --- | --- |
| Rendered metadata crawl | 274 pages; 0 P0, 0 P1, 76 P2 length warnings |
| Published-content validation | 0 errors |
| Homepage field CWV, mobile | Passed; LCP 2.1 s, INP 186 ms, CLS 0.02 |
| Homepage Lighthouse, mobile | Performance 74; LCP 3.5 s; TBT 570 ms |
| Origami article field CWV, mobile | Passed; LCP 2.1 s, CLS 0.03 |
| Origami article Lighthouse, mobile | Performance 69; LCP 5.6 s; TBT 300 ms |
| Newsletter heading search appearance | 7 URL-fragment rows; 85 impressions; 0 clicks |
| Published MDX link orphans | 3 English and 3 Croatian articles |

## Change register

| ID | Prepared | Deployed | Scope | Change | Status | 14-day review | 28-day review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1-TOC | 2026-09-02 | 2026-09-02 | All EN/HR articles | Exclude components marked `data-no-toc`; mark the newsletter promotion so its heading is not added to article TOCs | Live | Not taken | Newsletter jump-link rows 201 → 47 impressions; 3 of 7 URLs already at zero. **Keep** |
| B1-LINKS | 2026-09-02 | 2026-09-02 | Communication history, Möbius strip, and Universe articles in EN/HR | Add three contextual links from published articles to each target | Live | Not taken | Six targets 4 → 28 clicks, 1,282 → 3,801 impressions (+197%). Young pages, so partly natural ramp-up. **Keep** |
| T11-EN-LEAPS | 2026-09-04 | 2026-09-08 | `/en/developmental-leaps` | Test query-aligned title and description; add direct duration answers for leaps 4 and 10; clarify the evidence limits of the Wonder Weeks schedule | Live | Not taken | 69 → 185 clicks, 6,990 → 18,974 impressions, CTR 0.99% → 0.98%, position 8.35 → 7.97; peers flat. **Keep, iterate** |
| T12-EN-GIFTED | 2026-09-04 | 2026-09-08 | `/en/18-signs-gifted-child` | Replace diagnostic checklist framing with careful observation guidance; clarify assessment, twice-exceptionality, hyperlexia and IQ; add authoritative sources | Live | Not taken | 34 → 32 clicks, 3,664 → 3,310 impressions, CTR 0.93% → 0.97%, position 10.79 → 7.52. **Insufficient data**, re-check at 56 days. 56-day (8 Oct–3 Nov): 28 / 2,964 / 0.94% / 7.90, in line with peers (−12% vs −15% clicks). **Closed: neutral, keep for content quality** |
| T13-GUMMY-LAB | 2026-09-04 | 2026-09-04 | `/en/gummy-bears-osmosis-experiment` | Add a reusable two-page experiment worksheet and download card; clarify the limits of the gummy bear as a model of a cell | Live | Not taken | 95 → 112 clicks, 6,976 → 12,003 impressions, CTR 1.36% → 0.93%, position 6.83 → 5.62. Clicks trail EN Science peers. **Keep; judge on worksheet downloads** |
| T14-HR-BOAT | 2026-09-04 | — | `/hr/kako-napraviti-origami-brod` | Align the title and description with Croatian paper-boat instructions and floating intent | **Not deployed**: title and description still uncommitted on 2026-10-07 | — | Not live. The lift on this URL comes from the earlier 21 Aug title change (`08c1da3`); see the September review |
| T15-EN-LEAP-MONTHS | 2026-10-07 | 2026-10-07 | `/en/developmental-leaps` | Add the approximate age in months, matching the chart, to all ten leap H3s, e.g. "Leap 5 (week 26, about 5 to 6 months)". The H3 anchor ids change too; no internal links pointed at them | Live | Not taken | 182 → 227 clicks, 19,255 → 26,730 impressions, CTR 0.95% → 0.85%, position 7.94 → 8.10; peers −15% clicks. Month queries did not move (still 9–11). **Keep**, target hypothesis not confirmed |
| T16-EN-CIPHER-TITLE | 2026-10-07 | 2026-10-07 | `/en/how-to-make-cipher-wheel` | Title "Cipher Wheel: Make Secret Codes (Free Printable Template)" → "Caesar Cipher Wheel: Free Printable Template & Secret Codes"; description now opens "Make a Caesar cipher wheel" | Live | Not taken | 111 → 124 clicks, 6,942 → 6,332 impressions, CTR 1.60% → 1.96%, position 5.48 → 5.66; peers −3%. Caesar-wheel queries slipped (4.05 → 4.71). **Keep** |
| T17-EN-HANOI-TITLE | 2026-10-07 | 2026-10-07 | `/en/make-and-solve-tower-of-hanoi` | Title "… Solution & Minimum Moves" → "… Solution & Play Online" (the article embeds a playable puzzle); description adds "Play it online with 3 to 6 disks" and keeps the minimum-moves formula | Live | Not taken | 50 → 22 clicks, 15,807 → 8,181 impressions, CTR 0.32% → 0.27%, position 4.24 → 4.13; peers −2%. Impressions halved at unchanged positions. Daily chart (5 Nov): decline began before the change, but a second step followed it, and the play queries never improved. **Revert (T17-R)** |
| T18-EN-BOAT-DESC | 2026-10-07 | 2026-10-07 | `/en/how-to-make-origami-boat` | Replace the pre-migration description with "Make a paper boat that really floats from one A4 sheet: easy step-by-step diagrams for kids, no glue or scissors, plus a decorative origami sailboat." Title unchanged | Live | Not taken | 733 → 660 clicks, 43,701 → 47,824 impressions, CTR 1.68% → 1.38%, position 1.91 → 1.95. Untouched EN origami pages fell more (CTR −30%); HR control rose. **Keep**, no evidence the description hurt |
| T17-R-EN-HANOI-REVERT | 2026-11-05 | — | `/en/make-and-solve-tower-of-hanoi` | Restore the pre-T17 title "Tower of Hanoi Pattern: Rules, Solution & Minimum Moves" and description exactly (file identical to `a7799b3^`) | Ready for review | — | — |

### T11 baseline: English developmental leaps

Source: page-filtered Google Search Console Web Performance comparison exported
on 4 September 2026.

| Period | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Last 28 days | 57 | 5,477 | 1.04% | 8.33 |
| Previous 28 days | 24 | 2,100 | 1.14% | 8.52 |

The page gained 33 clicks and 3,377 impressions while average position changed
only slightly. The visible query table covers 8 of 57 clicks and 1,205 of 5,477
impressions, so individual queries are directional rather than complete. The
clearest visible opportunities are duration (`how long does leap 4 last`),
age/month variants (`4 month leap`, `developmental leaps by age`) and leap 10.

## 28-day review: September 2026

Source: Google Search Console Web Performance export, "Last 28 days" compared
with the previous 28 days, exported 7 October 2026 (7 Sep–4 Oct against
10 Aug–6 Sep). Deploy dates come from `git reflog origin/main` push times. The
site-level export has no Dates tab; day-level checks need a page-filtered export.

### Property totals

| Metric | Previous 28 days | Last 28 days | Change |
| --- | ---: | ---: | ---: |
| Clicks | 2,230 | 3,893 | +75% |
| Impressions | 211,048 | 305,328 | +45% |
| CTR | 1.06% | 1.28% | +0.22 pp |
| Impression-weighted average position | 6.99 | 5.24 | 1.75 better |

That is 139 clicks a day, above the pre-migration rate of about 126 a day for the
first time. Impressions are 10,905 a day, about 63% of the pre-cliff 17,197.

| Device | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 1,389 → 2,107 | 122,871 → 171,285 | 1.13% → 1.23% | 5.16 → 4.88 |
| Desktop | 822 → 1,751 | 84,181 → 128,402 | 0.98% → 1.36% | 9.76 → 5.75 |
| Tablet | 19 → 35 | 3,996 → 5,641 | 0.48% → 0.62% | 4.67 → 4.53 |

### Seasonality: judge changes against peers, not the site total

The windows straddle the start of the school year, so the site-wide gain is mostly
seasonal and is not evidence for any single change:

- STEM grew and parenting did not. HR Znanost +180% clicks, HR Matematika +179%,
  EN Math +91%, EN Science +64%. HR Psihologija +12% clicks with flat impressions;
  EN Psychology without the leaps page +6% clicks, +1% impressions.
- Northern-hemisphere countries surged (US +91%, UK +116%, Canada +226%, Croatia
  +71%). Countries without a September school start did not: Australia +16%, South
  Africa −20%.
- Desktop clicks more than doubled and desktop position caught up with mobile,
  consistent with school computers. The July gap (desktop 17 vs mobile 6) is gone.
- Homework-style queries appeared: pasted assignment questions on diffusion,
  osmosis/tonicity, inertia and heat transfer, ranking well with almost no clicks.

Benchmarks used below: EN Psychology excluding the leaps page for T11/T12, and EN
Science for T13.

### Change reviews

| ID | Before | After | Peer benchmark | Decision |
| --- | --- | --- | --- | --- |
| B1-TOC | 7 newsletter fragment URLs, 201 impressions | 4 URLs, 47 impressions | — | Keep. Residual rows age out as pages are recrawled |
| B1-LINKS | 4 clicks, 1,282 impressions (6 targets) | 28 clicks, 3,801 impressions | Targets were published 14 Jul–25 Aug, so part of this is natural ramp-up | Keep |
| T11-EN-LEAPS | 69 / 6,990 / 0.99% / 8.35 | 185 / 18,974 / 0.98% / 7.97 | Peers +6% clicks, +1% impressions; untouched HR twin −15% impressions | Keep. Clear win on reach. The new `#how-long-do-developmental-leaps-last` section now appears as a jump link (2,700 impressions). CTR unchanged, so the win is breadth. Iterate on position (see next candidates) |
| T12-EN-GIFTED | 34 / 3,664 / 0.93% / 10.79 | 32 / 3,310 / 0.97% / 7.52 | Peers excluding gifted: +19% clicks, +7% impressions | Insufficient data. Position improved by 3.3 while low-ranking tail impressions dropped out; `signs of giftedness in kids` moved from 37.5 to 2.3. Re-check at 56 days |
| T13-GUMMY-LAB | 95 / 6,976 / 1.36% / 6.83 | 112 / 12,003 / 0.93% / 5.62 | EN Science +64% clicks, +52% impressions | Keep. Impressions beat peers, clicks trail them, and CTR fell on homework query mix. The worksheet's real metric is PDF downloads (GTM), not GSC |
| T14-HR-BOAT | — | — | — | Not deployed. The URL went 29 → 56 clicks and CTR 1.39% → 1.75% at a flat 2.2 position after the 21 Aug title change. The EN boat (no title change in the window) moved 1.33% → 1.64%, so most of the CTR gain is seasonal |

### Regressions and watch items

- **`/en/candle-in-the-vacuum-experiment`: 42 → 16 clicks is not a regression.**
  The previous window held a one-off burst. Checked against a page-filtered daily
  export (7 Oct) and the 10 Aug, 2 Sep and 4 Sep exports:

  | Period | Clicks | Clicks per day |
  | --- | ---: | ---: |
  | 3 May–2 Aug (www and non-www) | 59 | 0.64 |
  | 2–8 Aug | 5 | 0.71 |
  | ≈10–24 Aug (derived) | about 30 | about 2 |
  | 25–31 Aug | 6 | 0.86 |
  | 7–16 Sep | 7 | 0.70 |
  | 17 Sep–4 Oct (after the restructure) | 9 | 0.50 |

  CTR either side of the 17 Sep restructure (`12130b0`) is identical (0.48% vs
  0.49%) at position ~6, so the restructure is cleared. The burst looks like a
  class assignment: `why does the water rise in the candle experiment` appeared
  only in mid-August (17 impressions, 7 clicks, 41% CTR) and the rest came from
  rare, hidden queries. Now 91% of the page's impressions come from hidden queries
  and 29% from Translated results (777 impressions, 1 click). No action. Lesson:
  check the previous window for a burst before calling a page a loser.
- The HR leaps query `najgori skok u razvoju` fell from 62 to 26 clicks at an
  unchanged position 1.0 (CTR 43% → 27%). The page total still rose (316 → 366),
  so this is probably a SERP feature change. Watch only.
- Tools are the site's best click-through pages: `/en/tools/caesar-cipher` 1 → 35
  clicks (10.5% CTR), `fraction-visualizer` 1 → 21, `/hr/alati/morseova-abeceda`
  1 → 11.
- The back-to-school hub and articles (published 16 Aug) earned almost nothing
  (9–31 impressions each). They were too late to rank in season. Seasonal pages
  need to be live 6–8 weeks before the peak.
- Concentration: the EN origami boat is 19% of all clicks (748), and the top three
  pages are 33%.

The candidates from this review were prepared as T15–T18 (see the register and
baselines below).

### T15–T18 baselines: 7 Sep–4 Oct 2026

Taken from the 7 October exports, which are deleted once logged, so this table is
the only copy. All four are EN-only. Their HR twins stay unchanged as controls.

| ID | Page: clicks / impressions / CTR / position | Query evidence (same window) |
| --- | --- | --- |
| T15-EN-LEAP-MONTHS | 185 / 18,974 / 0.98% / 7.97 | 40 visible `leap N`, `N month leap` and `N week leap` queries: 2,065 impressions, 17 clicks, average position 9.2. Largest: `leap 10` 199 at 8.9, `leap 4` 167 at 9.3, `leap 5` 128 at 10.5, `6 month leap` 93 at 9.5, `4 month leap` 92 at 9.9, `18 month leap` 82 at 9.8 |
| T16-EN-CIPHER-TITLE | 115 / 6,845 / 1.68% / 5.75 | `caesar cipher wheel` 701 impressions at 3.8 with 1 click; with the misspellings (`ceaser`, `ceasar`, `caeser`, `cesar`, `caesar wheel`) ≈1,085 impressions and 1 click. Printable/template queries carry the clicks: e.g. `cipher wheel printable pdf` 3 clicks, `caesar cipher template` 3 clicks |
| T17-EN-HANOI-TITLE | 59 / 17,191 / 0.34% / 4.33 | `tower of hanoi rules` 2,688 at 1.4 (0 clicks), `tower of hanoi puzzle` 691 at 2.3 (1), `tower of hanoi` 499 at 8.1 (1), `tower of hanoi pattern` 363 at 1.1 (2), `how to play tower of hanoi` 294 at 3.6 (2), `tower of hanoi formula` 258 at 2.4 (0), `tower of hanoi game` 64 at 6.5 (1). A "How to Play" title ran 5 Jul–10 Aug, mid-migration, so it has no usable comparison |
| T18-EN-BOAT-DESC | 748 / 45,740 / 1.64% / 1.92 | `how to fold a paper boat` 2,844 at 1.1 (1.51%), `paper boat instructions` 2,318 at 1.0 (2.76%), `how to make a boat out of paper` 1,394 at 1.8 (0.72%), `how to make a paper boat with a4 sheet` 1,155 at 1.9 (0.78%). Snippet CTR is depressed by video and image features, so judge on CTR at a stable position |

Review against peers, not the site total: EN Psychology excluding the leaps page
for T15, EN Engineering for T16 (cipher wheel), and EN Math for T17–T18 (Hanoi
and the boat).
School-term seasonality continues through October.

## 28-day review: October 2026

Source: Google Search Console export with a custom compare range, exported
5 November 2026: 8 Oct–3 Nov against 10 Sep–6 Oct (27 days each). T15–T18 were
pushed on 7 Oct at 22:05 (`a7799b3`), so the "after" window is entirely
post-change. The export's search type now reads "Web (text-based)"; its
previous-window numbers match the October export's "Web" numbers (e.g. the
leaps page 182 vs 185, site impressions ~11,000 a day in both), so the
comparison is like for like.

### Property totals

| Metric | 10 Sep–6 Oct | 8 Oct–3 Nov | Change |
| --- | ---: | ---: | ---: |
| Clicks | 3,861 | 4,163 | +8% |
| Impressions | 296,972 | 314,098 | +6% |
| CTR | 1.30% | 1.33% | +0.03 pp |
| Impression-weighted average position | 5.15 | 5.21 | 0.06 worse |

154 clicks a day, a new high (139 in the September review).

| Device | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 2,091 → 2,406 | 166,740 → 189,495 | 1.25% → 1.27% | 4.86 → 4.98 |
| Desktop | 1,735 → 1,716 | 124,634 → 118,202 | 1.39% → 1.45% | 5.56 → 5.61 |
| Tablet | 35 → 41 | 5,598 → 6,401 | 0.63% → 0.64% | 4.50 → 4.75 |

### Pattern: all of the growth is Croatian

- HR pages 1,567 → 1,907 clicks (+22%); EN pages 2,269 → 2,232 (−2%).
  Croatia +23%, Serbia +45%, Bosnia and Herzegovina +14%; US −4%, UK −5%.
- HR STEM is following the school curriculum: Znanost +44%, Matematika +65%,
  Inženjerstvo +29%. The standout is the HR cardboard clock, 31 → 191 clicks
  (1,503 → 5,245 impressions, now the #3 page on the site), plus the HR clock
  tool 7 → 34. Queries are school intent: `kako napraviti sat od kartona` 477 at
  1.3, `sat od kartona za skolu` 302 at 3.9, `kako napraviti sat od kartona za
  decu` 78 (Serbian), `sat crtež` 66 at 6.2. HR egg in vinegar 16 → 55, apple
  oxidation 25 → 63, sugar crystals 45 → 83, lava lamp 49 → 81.
- EN dipped after the September back-to-school peak: EN tools −31% (Caesar
  cipher tool 35 → 11, fraction visualizer 24 → 9), heat conduction 56 → 25
  (its homework queries faded). Seasonal; no action.
- Desktop stopped growing (−1% clicks); mobile +15%.

### Halloween and new pages (published 12–28 Oct)

| Page | Published | Clicks | Impressions | Position |
| --- | --- | ---: | ---: | ---: |
| `/hr/kako-napraviti-slime` | 14 Oct | 32 | 2,133 | 4.8 |
| `/en/red-cabbage-ph-indicator-potions` | 21 Oct | 11 | 272 | 5.1 |
| `/en/how-to-make-slime` | 14 Oct | 8 | 900 | 8.7 |
| `/hr/napici-od-crvenog-kupusa` | 21 Oct | 6 | 135 | 4.4 |
| `/hr/djecji-strahovi-po-dobi` | 28 Oct | 4 | 59 | 6.1 |
| `/en/pumpkins-and-potions` | 14 Oct | 4 | 61 | 8.8 |
| `/en/how-to-make-oobleck` | 14 Oct | 2 | 759 | 8.2 |
| `/en/childhood-fears-by-age` | 28 Oct | 2 | 408 | 6.6 |
| `/hr/kako-napraviti-oobleck` | 14 Oct | 1 | 91 | 3.0 |

HR slime is the best new page and is evergreen rather than seasonal (`kako
napraviti slime` 104 at 5.1, plus `bez ljepila` and `bez aktivatora` variants).
The EN fortune teller (`/en/develop-math-reasoning-skills-origami`, unchanged)
rose 117 → 188 on October fortune-teller searches. HR Christmas pages have
started ramping (pinecone tree 1 → 7, reindeer 0 → 4).

### Change reviews

Peer groups: EN Psychology excluding leaps, gifted and the new fears article (41
→ 35 clicks, −15%; impressions +5%); EN Engineering excluding the cipher wheel
(100 → 97, −3%); EN Math excluding the boat, Hanoi and the fortune teller (173 →
170, −2%; impressions +5%); untouched EN origami pages, house and pig (68 → 54,
−21%; CTR 0.99% → 0.69%).

| ID | Before (10 Sep–6 Oct) | After (8 Oct–3 Nov) | Benchmark | Decision |
| --- | --- | --- | --- | --- |
| T15-EN-LEAP-MONTHS | 182 / 19,255 / 0.95% / 7.94 | 227 / 26,730 / 0.85% / 8.10 | Peers −15% clicks; HR twin 386 → 385 | Keep. The page beat its peers, but the month headings did not lift month queries (`4 month leap` 9.7 → 10.7, `6 month leap` 9.4 → 9.2, `18 month leap` 9.7 → 10.2). About 2,770 of the new impressions are `when does leap 2 come out` / `leap 2`, which look like an unrelated product release (1 click). The page is capped at ~9–10 for `leap N` queries; more heading tweaks will not fix that |
| T16-EN-CIPHER-TITLE | 111 / 6,942 / 1.60% / 5.48 | 124 / 6,332 / 1.96% / 5.66 | Peers −3%; HR twin 12 → 16 | Keep. Clicks +12% and CTR up, but the Caesar-wheel family (with misspellings) fell 1,470 → 897 impressions and slipped 4.05 → 4.71, clicks 6 → 11. The gain came from printable/template queries, not from "Caesar" in the title |
| T17-EN-HANOI-TITLE | 50 / 15,807 / 0.32% / 4.24 | 22 / 8,181 / 0.27% / 4.13 | Peers −2%; HR twin 11 → 13 (impressions +46%) | Insufficient data. Impressions collapsed at unchanged positions: `tower of hanoi rules` 2,287 → 429 at 1.4 → 1.1, `puzzle` 729 → 134 at 2.0 → 2.2, `how to play` 235 → 69 at 3.0 → 3.5. At position ~1, impressions track search volume, so this points to a demand or SERP-feature change rather than lost rankings, but it coincides with the title change. Get a page-filtered daily chart (last 3 months): a step at ~8–12 Oct means revert the title; a gradual or earlier drop means keep |
| T18-EN-BOAT-DESC | 733 / 43,701 / 1.68% / 1.91 | 660 / 47,824 / 1.38% / 1.95 | Untouched EN origami CTR −30%; HR boat twin 56 → 61, CTR 1.81% → 1.91% | Keep. The whole boat query family lost CTR at an identical position (1.63 in both windows, 573 → 509 clicks), and the untouched EN origami pages lost more. That points to an EN origami SERP change, not the description. Re-check at 56 days |
| T12-EN-GIFTED (56-day) | 32 / 3,114 / 1.03% / 7.27 | 28 / 2,964 / 0.94% / 7.90 | Peers −15% | Closed: neutral. No SEO effect either way after 8 weeks; the change stays for content quality |

### Watch items

- `/en/make-colorful-milk-polarity-experiment` 36 → 13 clicks (CTR 1.46% →
  0.82%, position 4.9 → 5.5) after the Halloween twist section was appended on
  14 Oct. Visible queries do not explain it. If it has not recovered by the next
  review, get a page-filtered daily chart.
- T14-HR-BOAT is still uncommitted (5 Nov).

### T17 follow-up: Hanoi daily chart (5 Nov)

Page-filtered export, last 3 months (4 Aug–3 Nov). Weekday averages, because
weekends run ~40% lower:

| Week starting | Impressions per weekday | Clicks | Position |
| --- | ---: | ---: | ---: |
| 3 Aug | 310 | 2 | 11.0 |
| 10 Aug (pre-T17 title deployed) | 408 | 5 | 9.8 |
| 24 Aug | 868 | 11 | 6.3 |
| 31 Aug (peak) | 919 | 16 | 3.8 |
| 14 Sep | 568 | 12 | 5.2 |
| 21 Sep | 780 | 19 | 3.9 |
| 28 Sep | 547 | 6 | 3.6 |
| 5 Oct (T17 pushed 7 Oct evening) | 546 | 6 | 3.6 |
| 12 Oct | 335 | 4 | 4.4 |
| 19 Oct | 322 | 3 | 4.3 |
| 26 Oct | 290 | 7 | 3.7 |

Reading: the page was already falling from its late-August peak (−30% in the week
of 28 Sep, before the change), then dropped another 39% in the first full week
after the change, with position slipping 3.6 → 4.4 that week. The query mix
points at demand rather than the title: `rules`, which stayed in the title, fell
most (−81%), while `3 disks minimum moves`, whose wording was removed, held. But
the second step's timing cannot be ruled out, and T17's own goal failed: play
queries did not improve (`how to play tower of hanoi` 2 → 0 clicks). With no
upside to keep, the title is reverted. Revert test (T17-R): if weekday
impressions recover towards ~500 while the HR twin and the query mix stay
steady, the title mattered; if they stay ~300, it was demand. The pre-T17
title also coincided with the August climb from position ~10 to ~4.

### Opportunities

| Candidate | Evidence | Idea |
| --- | --- | --- |
| Printable clock face (HR + EN) | HR clock 31 → 191 clicks on school-intent queries (`za školu`, `sat crtež`, `kako napraviti kazaljke`); neither clock article has a printable | Printable clock dial and hands PDF, linked from both clock articles and the printables hub. Curriculum demand is now |
| Christmas collection timing | HR Christmas pages already ramping in October; the back-to-school lesson says 6–8 weeks before peak | Publish the advent/Christmas pages in the first half of November |

## Review template

Add one row for each material content, metadata, template, performance, or
internal-linking release.

| ID | Prepared | Deployed | Scope | Change | Status | 14-day review | 28-day review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Example | YYYY-MM-DD | YYYY-MM-DD | URL or template | Concise description | Live | Clicks / impressions / CTR / position | Clicks / impressions / CTR / position and decision |

For a page-level review, record both the comparison period and the change:

```text
Before:  clicks — | impressions — | CTR — | position —
After:   clicks — | impressions — | CTR — | position —
Change:  clicks — | impressions — | CTR — pp | position —
Decision: keep / iterate / revert / insufficient data
```
