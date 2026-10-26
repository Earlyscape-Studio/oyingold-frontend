import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { InlineConfig } from "@/lib/checkout-api";

const config: InlineConfig = {
    publicKey: "pk_test_123",
    reference: "OG42-ABC1234567",
    amount: "22950.00",
    currency: "NGN",
    country: "NG",
    description: "Oyingold Retail order OG-000042",
    email: "ada@example.com",
    fullName: "Ada Nwosu",
    callbackUrl: "https://oyingold.com/checkout/complete?reference=OG42-ABC1234567"
};

// The module keeps a loading promise between calls, so each test gets a fresh copy.
async function freshModule() {
    vi.resetModules();
    return import("@/lib/fcmb-inline");
}

beforeEach(() => {
    delete window.SeerBit;
    document.head.innerHTML = "";
});

afterEach(() => {
    vi.useRealTimers();
});

describe("loadInlineScript", () => {
    it("adds FCMB's script once and resolves when it has defined SeerBit", async () => {
        const { loadInlineScript } = await freshModule();

        const first = loadInlineScript();
        const second = loadInlineScript();

        const scripts = document.head.querySelectorAll("script");
        expect(scripts).toHaveLength(1);
        expect(scripts[0].src).toBe("https://checkout.seerbitapi.com/api/v2/seerbit.js");

        window.SeerBit = vi.fn();
        scripts[0].onload?.(new Event("load"));

        await expect(first).resolves.toBeUndefined();
        await expect(second).resolves.toBeUndefined();
    });

    it("resolves straight away when the script is already there", async () => {
        window.SeerBit = vi.fn();
        const { loadInlineScript } = await freshModule();

        await expect(loadInlineScript()).resolves.toBeUndefined();
        expect(document.head.querySelectorAll("script")).toHaveLength(0);
    });

    it("rejects when the script can't load, and lets a later call try again", async () => {
        const { loadInlineScript } = await freshModule();

        const attempt = loadInlineScript();
        document.head.querySelector("script")?.onerror?.(new Event("error"));
        await expect(attempt).rejects.toThrow();

        const retry = loadInlineScript();
        expect(document.head.querySelectorAll("script")).toHaveLength(1);
        window.SeerBit = vi.fn();
        document.head.querySelector("script")?.onload?.(new Event("load"));
        await expect(retry).resolves.toBeUndefined();
    });

    it("rejects when the script loads but doesn't define SeerBit", async () => {
        const { loadInlineScript } = await freshModule();

        const attempt = loadInlineScript();
        document.head.querySelector("script")?.onload?.(new Event("load"));

        await expect(attempt).rejects.toThrow();
    });

    it("gives up if the script takes too long", async () => {
        vi.useFakeTimers();
        const { loadInlineScript } = await freshModule();

        const attempt = loadInlineScript();
        const assertion = expect(attempt).rejects.toThrow(/Timed out/);
        await vi.advanceTimersByTimeAsync(10_001);

        await assertion;
    });
});

describe("openInlineCheckout", () => {
    it("maps our settings onto FCMB's and locks the amount", async () => {
        const { openInlineCheckout } = await freshModule();
        window.SeerBit = vi.fn();

        openInlineCheckout(config, { onComplete: vi.fn(), onClose: vi.fn() });

        const [settings] = vi.mocked(window.SeerBit).mock.calls[0];
        expect(settings).toEqual({
            tranref: "OG42-ABC1234567",
            currency: "NGN",
            country: "NG",
            description: "Oyingold Retail order OG-000042",
            amount: "22950.00",
            email: "ada@example.com",
            full_name: "Ada Nwosu",
            callbackurl: "https://oyingold.com/checkout/complete?reference=OG42-ABC1234567",
            public_key: "pk_test_123",
            setAmountByCustomer: false,
            close_on_success: true
        });
    });

    it("leaves the name out when there isn't one", async () => {
        const { openInlineCheckout } = await freshModule();
        window.SeerBit = vi.fn();

        openInlineCheckout({ ...config, fullName: null }, { onComplete: vi.fn(), onClose: vi.fn() });

        const [settings] = vi.mocked(window.SeerBit).mock.calls[0];
        expect(settings).not.toHaveProperty("full_name");
    });

    it("reports a result and closes the popup, and reports a plain close", async () => {
        const { openInlineCheckout } = await freshModule();
        window.SeerBit = vi.fn();
        const handlers = { onComplete: vi.fn(), onClose: vi.fn() };

        openInlineCheckout(config, handlers);
        const [, onComplete, onClose] = vi.mocked(window.SeerBit).mock.calls[0];

        const close = vi.fn();
        onComplete({ status: "anything" }, close);
        expect(handlers.onComplete).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalled();

        onClose();
        expect(handlers.onClose).toHaveBeenCalledTimes(1);
    });

    it("throws if the script isn't loaded", async () => {
        const { openInlineCheckout } = await freshModule();
        expect(() =>
            openInlineCheckout(config, { onComplete: vi.fn(), onClose: vi.fn() })
        ).toThrow();
    });
});