import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/checkout-api", () => ({
    initializePayment: vi.fn(),
    createPaymentAttempt: vi.fn()
}));
vi.mock("@/lib/fcmb-inline", () => ({
    loadInlineScript: vi.fn(),
    openInlineCheckout: vi.fn()
}));

import { createPaymentAttempt, initializePayment } from "@/lib/checkout-api";
import { loadInlineScript, openInlineCheckout } from "@/lib/fcmb-inline";
import { startCardPayment } from "@/lib/payment-flow";

const assign = vi.fn();

const inlineConfig = {
    publicKey: "pk",
    reference: "OG42-INLINE",
    amount: "100.00",
    currency: "NGN",
    country: "NG",
    description: "d",
    email: "a@b.co",
    fullName: null,
    callbackUrl: "https://shop/complete"
};

function start(onFinished = vi.fn()) {
    return startCardPayment({
        reference: "OG42-INLINE",
        orderId: "o1",
        accessToken: "tok",
        onFinished
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
        value: { assign },
        writable: true,
        configurable: true
    });
});

describe("startCardPayment", () => {
    it("redirects to FCMB's hosted page for standard checkout", async () => {
        vi.mocked(initializePayment).mockResolvedValueOnce({
            ok: true,
            mode: "STANDARD",
            redirectLink: "https://checkout.example/pay"
        });

        const result = await start();

        expect(result).toEqual({ ok: true });
        expect(assign).toHaveBeenCalledWith("https://checkout.example/pay");
        expect(loadInlineScript).not.toHaveBeenCalled();
    });

    it("opens the popup for inline checkout and reports the attempt it used", async () => {
        vi.mocked(initializePayment).mockResolvedValueOnce({
            ok: true,
            mode: "INLINE",
            config: inlineConfig
        });
        vi.mocked(loadInlineScript).mockResolvedValueOnce();
        const onFinished = vi.fn();

        const result = await start(onFinished);

        expect(result).toEqual({ ok: true });
        expect(openInlineCheckout).toHaveBeenCalledWith(inlineConfig, expect.any(Object));

        // The popup reports both a result and a close; only the first should count.
        const handlers = vi.mocked(openInlineCheckout).mock.calls[0][1];
        handlers.onComplete();
        handlers.onClose();
        expect(onFinished).toHaveBeenCalledTimes(1);
        expect(onFinished).toHaveBeenCalledWith("OG42-INLINE");
    });

    it("falls back to standard checkout when the popup script can't load", async () => {
        vi.mocked(initializePayment)
            .mockResolvedValueOnce({ ok: true, mode: "INLINE", config: inlineConfig })
            .mockResolvedValueOnce({
                ok: true,
                mode: "STANDARD",
                redirectLink: "https://checkout.example/fallback"
            });
        vi.mocked(loadInlineScript).mockRejectedValueOnce(new Error("blocked"));
        vi.mocked(createPaymentAttempt).mockResolvedValueOnce({
            ok: true,
            payment: { reference: "OG42-STANDARD", amount: 100, checkoutMode: "STANDARD" }
        });

        const result = await start();

        expect(result).toEqual({ ok: true });
        expect(createPaymentAttempt).toHaveBeenCalledWith("o1", "STANDARD", "tok");
        expect(initializePayment).toHaveBeenLastCalledWith("OG42-STANDARD", "tok");
        expect(assign).toHaveBeenCalledWith("https://checkout.example/fallback");
        expect(openInlineCheckout).not.toHaveBeenCalled();
    });

    it("falls back too when opening the popup throws", async () => {
        vi.mocked(initializePayment)
            .mockResolvedValueOnce({ ok: true, mode: "INLINE", config: inlineConfig })
            .mockResolvedValueOnce({ ok: true, mode: "STANDARD", redirectLink: "https://x/y" });
        vi.mocked(loadInlineScript).mockResolvedValueOnce();
        vi.mocked(openInlineCheckout).mockImplementationOnce(() => {
            throw new Error("popup failed");
        });
        vi.mocked(createPaymentAttempt).mockResolvedValueOnce({
            ok: true,
            payment: { reference: "OG42-STANDARD", amount: 100, checkoutMode: "STANDARD" }
        });

        const result = await start();

        expect(result).toEqual({ ok: true });
        expect(assign).toHaveBeenCalledWith("https://x/y");
    });

    it("returns the error when the payment can't be started", async () => {
        vi.mocked(initializePayment).mockResolvedValueOnce({
            ok: false,
            error: "We couldn't start your payment. Please try again."
        });

        const result = await start();

        expect(result).toEqual({
            ok: false,
            error: "We couldn't start your payment. Please try again."
        });
        expect(assign).not.toHaveBeenCalled();
    });

    it("returns the error when the fallback can't be started either", async () => {
        vi.mocked(initializePayment).mockResolvedValueOnce({
            ok: true,
            mode: "INLINE",
            config: inlineConfig
        });
        vi.mocked(loadInlineScript).mockRejectedValueOnce(new Error("blocked"));
        vi.mocked(createPaymentAttempt).mockResolvedValueOnce({
            ok: false,
            error: "This order is not waiting for a card payment"
        });

        const result = await start();

        expect(result).toEqual({
            ok: false,
            error: "This order is not waiting for a card payment"
        });
    });
});