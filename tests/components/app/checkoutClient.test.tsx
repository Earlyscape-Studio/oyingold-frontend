import { describe, it, expect, vi, beforeEach } from "vitest";

// Card payments are off unless the environment turns them on; these tests are about the "on" case.
vi.hoisted(() => {
    process.env.NEXT_PUBLIC_CARD_PAYMENTS_ENABLED = "true";
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
const refreshCart = vi.fn(async () => {});

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

vi.mock("@/lib/auth-context", () => ({
    useAuth: () => ({
        session: { access_token: "tok" },
        user: { fullName: "Ada Nwosu", email: "ada@example.com", phone: "+234 812 3456 789" },
        loading: false,
        isLoggedIn: true,
        setAuthMenuOpen: vi.fn()
    })
}));

// Held still between renders, like the real cart context, so the totals request isn't re-run on every render.
const cartFixture = vi.hoisted(() => ({
    id: "c1",
    items: [
        {
            id: "ci1",
            quantity: 1,
            pricingType: "carton",
            productVariant: {
                cartonPrice: "21000",
                piecePrice: "2000",
                product: { name: "Indomie Instant Noodles", images: [] as string[] }
            }
        }
    ]
}));

vi.mock("@/lib/cart-context", () => ({
    useCart: () => ({
        cart: cartFixture,
        loading: false,
        error: null,
        refreshCart
    })
}));

vi.mock("@/lib/api", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/api")>()),
    // A saved address fills the whole form, so the test never has to drive the state dropdown.
    getMyAddresses: vi.fn(async () => [
        {
            id: "a1",
            fullName: "Ada Nwosu",
            phone: "+234 812 3456 789",
            street: "25 City Drive",
            city: "Victoria Island",
            state: "Lagos",
            country: "Nigeria",
            isDefault: true,
            isLastUsed: true
        }
    ])
}));

vi.mock("@/lib/checkout-api", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/checkout-api")>()),
    getCheckoutQuote: vi.fn(),
    createOrder: vi.fn()
}));
vi.mock("@/lib/payment-flow", () => ({ startCardPayment: vi.fn() }));

import { CheckoutClient } from "@/components/app/checkout/CheckoutClient";
import { createOrder, getCheckoutQuote } from "@/lib/checkout-api";
import { startCardPayment } from "@/lib/payment-flow";

const totals = (overrides = {}) => ({
    subtotal: 21000,
    shippingFee: 1500,
    paymentFee: 0,
    discount: 0,
    total: 22500,
    ...overrides
});

const placedOrder = {
    id: "o1",
    reference: "OG-000042"
};

async function renderReadyForm() {
    vi.mocked(getCheckoutQuote).mockResolvedValue({
        ok: true,
        quotes: { COD: totals(), CARD: totals({ paymentFee: 450, total: 22950 }) }
    });

    render(<CheckoutClient />);

    // Wait for the saved address to prefill and the totals to load.
    await waitFor(() => expect(screen.getByDisplayValue("25 City Drive")).toBeTruthy());
    await waitFor(() =>
        expect((screen.getByRole("button", { name: /place order/i }) as HTMLButtonElement).disabled).toBe(false)
    );
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("CheckoutClient: card payments", () => {
    it("defaults to card when card payments are on, and shows the card fee in the total", async () => {
        await renderReadyForm();

        const card = screen.getByRole("radio", { name: /debit\/credit card/i }) as HTMLInputElement;
        expect(card.checked).toBe(true);
        expect(screen.getByText("Card processing fee")).toBeTruthy();
        expect(screen.getByText("₦22,950")).toBeTruthy();
    });

    it("creates the order as an inline card order, then hands over to payment, leaving the cart alone", async () => {
        await renderReadyForm();
        vi.mocked(createOrder).mockResolvedValueOnce({
            ok: true,
            order: placedOrder as never,
            payment: { reference: "OG42-ABC", amount: 22950, checkoutMode: "INLINE" }
        });
        vi.mocked(startCardPayment).mockResolvedValueOnce({ ok: true });

        fireEvent.click(screen.getByRole("button", { name: /place order/i }));

        await waitFor(() => expect(startCardPayment).toHaveBeenCalled());

        const [payload, token] = vi.mocked(createOrder).mock.calls[0];
        expect(token).toBe("tok");
        expect(payload).toMatchObject({
            paymentMethod: "CARD",
            checkoutMode: "INLINE",
            contact: { email: "ada@example.com" },
            shippingAddress: { state: "Lagos", street: "25 City Drive", country: "Nigeria" }
        });

        const args = vi.mocked(startCardPayment).mock.calls[0][0];
        expect(args).toMatchObject({ reference: "OG42-ABC", orderId: "o1", accessToken: "tok" });

        // Nothing moves on until the popup finishes, and the cart stays until payment is confirmed.
        expect(push).not.toHaveBeenCalled();
        expect(refreshCart).not.toHaveBeenCalled();

        args.onFinished("OG42-ABC");
        expect(push).toHaveBeenCalledWith("/checkout/complete?reference=OG42-ABC");
    });

    it("sends the customer to the result page to retry when the payment can't be started", async () => {
        await renderReadyForm();
        vi.mocked(createOrder).mockResolvedValueOnce({
            ok: true,
            order: placedOrder as never,
            payment: { reference: "OG42-ABC", amount: 22950, checkoutMode: "INLINE" }
        });
        vi.mocked(startCardPayment).mockResolvedValueOnce({
            ok: false,
            error: "We couldn't start your payment. Please try again."
        });

        fireEvent.click(screen.getByRole("button", { name: /place order/i }));

        await waitFor(() =>
            expect(push).toHaveBeenCalledWith("/checkout/complete?reference=OG42-ABC")
        );
    });

    it("keeps the customer on the page when the order itself is refused", async () => {
        await renderReadyForm();
        vi.mocked(createOrder).mockResolvedValueOnce({
            ok: false,
            error: "Some items don't have enough stock",
            shortages: [{ name: "Indomie", requested: 12, available: 5 }]
        });

        fireEvent.click(screen.getByRole("button", { name: /place order/i }));

        await waitFor(() => expect(refreshCart).toHaveBeenCalled());
        expect(startCardPayment).not.toHaveBeenCalled();
        expect(push).not.toHaveBeenCalled();
    });
});

describe("CheckoutClient: cash on delivery", () => {
    it("places a COD order without involving the payment popup", async () => {
        await renderReadyForm();
        vi.mocked(createOrder).mockResolvedValueOnce({
            ok: true,
            order: placedOrder as never
        });

        fireEvent.click(screen.getByRole("radio", { name: /cash on delivery/i }));
        fireEvent.click(screen.getByRole("button", { name: /place order/i }));

        await waitFor(() => expect(push).toHaveBeenCalledWith("/account"));

        expect(vi.mocked(createOrder).mock.calls[0][0]).toMatchObject({ paymentMethod: "COD" });
        expect(vi.mocked(createOrder).mock.calls[0][0]).not.toHaveProperty("checkoutMode");
        expect(startCardPayment).not.toHaveBeenCalled();
    });
});