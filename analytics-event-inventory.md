# Analytics event inventory

The site sends custom events to `window.dataLayer`. Google Tag Manager must be
configured to forward them to GA4. The event code reports only fixed,
low-cardinality metadata. It never sends email addresses, names, form messages,
search terms, dates entered into tools, calculated results, or reCAPTCHA tokens.

Google references:

- [Custom event triggers in GTM](https://support.google.com/tagmanager/answer/7679219)
- [Data layer variables](https://support.google.com/tagmanager/answer/13352957)
- [GA4 key events](https://support.google.com/analytics/answer/9355848)

## Site and conversion events

| Event | When it fires | Parameters | Recommended key event |
|---|---|---|---|
| `newsletter_cta_click` | A link to the newsletter landing page is clicked | `lang`, `source`, `placement` | No |
| `newsletter_signup_attempt` | A newsletter form is submitted | `lang`, `source`, `placement` | No |
| `newsletter_signup_error` | Client validation, reCAPTCHA, network, or API submission fails | `lang`, `source`, `placement`, `error_code` | No |
| `newsletter_signup_submitted` | A double-opt-in signup reaches the check-your-inbox page | `lang`, `source` | No |
| `newsletter_signup_completed` | A single-opt-in signup or Mailchimp confirmation reaches the welcome page | `lang`, `source` | **Yes** |
| `resource_download` | A tracked printable, workbook, or e-book link is clicked | `lang`, `source`, `placement`, `resource_id` | Optional |
| `contact_form_success` | The contact API accepts a message | `lang`, `source` | Optional |

Newsletter `source` values currently include `header`, `home`, `article`,
`floating`, `footer`, `mdx`, and `subscribe-page`. A confirmed Mailchimp link
that has no on-site attribution reports `confirmation`. Links to the landing
page preserve their source in the query string so the completed event retains
the original placement.

## Tool events

| Event | When it fires | Main parameters |
|---|---|---|
| `tool_view` | A standalone tool or article embed renders | `tool_key`, `lang`, `source` |
| `tool_start` | The visitor first interacts with the tool | `tool_key`, `lang`, `source` |
| `tool_result` | A tool produces its first meaningful result | `tool_key`, `lang`, `source`, optional `action` |
| `tool_complete` | A supported puzzle or quiz is completed | `tool_key`, `lang`, `source`, optional `action` |
| `tool_fullscreen` | Fullscreen mode is opened | `tool_key`, `lang`, `source`, `action` |
| `tool_download` | A printable is downloaded from a tool page | `tool_key`, `lang`, `source` |
| `tool_related_click` | The related article is opened | `tool_key`, `lang`, `source` |
| `tool_recommendation_click` | A recommended tool is opened | `tool_key`, `lang`, `source`, `placement`, `action` |
| `tool_discovery_click` | A tool is opened from a homepage or article discovery block | `tool_key`, `lang`, `source`, `placement` |
| `tool_hub_click` | A tool is opened from the tools hub | `tool_key`, `lang`, `source`, `placement` |

The tool `source` is `detail` for standalone pages and `article` for embedded
tools. Result actions are fixed labels such as `solved` or `found`, never the
visitor's input or the generated answer.

## GTM and GA4 setup

1. In GTM, create Data Layer Variables for the parameters you want to report:
   `lang`, `source`, `placement`, `resource_id`, `error_code`, `tool_key`, and
   `action`.
2. Create Custom Event triggers for the event names above. A single regex
   trigger can cover a related family, for example `^newsletter_`.
3. Send the custom event name and applicable Data Layer Variables to GA4.
4. Preview the container and exercise one EN and one HR example for each event
   family. Confirm that no visitor-entered values appear.
5. Publish the GTM container.
6. In GA4 Admin, mark `newsletter_signup_completed` as a key event. Mark
   `contact_form_success` or `resource_download` only if they are business goals
   you intend to optimize for.

Do not mark `newsletter_signup_attempt` or the thank-you page event as a key
event. They are funnel steps, not completed subscriptions.
