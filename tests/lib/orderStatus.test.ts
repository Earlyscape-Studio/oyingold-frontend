import { describe, it, expect } from "vitest";
import {
    ORDER_STEPS,
    getOrderStatusMeta,
    getOrderSteps
} from "@/lib/order-status";

describe("getOrderStatusMeta", () => {
    it("keeps the payment wording for card orders", () => {
        expect(getOrderStatusMeta("PENDING_PAYMENT", "CARD").label).toBe("Awaiting Payment");
        expect(getOrderStatusMeta("UNFULFILLED", "CARD").label).toBe("Payment Confirmed");
    });

    it("keeps the payment wording when the method isn't known", () => {
        expect(getOrderStatusMeta("UNFULFILLED").label).toBe("Payment Confirmed");
    });

    it("words cash on delivery as a confirmation, since nothing is paid online", () => {
        expect(getOrderStatusMeta("PENDING_PAYMENT", "COD").label).toBe("Awaiting Confirmation");
        expect(getOrderStatusMeta("UNFULFILLED", "COD").label).toBe("Order Confirmed");
    });

    it("leaves the later statuses the same for both", () => {
        for (const status of ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const) {
            expect(getOrderStatusMeta(status, "COD").label).toBe(
                getOrderStatusMeta(status, "CARD").label
            );
        }
    });

    it("keeps the colours when the label changes", () => {
        expect(getOrderStatusMeta("UNFULFILLED", "COD").className).toBe(
            getOrderStatusMeta("UNFULFILLED", "CARD").className
        );
    });
});

describe("getOrderSteps", () => {
    it("is the card tracker by default", () => {
        expect(getOrderSteps()).toEqual(ORDER_STEPS);
        expect(getOrderSteps("CARD")).toEqual(ORDER_STEPS);
    });

    it("swaps only the second step for cash on delivery", () => {
        const cod = getOrderSteps("COD");

        expect(cod).toHaveLength(5);
        expect(cod[1]).toBe("Order confirmed");
        expect([cod[0], cod[2], cod[3], cod[4]]).toEqual([
            ORDER_STEPS[0],
            ORDER_STEPS[2],
            ORDER_STEPS[3],
            ORDER_STEPS[4]
        ]);
    });
});
