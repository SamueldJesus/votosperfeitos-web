# Meta conversion tracking and launch design

## Goal

Measure meaningful conversion events for VotosPerfeitos, optimise Meta advertising for completed Pix purchases, and create a paused launch campaign through the Meta Marketing API. The system must preserve the current Mercado Pago payment verification and must not expose Meta access tokens or buyer data in the browser.

## Scope

- Add consent-gated Meta Pixel loading to the landing page.
- Track `PageView` and `InitiateCheckout` in both browser Pixel and Conversions API (CAPI), using a shared event ID for Meta deduplication.
- Track `Purchase` only server-side, after the signed Mercado Pago webhook confirms an accredited Pix payment.
- Add a migration for the minimal first-party tracking values needed to improve server-side purchase matching: `fbp` and `fbc` cookies. They are deleted with the order after 30 days.
- Add an API campaign launcher that validates account access, uploads the six approved local assets, creates the campaign and all descendants as `PAUSED`, and verifies the result.

## Non-goals

- No browser checkout polling or client-side `Purchase` event. Mercado Pago remains the source of truth for purchases.
- No custom audiences, lookalikes, or retargeting campaign until the Pixel has enough traffic to meet Meta minimum audience sizes.
- No use of fake testimonials, fabricated results, or fake urgency in ads.
- No credentials committed to the repository.

## Tracking architecture

### Consent and browser events

A small client-side consent component appears before marketing cookies or Pixel requests are made. It stores only the visitor's consent choice in local storage. If consent is accepted, it loads `https://connect.facebook.net/en_US/fbevents.js` dynamically after obtaining the public pixel ID from the Worker endpoint `GET /api/meta/config`.

The Pixel ID is public by design, but it remains a Worker environment variable so the static build does not need a secret or per-build configuration. `GET /api/meta/config` returns only the pixel ID and sets a short public cache header.

Events:

| Moment | Browser Pixel | CAPI | Event ID |
|---|---|---|---|
| Landing page loaded with consent | `PageView` | No | Random UUID |
| Pix order successfully created | `InitiateCheckout` | Yes | Random UUID sent in checkout payload |
| Signed Mercado Pago webhook confirms accredited Pix | No | `Purchase` | `purchase_<internal order ID>` |

`InitiateCheckout` is emitted only after the Worker creates a valid Pix order. This avoids counting form errors and failed provider calls as checkout starts.

### Worker-side events

The checkout request contains an optional, validated `tracking` object: `eventId`, `fbp`, `fbc`, and source URL. The Worker obtains IP and user agent from the request itself. It immediately sends the CAPI counterpart for `InitiateCheckout` using the same event ID as the Pixel.

The order stores only the validated `fbp` and `fbc` values in a new `tracking_json` column. During the signed Mercado Pago webhook, the Worker sends the `Purchase` CAPI event after its atomic `pending` → `paid` transition. It includes amount `47.00`, currency `BRL`, event source URL, a deterministic event ID, the Meta cookies when present, and normalized SHA-256 hashes for e-mail and the internal order ID.

The tracking call is best-effort: an unavailable Meta endpoint cannot block payment verification, PDF generation, or e-mail delivery. The Worker logs no secrets or customer data. Failed events remain eligible for a bounded retry through the existing queue infrastructure, and event IDs make retries idempotent at Meta.

### Data protection

- Pixel loads only after explicit marketing consent.
- Browser never receives the CAPI access token.
- The Worker receives the CAPI access token only as a Cloudflare secret.
- E-mail and order identifiers are hashed before CAPI transmission.
- Tracking cookies are bounded in length and retained only while the order exists; the existing 30-day cleanup deletes them along with the order and PDFs.
- Checkout still rejects oversized input and retains its existing validation.

## Code components

