# Meta Conversion Tracking and Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track consented Meta conversion events from Pix creation through verified payment, then create a paused conversion campaign through the Meta Marketing API.

**Architecture:** A consent-gated client component loads the public Pixel ID from the Worker and emits browser events. The Worker duplicates `InitiateCheckout` through CAPI and emits `Purchase` only after the signed Mercado Pago webhook makes the atomic payment transition. A local-only Node launcher reads Meta state, uploads approved assets, creates every object as paused, and verifies its result.

**Tech Stack:** Next.js 16, React 19, Vitest, Cloudflare Workers/D1/Queues, Meta Pixel, Meta Conversions API v24, Meta Marketing API v24, Node.js `fetch`.

**Spec:** `docs/superpowers/specs/2026-09-16-meta-conversion-tracking-and-launch-design.md`

## Global Constraints

- Pixel loading and every browser Meta event require explicit marketing consent.
- The browser must never receive `META_CAPI_ACCESS_TOKEN` or `META_ACCESS_TOKEN`.
- Meta events use only `https://graph.facebook.com/v24.0`.
- The current signed Mercado Pago confirmation is the only source of a `Purchase` event.
- CAPI failures cannot block payment confirmation, queueing, PDF generation, or e-mail delivery.
- Every Meta campaign, ad set, creative, and ad created by the launcher must set `status: "PAUSED"`.
- The launch audience is Brazil, ages 23–44, all genders, broad, with no detailed-interest filters.
- The initial campaign contains one ad set, three ads, R$50/day, `OUTCOME_SALES`, Pixel `Purchase` optimization, Advantage+ placements, and UTM parameters.
- All order-linked tracking fields are deleted by the existing 30-day retention job.
- Tokens, account IDs, and customer data must not appear in commits, logs, test snapshots, or error messages.

---

### Task 1: Meta event model and Conversions API client

**Files:**
- Create: `src/worker/meta.ts`
- Modify: `src/worker/env.ts`
- Modify: `src/worker/types.ts`
- Test: `tests/worker/meta.test.ts`

**Interfaces:**
- Produces `type MetaTracking`, `parseMetaTracking(value: unknown): MetaTracking | null`, `sendMetaEvent(env, event): Promise<boolean>`, `sha256(value: string): Promise<string>`.
- Consumes `Env` with `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, optional `META_TEST_EVENT_CODE`.
- `sendMetaEvent` accepts `{ eventName: "InitiateCheckout" | "Purchase"; eventId: string; eventTime: number; eventSourceUrl: string; email: string; orderId: string; fbp?: string; fbc?: string; ip?: string; userAgent?: string; value: number; currency: "BRL" }`.

- [ ] **Step 1: Write the failing Worker tests**

```ts
it("normalizes approved fbp/fbc values and discards malformed tracking", () => {
  expect(parseMetaTracking({ eventId: "e".repeat(36), fbp: "fb.1.1.123", fbc: "fb.1.1.abc" })).toEqual({
    eventId: "e".repeat(36), fbp: "fb.1.1.123", fbc: "fb.1.1.abc",
  });
  expect(parseMetaTracking({ eventId: "<script>" })).toBeNull();
});

it("posts hashed matching data to Meta CAPI and returns false for a non-success response", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("unavailable", { status: 503 }));
  await expect(sendMetaEvent(env, sampleEvent)).resolves.toBe(false);
  expect(fetch).toHaveBeenCalledWith(
    "https://graph.facebook.com/v24.0/pixel-123/events",
    expect.objectContaining({ method: "POST" }),
  );
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/worker/meta.test.ts`  
Expected: FAIL because `src/worker/meta.ts` does not exist.

- [ ] **Step 3: Implement the smallest safe Meta client**

```ts
export interface MetaTracking { eventId: string; fbp?: string; fbc?: string; }

