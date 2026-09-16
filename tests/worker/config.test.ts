import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("local Worker configuration", () => {
  it("lists every provider secret without embedding its value", async () => {
    const example = await readFile(".dev.vars.example", "utf8");
    for (const name of ["OPENAI_API_KEY", "MP_ACCESS_TOKEN", "MP_WEBHOOK_SECRET", "RESEND_API_KEY", "EMAIL_FROM", "META_PIXEL_ID", "META_CAPI_ACCESS_TOKEN", "META_TEST_EVENT_CODE"]) {
      expect(example).toContain(`${name}=`);
    }
  });
});