| Component | Responsibility |
|---|---|
| `src/components/MetaPixel.tsx` | Consent UI, Pixel loader, cookie extraction, browser events. |
| `src/components/QuizModal.tsx` | Sends validated tracking context and records checkout success. |
| `src/worker/meta.ts` | Input validation, hash helpers, CAPI request formation, retry-safe event delivery. |
| `src/worker/index.ts` | Serves public Pixel configuration and passes request context into checkout. |
| `src/worker/orders.ts` / `types.ts` | Persists minimal tracking context with the order. |
| `src/worker/webhook.ts` | Emits only one paid-purchase event after an atomic confirmed payment transition. |
| `migrations/0003_meta_tracking.sql` | Adds tracking and delivery-state columns plus indexes where needed. |
| `scripts/meta-launch.mjs` | Read-first Meta Marketing API launcher and post-create verifier. |

## Cloudflare and Meta configuration

Cloudflare Worker bindings:

- `META_PIXEL_ID`: public Pixel/Dataset ID.
- `META_CAPI_ACCESS_TOKEN`: secret with the least privileges needed to send CAPI events.
- `META_TEST_EVENT_CODE`: optional secret used only in test mode, never production campaign traffic.

Local-only launch variables in `/home/samuel/.env`:

- `META_ACCESS_TOKEN`: token with `ads_read` and `ads_management`; it is never deployed to Cloudflare.
- `META_ACCOUNT_ID`: destination ad account in `act_<id>` format.
- `META_PAGE_ID`: Votos Perfeitos Facebook Page ID.
- `META_PIXEL_ID`: the same Pixel/Dataset ID used by the Worker.

The launcher reads account, Page, Pixel, existing campaigns, and media state before creating anything. It stops on a rate-limit response and does not retry it automatically.

## Launch campaign

| Field | Value |
|---|---|
| Campaign name | `VP | Vendas | Brasil | Criativos v1` |
| Objective | `OUTCOME_SALES` |
| Status | `PAUSED` for campaign, ad set, ads, creatives |
| Structure | 1 campaign × 1 cold prospecting ad set × 3 ads |
| Budget | R$50/day, daily budget on the ad set |
| Bid strategy | `LOWEST_COST_WITHOUT_CAP` |
| Optimisation | Pixel `Purchase` |
| Audience | Brazil, ages 23–44, all genders, broad; no interest filters |
| Placements | Advantage+ placements across Facebook and Instagram |
| Attribution | Meta account default, read from the destination account; never fabricated or upgraded |
| Landing URL | `https://votosperfeitos.avancoai.com.br/` |
| URL parameters | `utm_source={{site_source_name}}&utm_medium={{placement}}&utm_campaign={{campaign.id}}&utm_content={{ad.id}}&utm_term={{adset.id}}` |

The three ad concepts are the approved assets: “Encontre as palavras”, “Memórias que viram palavras”, and “3 versões no tom escolhido”. Each ad receives its matching Feed and Story format through placement-aware creative configuration.

The first seven days are a learning period. No changes to budget, creative, or targeting occur before adequate signal unless a policy, billing, or technical error is identified. Any later budget increase is limited to 10–15% every 48 hours.

## Verification

Automated tests must prove:

1. Pixel script and event functions do nothing before marketing consent.
2. A successful checkout sends the browser and CAPI `InitiateCheckout` with the same event ID.
3. Invalid tracking input is ignored without blocking checkout.
4. An accredited Pix transition sends one `Purchase` event with correct value and currency.
5. Replayed webhooks do not create another purchase event or another delivery job.
6. Missing or failed CAPI calls do not prevent paid orders from entering fulfillment.
7. Worker configuration rejects a production deployment missing the required Meta bindings when tracking is enabled.
8. The launch script rejects missing tokens, non-`PAUSED` statuses, and invalid Meta API responses.

Before deployment: run focused tests, full test suite, lint, TypeScript/Next build, Worker deploy, then verify the live public landing page and Worker routes. Before claiming campaign creation: verify campaign/ad set/ad counts, `effective_status`, non-zero estimated audience, asset hashes, Page identity, URL parameters, and a rendered preview.
