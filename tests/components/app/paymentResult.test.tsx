import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const push = vi.fn();
const replace = vi.fn();
const refreshCart = vi.fn(async () => {});
const setAuthMenuOpen = vi.fn();

let auth = {
    session: { access_token: "tok" } as { access_token: string } | null,
    loading: false,
    isLoggedIn: true,
    setAuthMenuOpen
};

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace })
}));
vi.mock("@/lib/auth-context", () => ({ useAuth: () => auth }));
vi.mock("@/lib/cart-context", () => ({ useCart: () => ({ refreshCart }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/checkout-api", () => ({
    verifyPayment: vi.fn(),
    createPaymentAttempt: vi.fn()
}));
vi.mock("@/lib/payment-flow", () => ({ startCardPayment: vi.fn() }));

import { PaymentResultClient } from "@/components/app/checkout/PaymentResultClient";
import { createPaymentAttempt, verifyPayment } from "@/lib/checkout-api";
import { startCardPayment } from "@/lib/payment-flow";

const order = (status = "PENDING_PAYMENT") => ({ id: "o1", reference: "OG-000042", status });

const verified = (paymentStatus: "PAID" | "PENDING" | "FAILED", extra: object = {}) => ({
    ok: true as const,
    result: { paymentStatus, order: order(paymentStatus === "PAID" ? "UNFULFILLED" : "PENDING_PAYMENT"), ...extra }
});

beforeEach(() => {
    vi.clearAllMocks();
    auth = {
        session: { access_token: "tok" },
        loading: false,
        isLoggedIn: true,
        setAuthMenuOpen
    };
});

afterEach(() => {
    vi.useRealTimers();
});

describe("PaymentResultClient", () => {
    it("asks the server about the payment in the address, not what the page claims", async () => {
        vi.mocked(verifyPayment).mockResolvedValueOnce(verified("PAID"));

        render(<PaymentResultClient reference="OG42-ABC" />);

        await screen.findByText(/Payment received/);
        expect(verifyPayment).toHaveBeenCalledWith("OG42-ABC", "tok");
        expect(screen.getByText(/OG-000042 is confirmed/)).toBeTruthy();
    });

    it("refreshes the cart once a payment is confirmed, since the server clears what was bought", async () => {
        vi.mocked(verifyPayment).mockResolvedValueOnce(verified("PAID"));

        render(<PaymentResultClient reference="OG42-ABC" />);
        await screen.findByText(/Payment received/);

        expect(refreshCart).toHaveBeenCalledTimes(1);
    });

    it("shows a failure with the gateway's reason and offers a retry that uses a fresh attempt", async () => {
        vi.mocked(verifyPayment).mockResolvedValueOnce(
            verified("FAILED", { message: "Insufficient funds" })
        );
        vi.mocked(createPaymentAttempt).mockResolvedValueOnce({
            ok: true,
            payment: { reference: "OG42-NEW", amount: 100, checkoutMode: "INLINE" }
        });
        vi.mocked(startCardPayment).mockResolvedValueOnce({ ok: true });

        render(<PaymentResultClient reference="OG42-ABC" />);

        await screen.findByText("Your payment didn't go through");
        expect(screen.getByText("Insufficient funds")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Try again" }));

        await waitFor(() => expect(startCardPayment).toHaveBeenCalled());
        expect(createPaymentAttempt).toHaveBeenCalledWith("o1", "INLINE", "tok");
        const args = vi.mocked(startCardPayment).mock.calls[0][0];
        expect(args).toMatchObject({ reference: "OG42-NEW", orderId: "o1", accessToken: "tok" });

        // Once the popup finishes, the page re-checks the new attempt.
        args.onFinished("OG42-NEW");
        expect(replace).toHaveBeenCalledWith("/checkout/complete?reference=OG42-NEW");
    });

    it("doesn't offer a retry when the order is no longer waiting for payment", async () => {
        vi.mocked(verifyPayment).mockResolvedValueOnce({
            ok: true,
            result: { paymentStatus: "FAILED", order: order("CANCELLED") }
        });

        render(<PaymentResultClient reference="OG42-ABC" />);
        await screen.findByText("Your payment didn't go through");

        expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    });

    it("keeps checking while pending, then asks the customer to check again", async () => {
        vi.useFakeTimers();
        vi.mocked(verifyPayment).mockResolvedValue(verified("PENDING"));

        render(<PaymentResultClient reference="OG42-ABC" />);

        for (let i = 0; i < 6; i++) {
            await act(async () => {
                await vi.advanceTimersByTimeAsync(3000);
            });
        }

        expect(verifyPayment).toHaveBeenCalledTimes(5);
        expect(screen.getByText("We haven't received your payment yet")).toBeTruthy();
        expect(screen.getByText(/don.t pay twice/)).toBeTruthy();

        // Checking again starts another round.
        vi.mocked(verifyPayment).mockResolvedValue(verified("PAID"));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Check again" }));
        });
        expect(screen.getByText(/Payment received/)).toBeTruthy();
    });

    it("tells the customer not to pay again when the check itself fails", async () => {
        vi.mocked(verifyPayment).mockResolvedValueOnce({
            ok: false,
            error: "We couldn't confirm your payment right now. If you were charged, please don't pay again."
        });

        render(<PaymentResultClient reference="OG42-ABC" />);

        await screen.findByText("We couldn't check your payment");
        expect(screen.getByText(/don't pay again/)).toBeTruthy();
        expect(screen.getByRole("button", { name: "Check again" })).toBeTruthy();
    });

    it("reports a payment that isn't the customer's", async () => {
        vi.mocked(verifyPayment).mockResolvedValueOnce({
            ok: false,
            error: "Payment not found",
            notFound: true
        });

        render(<PaymentResultClient reference="OG42-ABC" />);

        await screen.findByText("We couldn't find that payment");
        expect(screen.queryByRole("button", { name: "Check again" })).toBeNull();
    });

    it("handles a missing reference without calling the server", () => {
        render(<PaymentResultClient reference={null} />);

        expect(screen.getByText("We couldn't find that payment")).toBeTruthy();
        expect(verifyPayment).not.toHaveBeenCalled();
    });

    it("asks logged-out visitors to log in first", () => {
        auth = { session: null, loading: false, isLoggedIn: false, setAuthMenuOpen };

        render(<PaymentResultClient reference="OG42-ABC" />);

        fireEvent.click(screen.getByRole("button", { name: "Log in" }));
        expect(setAuthMenuOpen).toHaveBeenCalledWith(true);
        expect(verifyPayment).not.toHaveBeenCalled();
    });
});