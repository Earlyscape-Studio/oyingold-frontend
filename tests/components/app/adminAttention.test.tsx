import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NeedsAttentionBadge } from "@/components/app/admin/NeedsAttentionBadge";
import { OrderAttentionCard } from "@/components/app/admin/OrderAttentionCard";
import { OrderPaymentsCard } from "@/components/app/admin/OrderPaymentsCard";
import { resolveOrderAttention, type AdminPayment, type Order } from "@/lib/api";

vi.mock("@/lib/supabase-client", () => ({
    supabase: {
        auth: {
            getSession: vi.fn(async () => ({ data: { session: { access_token: "tok" } } }))
        }
    }
}));

vi.mock("@/lib/api", () => ({ resolveOrderAttention: vi.fn() }));

function makeOrder(overrides: Partial<Order> = {}): Order {
    return {
        id: "o1",
        status: "UNFULFILLED",
        totalAmount: "22950",
        trackingNumber: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        needsAttention: true,
        needsAttentionReason: "Paid, but not enough stock to fulfil: Indomie.",
        user: { id: "u1", email: "ada@example.com" },
        items: [],
        ...overrides
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("NeedsAttentionBadge", () => {
    it("shows the label and puts the reason in the tooltip", () => {
        render(<NeedsAttentionBadge reason="Duplicate payment" />);
        const badge = screen.getByText("Needs attention");
        expect(badge.getAttribute("title")).toBe("Duplicate payment");
    });
});

describe("OrderAttentionCard", () => {
    it("renders nothing for an order that isn't flagged", () => {
        const { container } = render(
            <OrderAttentionCard order={makeOrder({ needsAttention: false })} onResolved={vi.fn()} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("shows the reason for a flagged order", () => {
        render(<OrderAttentionCard order={makeOrder()} onResolved={vi.fn()} />);
        expect(screen.getByText(/not enough stock to fulfil: Indomie/)).toBeTruthy();
    });

    it("marks the order resolved and tells the page", async () => {
        vi.mocked(resolveOrderAttention).mockResolvedValueOnce({ ok: true });
        const onResolved = vi.fn();

        render(<OrderAttentionCard order={makeOrder()} onResolved={onResolved} />);
        fireEvent.click(screen.getByRole("button", { name: "Mark as resolved" }));

        await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1));
        expect(resolveOrderAttention).toHaveBeenCalledWith("o1", "tok");
    });

    it("keeps the flag and shows the error when resolving fails", async () => {
        vi.mocked(resolveOrderAttention).mockResolvedValueOnce({ ok: false, error: "Order not found" });
        const onResolved = vi.fn();

        render(<OrderAttentionCard order={makeOrder()} onResolved={onResolved} />);
        fireEvent.click(screen.getByRole("button", { name: "Mark as resolved" }));

        await waitFor(() => expect(screen.getByText("Order not found")).toBeTruthy());
        expect(onResolved).not.toHaveBeenCalled();
    });
});

describe("OrderPaymentsCard", () => {
    const payment: AdminPayment = {
        id: "p1",
        reference: "OG42-ABC1234567",
        gatewayReference: "SEERBIT123",
        checkoutMode: "INLINE",
        amount: "22950",
        fee: "150",
        status: "FAILED",
        gatewayCode: "SM_51",
        gatewayMessage: "Not sufficient funds",
        channel: "CARD",
        paidAt: null,
        createdAt: new Date().toISOString()
    };

    it("says so when there are no card payments", () => {
        render(<OrderPaymentsCard payments={[]} />);
        expect(screen.getByText("No card payments on this order.")).toBeTruthy();
    });

    it("lists each attempt with its reference, status and gateway response", () => {
        render(<OrderPaymentsCard payments={[payment]} />);
        expect(screen.getByText("OG42-ABC1234567")).toBeTruthy();
        expect(screen.getByText("FAILED")).toBeTruthy();
        expect(screen.getByText(/SM_51 – Not sufficient funds/)).toBeTruthy();
    });
});