"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import {
    createPaymentAttempt,
    verifyPayment,
    type PaymentVerification
} from "@/lib/checkout-api";
import { startCardPayment } from "@/lib/payment-flow";

// After the popup or the hosted page, the gateway can take a moment to settle.
// Check a few times before asking the customer to check again themselves.
const MAX_AUTO_CHECKS = 5;
const CHECK_INTERVAL_MS = 3000;

type View =
    | { kind: "checking" }
    | { kind: "paid"; result: PaymentVerification }
    | { kind: "pending"; result: PaymentVerification }
    | { kind: "failed"; result: PaymentVerification }
    | { kind: "error"; message: string; notFound: boolean };

function Panel({
    title,
    children,
    tone = "neutral"
}: {
    title: string;
    children: React.ReactNode;
    tone?: "neutral" | "success" | "danger";
}) {
    const toneClass =
        tone === "success"
            ? "text-green-700"
            : tone === "danger"
              ? "text-destructive"
              : "text-blue-950";

    return (
        <div className="mx-auto max-w-lg rounded-lg border px-6 py-12 text-center">
            <h2 className={`text-xl font-semibold ${toneClass}`}>{title}</h2>
            <div className="mt-3 space-y-4 text-sm text-muted-foreground">{children}</div>
        </div>
    );
}

export function PaymentResultClient({ reference }: { reference: string | null }) {
    const router = useRouter();
    const { session, loading: authLoading, isLoggedIn, setAuthMenuOpen } = useAuth();
    const { refreshCart } = useCart();

    const [view, setView] = useState<View>({ kind: "checking" });
    const [retrying, setRetrying] = useState(false);
    const [checkRound, setCheckRound] = useState(0);
    const accessToken = session?.access_token;
    const cartRefreshed = useRef(false);

    // Checks the payment now, and again a few times while it is still pending.
    useEffect(() => {
        if (!reference || !accessToken) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        async function check(attempt: number) {
            const outcome = await verifyPayment(reference as string, accessToken as string);
            if (cancelled) return;

            if (!outcome.ok) {
                setView({
                    kind: "error",
                    message: outcome.error,
                    notFound: outcome.notFound === true
                });
                return;
            }

            const { result } = outcome;

            if (result.paymentStatus === "PAID") {
                setView({ kind: "paid", result });
                if (!cartRefreshed.current) {
                    cartRefreshed.current = true;
                    void refreshCart();
                }
                return;
            }

            if (result.paymentStatus === "FAILED") {
                setView({ kind: "failed", result });
                return;
            }

            if (attempt + 1 < MAX_AUTO_CHECKS) {
                setView({ kind: "checking" });
                timer = setTimeout(() => check(attempt + 1), CHECK_INTERVAL_MS);
                return;
            }

            setView({ kind: "pending", result });
        }

        setView({ kind: "checking" });
        void check(0);

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [reference, accessToken, checkRound, refreshCart]);

    const checkAgain = useCallback(() => setCheckRound((n) => n + 1), []);

    // A new attempt for the same unpaid order, with its own reference.
    async function payAgain(orderId: string) {
        if (!accessToken || retrying) return;
        setRetrying(true);

        const attempt = await createPaymentAttempt(orderId, "INLINE", accessToken);
        if (!attempt.ok) {
            toast.error(attempt.error);
            setRetrying(false);
            return;
        }

        const started = await startCardPayment({
            reference: attempt.payment.reference,
            orderId,
            accessToken,
            onFinished: (ref) => {
                router.replace(`/checkout/complete?reference=${encodeURIComponent(ref)}`);
                setRetrying(false);
            }
        });

        if (!started.ok) {
            toast.error(started.error);
            setRetrying(false);
        }
    }

    if (!reference) {
        return (
            <Panel title="We couldn't find that payment">
                <p>The link is missing its payment reference.</p>
                <Button asChild>
                    <Link href="/account">View my orders</Link>
                </Button>
            </Panel>
        );
    }

    if (authLoading) {
        return <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>;
    }

    if (!isLoggedIn) {
        return (
            <Panel title="Please log in">
                <p>Log in to see the result of your payment.</p>
                <Button onClick={() => setAuthMenuOpen(true)}>Log in</Button>
            </Panel>
        );
    }

    switch (view.kind) {
        case "checking":
            return (
                <Panel title="Confirming your payment…">
                    <p>This only takes a moment. Please don&apos;t close this page or pay again.</p>
                </Panel>
            );

        case "paid":
            return (
                <Panel title="Payment received. Thank you!" tone="success">
                    <p>
                        {view.result.order
                            ? `Your order ${view.result.order.reference} is confirmed and we're getting it ready.`
                            : "Your order is confirmed and we're getting it ready."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button asChild>
                            <Link href="/account">View my orders</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/products">Continue shopping</Link>
                        </Button>
                    </div>
                </Panel>
            );

        case "failed": {
            const order = view.result.order;
            return (
                <Panel title="Your payment didn't go through" tone="danger">
                    <p>
                        {view.result.message ??
                            "The payment was declined or cancelled. You haven't been charged for this order."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {order && order.status === "PENDING_PAYMENT" && (
                            <Button disabled={retrying} onClick={() => payAgain(order.id)}>
                                {retrying ? "Opening payment…" : "Try again"}
                            </Button>
                        )}
                        <Button asChild variant="outline">
                            <Link href="/cart">Back to cart</Link>
                        </Button>
                    </div>
                </Panel>
            );
        }

        case "pending": {
            const order = view.result.order;
            return (
                <Panel title="We haven't received your payment yet">
                    <p>
                        If you completed the payment, it can take a few minutes to arrive. Check again
                        shortly, and please don&apos;t pay twice.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button onClick={checkAgain}>Check again</Button>
                        <Button asChild variant="outline">
                            <Link href="/account">View my orders</Link>
                        </Button>
                    </div>
                    {order && order.status === "PENDING_PAYMENT" && (
                        <p className="text-xs">
                            Didn&apos;t finish paying?{" "}
                            <button
                                type="button"
                                className="underline disabled:opacity-60"
                                disabled={retrying}
                                onClick={() => payAgain(order.id)}
                            >
                                Start the payment again
                            </button>
                        </p>
                    )}
                </Panel>
            );
        }

        case "error":
            return (
                <Panel
                    title={view.notFound ? "We couldn't find that payment" : "We couldn't check your payment"}
                    tone="danger"
                >
                    <p>{view.message}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {!view.notFound && <Button onClick={checkAgain}>Check again</Button>}
                        <Button asChild variant="outline">
                            <Link href="/account">View my orders</Link>
                        </Button>
                    </div>
                </Panel>
            );
    }
}