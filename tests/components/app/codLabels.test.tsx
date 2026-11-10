import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderProgress } from "@/components/app/account/OrderProgress";
import { OrderStatusPill } from "@/components/app/account/OrderStatusPill";
import { OrderCard } from "@/components/app/account/OrderCard";
import type { CustomerOrder } from "@/lib/api";

function makeOrder(overrides: Partial<CustomerOrder> = {}): CustomerOrder {
    return {
        id: "o1",
        reference: "OG-000042",
        status: "PENDING_PAYMENT",
        step: 1,
        paymentMethod: "COD",
        total: 22500,
        trackingNumber: null,
        shippingAddress: null,
        createdAt: "2026-10-27T10:00:00.000Z",
        items: [
            {
                id: "i1",
                productId: "p1",
                name: "Indomie Noodle",
                unitLabel: "70g x 40",
                image: null,
                pricingType: "carton",
                unitPrice: 21000,
                quantity: 1
            }
        ],
        ...overrides
    };
}

describe("cash on delivery wording", () => {
    it("shows a COD order as awaiting confirmation, not awaiting payment", () => {
        render(<OrderStatusPill status="PENDING_PAYMENT" paymentMethod="COD" />);
        expect(screen.getByText("Awaiting Confirmation")).toBeTruthy();
        expect(screen.queryByText("Awaiting Payment")).toBeNull();
    });

    it("shows a card order as awaiting payment", () => {
        render(<OrderStatusPill status="PENDING_PAYMENT" paymentMethod="CARD" />);
        expect(screen.getByText("Awaiting Payment")).toBeTruthy();
    });

    it("labels the second tracker step as a confirmation for COD", () => {
        render(<OrderProgress step={2} paymentMethod="COD" />);
        expect(screen.getByText("Order confirmed")).toBeTruthy();
        expect(screen.queryByText("Payment confirmed")).toBeNull();
    });

    it("keeps the payment step for card orders", () => {
        render(<OrderProgress step={2} paymentMethod="CARD" />);
        expect(screen.getByText("Payment confirmed")).toBeTruthy();
    });

    it("uses the order's own payment method on the account order card", () => {
        render(<OrderCard order={makeOrder({ status: "UNFULFILLED", step: 2 })} />);

        expect(screen.getByText("Order Confirmed")).toBeTruthy();
        expect(screen.getByText("Order confirmed")).toBeTruthy();
        expect(screen.queryByText("Payment Confirmed")).toBeNull();
    });
});
