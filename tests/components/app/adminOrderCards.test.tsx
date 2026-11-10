import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderDeliveryCard } from "@/components/app/admin/OrderDeliveryCard";
import { OrderTotalsCard } from "@/components/app/admin/OrderTotalsCard";
import { OrderPaymentsCard } from "@/components/app/admin/OrderPaymentsCard";
import type { Order } from "@/lib/api";

function makeOrder(overrides: Partial<Order> = {}): Order {
    return {
        id: "o1",
        status: "PENDING_PAYMENT",
        totalAmount: "22950",
        trackingNumber: null,
        createdAt: "2026-10-27T10:00:00.000Z",
        updatedAt: "2026-10-27T10:00:00.000Z",
        needsAttention: false,
        needsAttentionReason: null,
        paymentMethod: "CARD",
        subtotal: "21000",
        shippingFee: "1500",
        paymentFee: "450",
        discount: "0",
        contactEmail: "ada@example.com",
        contactPhone: "+234 812 3456 789",
        companyName: "Ada Stores",
        notes: "Call when you reach the gate",
        shippingAddress: {
            fullName: "Ada Nwosu",
            phone: "08031234567",
            street: "25 City Drive",
            city: "Victoria Island",
            state: "Lagos",
            country: "Nigeria",
            zipCode: "101241"
        },
        user: { id: "u1", email: "account@example.com" },
        items: [],
        ...overrides
    };
}

describe("OrderDeliveryCard", () => {
    it("shows who and where to deliver, how to reach them, and the notes", () => {
        render(<OrderDeliveryCard order={makeOrder()} />);

        expect(screen.getByText("Ada Nwosu")).toBeTruthy();
        expect(screen.getByText("08031234567")).toBeTruthy();
        expect(screen.getByText("25 City Drive")).toBeTruthy();
        expect(screen.getByText("Victoria Island, Lagos, 101241")).toBeTruthy();
        expect(screen.getByText("Nigeria")).toBeTruthy();
        expect(screen.getByText("ada@example.com")).toBeTruthy();
        expect(screen.getByText("Ada Stores")).toBeTruthy();
        expect(screen.getByText("Call when you reach the gate")).toBeTruthy();
    });

    it("leaves out the zip code when there isn't one", () => {
        const base = makeOrder();
        render(
            <OrderDeliveryCard
                order={makeOrder({
                    shippingAddress: { ...base.shippingAddress!, zipCode: undefined }
                })}
            />
        );

        expect(screen.getByText("Victoria Island, Lagos")).toBeTruthy();
    });

    it("falls back to the account email and says so when there is no recorded address", () => {
        render(
            <OrderDeliveryCard
                order={makeOrder({
                    shippingAddress: null,
                    contactEmail: null,
                    contactPhone: null,
                    companyName: null,
                    notes: null
                })}
            />
        );

        expect(screen.getByText("No delivery address was recorded for this order.")).toBeTruthy();
        expect(screen.getByText("account@example.com")).toBeTruthy();
        expect(screen.queryByText("Order notes")).toBeNull();
    });
});

describe("OrderTotalsCard", () => {
    it("breaks a card order's total down, including the processing fee", () => {
        render(<OrderTotalsCard order={makeOrder()} />);

        expect(screen.getByText("Debit/Credit card")).toBeTruthy();
        expect(screen.getByText("₦21,000")).toBeTruthy();
        expect(screen.getByText("₦1,500")).toBeTruthy();
        expect(screen.getByText("Card processing fee")).toBeTruthy();
        expect(screen.getByText("₦450")).toBeTruthy();
        expect(screen.getByText("₦22,950")).toBeTruthy();
    });

    it("hides the fee and discount lines when they are zero, and names cash on delivery", () => {
        render(
            <OrderTotalsCard
                order={makeOrder({ paymentMethod: "COD", paymentFee: "0", totalAmount: "22500" })}
            />
        );

        expect(screen.getByText("Cash on delivery")).toBeTruthy();
        expect(screen.queryByText("Card processing fee")).toBeNull();
        expect(screen.queryByText("Discount")).toBeNull();
        expect(screen.getByText("₦22,500")).toBeTruthy();
    });
});

describe("OrderPaymentsCard", () => {
    it("explains that cash on delivery has no online payments", () => {
        render(<OrderPaymentsCard payments={[]} paymentMethod="COD" />);
        expect(screen.getByText(/collected when the order is delivered/)).toBeTruthy();
    });

    it("says there are no card payments for a card order without attempts", () => {
        render(<OrderPaymentsCard payments={[]} paymentMethod="CARD" />);
        expect(screen.getByText("No card payments on this order.")).toBeTruthy();
    });
});
