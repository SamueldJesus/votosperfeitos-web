import assert from "node:assert/strict";
import test from "node:test";
import { assertConfig, buildLaunchPlan } from "../../scripts/meta-launch.mjs";

test("rejects a launch without the required Meta credentials", () => {
  assert.throws(() => assertConfig({}), /META_ACCESS_TOKEN is required/);
});

test("builds a sales campaign with PAUSED status at every level", () => {
  const plan = buildLaunchPlan({
    META_ACCESS_TOKEN: "token",
    META_ACCOUNT_ID: "act_123",
    META_PAGE_ID: "page-123",
    META_PIXEL_ID: "pixel-123",
  });

  assert.equal(plan.campaign.status, "PAUSED");
  assert.equal(plan.adset.status, "PAUSED");
  assert.equal(plan.ads.length, 3);
  for (const ad of plan.ads) assert.equal(ad.status, "PAUSED");
  assert.equal(plan.campaign.objective, "OUTCOME_SALES");
  assert.equal(plan.adset.daily_budget, 5000);
});
