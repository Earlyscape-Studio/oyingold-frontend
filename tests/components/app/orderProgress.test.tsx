import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderProgress } from "@/components/app/account/OrderProgress";
import { OrderCard } from "@/components/app/account/OrderCard";
import type { CustomerOrder } from "@/lib/api";

function makeOrder(overrides: Partial<CustomerOrder> = {}): CustomerOrder {
    return {
        id: "o1",
        reference: "OG-000042",
        status: "PENDING_PAYMENT",
        step: 1,
        total: 7000,
        trackingNumber: null,
        shippingAddress: null,
        createdAt: "2026-07-06T10:00:00.000Z",
        items: [
            {
                id: "i1",
                productId: "p1",
                name: "Indomie Noodle - Jollof Flavor",
                unitLabel: "70g x 40",
                image: null,
                pricingType: "piece",
                unitPrice: 3500,
                quantity: 2,
            },
        ],
        ...overrides,
    };
}

describe("OrderProgress", () => {
    it("renders all five steps and marks the current one", () => {
        render(<OrderProgress step={3} />);

        expect(screen.getAllByRole("listitem")).toHaveLength(5);
        expect(screen.getByText("Processing").closest("li")).toHaveAttribute("aria-current", "step");
        expect(screen.getByText("Shipped").closest("li")).not.toHaveAttribute("aria-current");
    });
});

describe("OrderCard", () => {
    it("shows reference, date, total, status and line total", () => {
        render(<OrderCard order={makeOrder()} />);

        expect(screen.getByText("OG-000042")).toBeInTheDocument();
        expect(screen.getByText("6 Jul 2026")).toBeInTheDocument();
        expect(screen.getByText("Awaiting Payment")).toBeInTheDocument();
        expect(screen.getByText("Indomie Noodle - Jollof Flavor")).toBeInTheDocument();
        expect(screen.getByText(/Qty: 2/)).toBeInTheDocument();
        // order total and the single line total are both ₦7,000
        expect(screen.getAllByText(/7,000/)).toHaveLength(2);
    });

    it("shows the tracking number when present", () => {
        render(<OrderCard order={makeOrder({ status: "SHIPPED", step: 4, trackingNumber: "TRK-1003" })} />);
        expect(screen.getByText("TRK-1003")).toBeInTheDocument();
    });

    it("replaces the tracker with a notice for cancelled orders", () => {
        render(<OrderCard order={makeOrder({ status: "CANCELLED", step: null })} />);

        expect(screen.getByText("This order was cancelled.")).toBeInTheDocument();
        expect(screen.queryByRole("list", { name: "Order progress" })).not.toBeInTheDocument();
    });
});