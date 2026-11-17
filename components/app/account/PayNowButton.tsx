"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    CARD_PAYMENTS_ENABLED,
    createPaymentAttempt
} from "@/lib/checkout-api";
import { startCardPayment } from "@/lib/payment-flow";
import type { CustomerOrder } from "@/lib/api";

/** An order that is waiting on a card payment the customer can still make. */
export function canPayNow(order: Pick<CustomerOrder, "status" | "paymentMethod">): boolean {
    return order.paymentMethod === "CARD" && order.status === "PENDING_PAYMENT";
}

export function PayNowButton({
    orderId,
    accessToken
}: {
    orderId: string;
    accessToken: string;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    if (!CARD_PAYMENTS_ENABLED) return null;

    async function handleClick() {
        if (busy) return;
        setBusy(true);

        // Every payment attempt needs its own reference, so a retry never reuses an old one.
        const attempt = await createPaymentAttempt(orderId, "INLINE", accessToken);
        if (!attempt.ok) {
            toast.error(attempt.error);
            setBusy(false);
            return;
        }

        const started = await startCardPayment({
            reference: attempt.payment.reference,
            orderId,
            accessToken,
            // The popup closing doesn't mean the payment worked: the result page asks the server.
            onFinished: (reference) => {
                router.push(`/checkout/complete?reference=${encodeURIComponent(reference)}`);
            }
        });

        if (!started.ok) {
            toast.error(started.error);
            setBusy(false);
        }
    }

    return (
        <Button type="button" size="sm" disabled={busy} onClick={handleClick}>
            {busy ? "Opening payment…" : "Pay now"}
        </Button>
    );
}