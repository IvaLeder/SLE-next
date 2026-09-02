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
| B1-TOC | 2026-09-02 | — | All EN/HR articles | Exclude components marked `data-no-toc`; mark the newsletter promotion so its heading is not added to article TOCs | Ready for review | — | — |
| B1-LINKS | 2026-09-02 | — | Communication history, Möbius strip, and Universe articles in EN/HR | Add three contextual links from published articles to each target | Ready for review | — | — |

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
