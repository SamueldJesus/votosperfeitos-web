import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("brand favicon", () => {
  it("uses the same simple interlocking-ring mark as the landing-page header", async () => {
    const icons = await Promise.all([
      readFile("src/app/icon.svg", "utf8"),
      readFile("public/favicon.svg", "utf8"),
    ]);

    for (const icon of icons) {
      expect(icon).toContain('circle cx="24" cy="34" r="13"');
      expect(icon).toContain('circle cx="40" cy="34" r="13"');
      expect(icon).not.toContain("diamond sparkle");
    }
  });
});
