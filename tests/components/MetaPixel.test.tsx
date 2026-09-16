// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MetaPixel } from "../../src/components/MetaPixel";

beforeEach(() => {
  const values = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      clear: () => values.clear(),
    },
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.querySelectorAll('script[data-meta-pixel="true"]').forEach((element) => element.remove());
  delete (window as Window & { fbq?: unknown }).fbq;
  vi.restoreAllMocks();
});

describe("MetaPixel", () => {
  it("does not load Meta before explicit marketing consent", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<MetaPixel />);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.querySelector('script[data-meta-pixel="true"]')).toBeNull();
  });

  it("loads the Pixel and records PageView after consent", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ pixelId: "pixel-123" }), { status: 200 }),
    );
    const fbq = vi.fn();
    (window as Window & { fbq?: unknown }).fbq = fbq;
    render(<MetaPixel />);

    await user.click(screen.getByRole("button", { name: "Aceitar cookies de marketing" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith("/api/meta/config"));
    expect(document.querySelector('script[data-meta-pixel="true"]')).not.toBeNull();
    expect(fbq).toHaveBeenCalledWith("init", "pixel-123");
    expect(fbq).toHaveBeenCalledWith("track", "PageView", {}, expect.objectContaining({ eventID: expect.any(String) }));
  });
});
