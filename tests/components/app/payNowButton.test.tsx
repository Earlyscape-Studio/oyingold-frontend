import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
const toastError = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push })
}));
vi.mock("sonner", () => ({ toast: { error: (m: string) => toastError(m) } }));
vi.mock("@/lib/checkout-api", () => ({
    CARD_PAYMENTS_ENABLED: true,
    createPaymentAttempt: vi.fn()
}));
vi.mock("@/lib/payment-flow", () => ({ startCardPayment: vi.fn() }));

import { OrderCard } from "@/components/app/account/OrderCard";
import { createPaymentAttempt } from "@/lib/checkout-api";
import { startCardPayment } from "@/lib/payment-flow";
import type { CustomerOrder } from "@/lib/api";

function makeOrder(overrides: Partial<CustomerOrder> = {}): CustomerOrder {
    return {
        id: "o1",
        reference: "OG-000042",
        status: "PENDING_PAYMENT",
        step: 1,
        paymentMethod: "CARD",
        total: 22500,
        trackingNumber: null,
        shippingAddress: null,
        createdAt: "2026-10-27T10:00:00.000Z",
        items: [],
        ...overrides
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("Pay now on the order list", () => {
    it("is offered for an unpaid card order", () => {
        render(<OrderCard order={makeOrder()} accessToken="tok" />);
        expect(screen.getByRole("button", { name: "Pay now" })).toBeTruthy();
    });

    it("is not offered for cash on delivery, paid or cancelled orders", () => {
        const { rerender } = render(
            <OrderCard order={makeOrder({ paymentMethod: "COD" })} accessToken="tok" />
        );
        expect(screen.queryByRole("button", { name: "Pay now" })).toBeNull();

        rerender(<OrderCard order={makeOrder({ status: "UNFULFILLED" })} accessToken="tok" />);
        expect(screen.queryByRole("button", { name: "Pay now" })).toBeNull();

        rerender(<OrderCard order={makeOrder({ status: "CANCELLED", step: null })} accessToken="tok" />);
        expect(screen.queryByRole("button", { name: "Pay now" })).toBeNull();
    });

    it("is not offered without a signed-in session", () => {
        render(<OrderCard order={makeOrder()} />);
        expect(screen.queryByRole("button", { name: "Pay now" })).toBeNull();
    });

    it("starts a fresh attempt and sends the customer to the result page when done", async () => {
        vi.mocked(createPaymentAttempt).mockResolvedValueOnce({
            ok: true,
            payment: { reference: "OG42-NEW", amount: 22500, checkoutMode: "INLINE" }
        });
        vi.mocked(startCardPayment).mockImplementationOnce(async ({ onFinished }) => {
            onFinished("OG42-NEW");
            return { ok: true };
        });

        render(<OrderCard order={makeOrder()} accessToken="tok" />);
        fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

        await waitFor(() =>
            expect(push).toHaveBeenCalledWith("/checkout/complete?reference=OG42-NEW")
        );
        expect(createPaymentAttempt).toHaveBeenCalledWith("o1", "INLINE", "tok");
        expect(startCardPayment).toHaveBeenCalledWith(
            expect.objectContaining({ reference: "OG42-NEW", orderId: "o1", accessToken: "tok" })
        );
    });

    it("shows the error and lets the customer try again when a new attempt can't be created", async () => {
        vi.mocked(createPaymentAttempt).mockResolvedValueOnce({
            ok: false,
            error: "This order is not waiting for a card payment"
        });

        render(<OrderCard order={makeOrder()} accessToken="tok" />);
        fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

        await waitFor(() =>
            expect(toastError).toHaveBeenCalledWith("This order is not waiting for a card payment")
        );
        expect(startCardPayment).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Pay now" })).not.toBeDisabled();
    });
});