export async function sendMetaEvent(env: Env, event: MetaEvent): Promise<boolean> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) return false;
  const response = await fetch(`https://graph.facebook.com/v24.0/${encodeURIComponent(env.META_PIXEL_ID)}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      data: [{ event_name: event.eventName, event_time: event.eventTime, event_id: event.eventId,
        action_source: "website", event_source_url: event.eventSourceUrl,
        user_data: await buildUserData(event),
        custom_data: { value: event.value, currency: event.currency, order_id: await sha256(event.orderId) } }],
      ...(env.META_TEST_EVENT_CODE ? { test_event_code: env.META_TEST_EVENT_CODE } : {}),
      access_token: env.META_CAPI_ACCESS_TOKEN,
    }),
  });
  return response.ok;
}
```

Validate event IDs as UUIDs or `purchase_<UUID>`, cookie strings as printable values up to 255 characters, and URL origin against `https://votosperfeitos.avancoai.com.br`. Normalize and SHA-256 hash the e-mail and order ID before serializing them.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- tests/worker/meta.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit the independently testable client**

```bash
git add src/worker/meta.ts src/worker/env.ts src/worker/types.ts tests/worker/meta.test.ts
git commit -m "feat: add Meta conversions API client"
```

### Task 2: Persist minimal tracking data and forward a verified checkout event

**Files:**
- Create: `migrations/0003_meta_tracking.sql`
- Modify: `src/worker/orders.ts`
- Modify: `src/worker/index.ts`
- Modify: `src/worker/types.ts`
- Test: `tests/worker/checkout.test.ts`

**Interfaces:**
- Consumes `MetaTracking` and `sendMetaEvent` from `src/worker/meta.ts`.
- Changes `createCheckout(env, input, requestContext)` where `requestContext` is `{ sourceUrl: string; ip?: string; userAgent?: string }`.
- Stores `tracking_json TEXT NOT NULL DEFAULT '{}'` with only `fbp` and `fbc`; never stores the Meta event ID, user agent, or IP.

- [ ] **Step 1: Write the failing checkout tests**

```ts
it("sends a CAPI InitiateCheckout with the browser event ID after creating a Pix order", async () => {
  const response = await worker.fetch(requestWithTracking("event UUID"), env);
  expect(response.status).toBe(201);
  expect(fetchSpy).toHaveBeenCalledWith(
    "https://graph.facebook.com/v24.0/pixel-123/events",
    expect.objectContaining({ method: "POST" }),
  );
});

it("creates Pix normally when Meta tracking is missing or CAPI is unavailable", async () => {
  fetchSpy.mockResolvedValueOnce(metaFailure).mockResolvedValueOnce(mercadoPagoOrder);
  await expect(worker.fetch(requestWithoutTracking, env)).resolves.toMatchObject({ status: 201 });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/worker/checkout.test.ts`  
Expected: FAIL because checkout does not yet accept tracking context or call CAPI.

- [ ] **Step 3: Add the database migration and checkout forwarding**

```sql
ALTER TABLE orders ADD COLUMN tracking_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE orders ADD COLUMN meta_purchase_sent_at TEXT;
CREATE INDEX IF NOT EXISTS orders_meta_purchase_pending_idx
  ON orders (status, meta_purchase_sent_at)
  WHERE meta_purchase_sent_at IS NULL;
```

Extend checkout input with optional `tracking`. After `createPixOrder` succeeds, send `InitiateCheckout` with amount `47`, `BRL`, the Pixel/browser event ID, hashed buyer e-mail, request IP/user agent, and validated Meta cookies. Await the event only to capture a boolean; never convert a CAPI failure into a checkout failure. Insert only `tracking_json` values `{ fbp, fbc }` with the order.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- tests/worker/checkout.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit the checkout flow**

```bash
git add migrations/0003_meta_tracking.sql src/worker/orders.ts src/worker/index.ts src/worker/types.ts tests/worker/checkout.test.ts
git commit -m "feat: track confirmed Pix checkout starts"
```

### Task 3: Emit one server-verified purchase and make duplicate webhooks idempotent

**Files:**
- Modify: `src/worker/webhook.ts`
- Modify: `src/worker/orders.ts`
- Test: `tests/worker/webhook.test.ts`

**Interfaces:**
- Consumes `sendMetaEvent` from `src/worker/meta.ts`.
- Reads `email`, `tracking_json`, and `meta_purchase_sent_at` for the matched order.
- Produces one queued fulfillment job and at most one successful `Purchase` CAPI event per order.

- [ ] **Step 1: Write the failing webhook tests**

```ts
it("sends one Purchase event after atomically confirming an accredited Pix", async () => {
  await handleMercadoPagoWebhook(signedAccreditedRequest, env);
  expect(metaFetch).toHaveBeenCalledWith(
    "https://graph.facebook.com/v24.0/pixel-123/events",
    expect.objectContaining({ method: "POST" }),
  );
  expect(env.VOW_JOBS.send).toHaveBeenCalledTimes(1);
});

it("does not queue delivery or send Purchase again when Mercado Pago replays the webhook", async () => {
  await handleMercadoPagoWebhook(signedAccreditedRequest, env);
  await handleMercadoPagoWebhook(signedAccreditedRequest, env);
  expect(env.VOW_JOBS.send).toHaveBeenCalledTimes(1);
  expect(metaFetch).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/worker/webhook.test.ts`  
Expected: FAIL because a replay currently queues a second job and purchase tracking does not exist.

- [ ] **Step 3: Make the paid transition the sole delivery and purchase trigger**

```ts
const changed = update.meta.changes === 1;
if (!changed) return new Response(null, { status: 200 });

await env.VOW_JOBS.send({ orderId });
const sent = await sendMetaEvent(env, purchaseEvent);
if (sent) {
  await env.ORDERS.prepare(
    "UPDATE orders SET meta_purchase_sent_at = ? WHERE id = ? AND meta_purchase_sent_at IS NULL",
  ).bind(new Date().toISOString(), orderId).run();
}
```

Only execute the queue send and CAPI purchase call after the conditional `pending` → `paid` update changes one row. Use `purchase_${orderId}` as the event ID. Treat an unsuccessful Meta response as a non-fatal measurement failure; do not return 500 or reveal it to Mercado Pago.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- tests/worker/webhook.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit webhook hardening**

```bash
git add src/worker/webhook.ts src/worker/orders.ts tests/worker/webhook.test.ts
git commit -m "feat: track verified Pix purchases once"
```

### Task 4: Consent-gated browser Pixel and checkout event correlation

**Files:**
- Create: `src/components/MetaPixel.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/QuizModal.tsx`
- Test: `tests/components/MetaPixel.test.tsx`
- Test: `tests/components/QuizModal.test.tsx`

**Interfaces:**
- Produces `MetaPixel` and `trackInitiateCheckout(): MetaTracking | null`.
- `QuizModal` accepts no new props and attaches `tracking` to `/api/checkout` only if consent is present.
- `GET /api/meta/config` returns `{ pixelId: string | null }` and never returns a token.

- [ ] **Step 1: Write the failing component tests**

```tsx
it("does not request Meta configuration or inject a Pixel script before consent", () => {
  render(<MetaPixel />);
  expect(fetch).not.toHaveBeenCalled();
  expect(document.querySelector('script[src*="connect.facebook.net"]')).toBeNull();
});

it("loads the Pixel and records PageView after consent", async () => {
  render(<MetaPixel />);
  await user.click(screen.getByRole("button", { name: /aceitar cookies/i }));
  expect(await screen.findByTestId("meta-pixel-loaded")).toBeInTheDocument();
  expect(window.fbq).toHaveBeenCalledWith("track", "PageView", {}, expect.anything());
});
```

Update the existing quiz test to assert that a successful Pix response causes a single `fbq("track", "InitiateCheckout", { value: 47, currency: "BRL" }, { eventID })` and that the same event ID was sent in the request body.

- [ ] **Step 2: Run the focused component tests to verify they fail**

Run: `npm test -- tests/components/MetaPixel.test.tsx tests/components/QuizModal.test.tsx`  
Expected: FAIL because `MetaPixel` and browser tracking do not exist.

- [ ] **Step 3: Implement consent-first client tracking and public configuration**

```tsx
export function MetaPixel() {
  const [consented, setConsented] = useState(() => localStorage.getItem("vp-marketing-consent") === "granted");
  useEffect(() => {
    if (!consented) return;
    void loadPixelFromConfig().then((pixelId) => trackPageView(pixelId));
  }, [consented]);
  return consented ? null : <CookieConsent onAccept={() => { localStorage.setItem("vp-marketing-consent", "granted"); setConsented(true); }} />;
}
```

Insert `<MetaPixel />` in `RootLayout`. The dynamic loader creates the script once, initializes `fbq("init", pixelId)`, reads `_fbp` and `_fbc` cookies, and emits `PageView`. `QuizModal` creates a UUID immediately before checkout, includes it in a `tracking` object, and emits browser `InitiateCheckout` only after response status 201. No Meta script or API call runs if the visitor declines consent.

- [ ] **Step 4: Run the focused component tests to verify they pass**

Run: `npm test -- tests/components/MetaPixel.test.tsx tests/components/QuizModal.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit browser tracking**

```bash
git add src/components/MetaPixel.tsx src/app/layout.tsx src/components/QuizModal.tsx tests/components/MetaPixel.test.tsx tests/components/QuizModal.test.tsx
git commit -m "feat: add consented Meta Pixel tracking"
```

### Task 5: Add a paused-only Meta campaign launcher

**Files:**
- Create: `scripts/meta-launch.mjs`
- Create: `tests/scripts/meta-launch.test.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces `npm run meta:launch`.
- Requires `META_ACCESS_TOKEN`, `META_ACCOUNT_ID`, `META_PAGE_ID`, `META_PIXEL_ID`; exits before any write if any is absent.
- Uses six files in `/home/samuel/Documents/Codex/2026-09-14/fa/outputs/anuncios-votosperfeitos/`.

- [ ] **Step 1: Write the failing launcher tests**

```js
it("refuses to create objects when required Meta variables are absent", async () => {
  await expect(runLauncher({})).rejects.toThrow("META_ACCESS_TOKEN is required");
});

it("sends PAUSED status for campaign, ad set, creative and every ad", async () => {
  await runLauncher(validEnvironment, fakeGraphApi);
  for (const write of fakeGraphApi.writes) expect(write.body.status).toBe("PAUSED");
});
```

- [ ] **Step 2: Run the launcher test to verify it fails**

Run: `node --test tests/scripts/meta-launch.test.mjs`  
Expected: FAIL because the launcher does not exist.

- [ ] **Step 3: Implement read-first campaign creation**

```js
const campaign = await graph.post(`/${accountId}/campaigns`, {
  name: "VP | Vendas | Brasil | Criativos v1",
  objective: "OUTCOME_SALES",
  status: "PAUSED",
  special_ad_categories: [],
});
```

Before the first write, fetch the account, Page, Pixel, existing campaign names, and the six local asset checksums. Stop if account currency is not `BRL`, Page or Pixel is unavailable, or the planned name already exists. Upload images, create placement-aware creatives, one paused ad set with `daily_budget: 5000`, broad Brazil age 23–44 targeting, `LOWEST_COST_WITHOUT_CAP`, Pixel `Purchase` promoted object, and three paused ads. Use API v24, one request at a time, a 300 ms gap between write batches, and stop immediately on rate-limit codes 17, 613, or subcode 80004. The post-create verifier fetches effective statuses, estimated audience, Page identity, creative hashes, destination URL, and a preview URL.

- [ ] **Step 4: Run the launcher test to verify it passes**

Run: `node --test tests/scripts/meta-launch.test.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit the launcher**

```bash
git add scripts/meta-launch.mjs tests/scripts/meta-launch.test.mjs package.json .gitignore
git commit -m "feat: add paused Meta campaign launcher"
```

### Task 6: Configure, validate, deploy, and launch

**Files:**
- Modify: `wrangler.toml` only if a non-secret `META_PIXEL_ID` default is required locally.
- Modify: `tests/worker/config.test.ts`
- Modify: `README.md` if it exists; otherwise create: `docs/meta-operations.md`

**Interfaces:**
- Documents exact secret names without their values.
- Requires Cloudflare secrets `META_CAPI_ACCESS_TOKEN` and optional `META_TEST_EVENT_CODE`, plus binding `META_PIXEL_ID`.

- [ ] **Step 1: Write the failing configuration test**

```ts
it("documents the Meta tracking bindings without exposing their values", () => {
  const source = readFileSync("src/worker/env.ts", "utf8");
  expect(source).toContain("META_PIXEL_ID: string");
  expect(source).toContain("META_CAPI_ACCESS_TOKEN: string");
});
```

- [ ] **Step 2: Run the focused configuration test to verify it fails**

Run: `npm test -- tests/worker/config.test.ts`  
Expected: FAIL until Task 1 adds the required bindings.

- [ ] **Step 3: Configure the approved production environment**

```bash
npx wrangler secret put META_CAPI_ACCESS_TOKEN
npx wrangler secret put META_TEST_EVENT_CODE # only for Meta Events Manager test mode
npx wrangler deploy
```

Set `META_PIXEL_ID` as a Worker variable using the existing Cloudflare deployment method. Do not set or deploy `META_ACCESS_TOKEN`; it is local-only. Apply migration `0003_meta_tracking.sql` with the existing D1 migration deployment command. Add a short operations document with the public binding name, secret names, launch command, and the 7-day no-change rule.

- [ ] **Step 4: Run complete verification**

Run:

```bash
npm test
npm run lint
npm run build
npx wrangler d1 migrations apply votosperfeitos-orders --remote
npx wrangler deploy
curl --fail --silent --show-error https://votosperfeitos.avancoai.com.br/
```

Expected: all tests, lint, build, migration, deploy, and live-site request succeed.

- [ ] **Step 5: Run the paused campaign launcher and verify externally**

Run: `set -a; . /home/samuel/.env; set +a; npm run meta:launch`  
Expected: one paused campaign, one paused ad set, three paused ads, estimated audience greater than zero, and no active delivery.

- [ ] **Step 6: Commit deployment documentation**

```bash
git add wrangler.toml tests/worker/config.test.ts docs/meta-operations.md
git commit -m "docs: document Meta tracking operations"
git push origin main
```

## Plan self-review

- Spec coverage: consent (Task 4), Pixel/CAPI event pairing (Tasks 1–4), server-verified purchase (Task 3), retention (Task 2), secrets (Tasks 1 and 6), paused campaign and targeting (Task 5), and verification (Tasks 1–6).
- Placeholder scan: no unresolved implementation markers or generic error-handling instructions remain.
- Interface consistency: `MetaTracking`, `sendMetaEvent`, the checkout request context, and campaign variables are defined before their consumers.
