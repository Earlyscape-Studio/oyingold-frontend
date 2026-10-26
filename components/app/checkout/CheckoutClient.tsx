"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getMyAddresses } from "@/lib/api";
import {
    CARD_PAYMENTS_ENABLED,
    createOrder,
    getCheckoutQuote,
    type CheckoutQuotes,
    type StockShortage
} from "@/lib/checkout-api";
import {
    EMPTY_FORM,
    buildCheckoutPayload,
    firstInvalidField,
    getDeliveryState,
    splitFullName,
    validateCheckoutForm,
    type CheckoutFormValues,
    type FieldErrors
} from "@/lib/checkout-form";
import { isNigerianState } from "@/lib/nigeria-states";
import { BillingFields } from "./BillingFields";
import { Field } from "./Field";
import { OrderSummary } from "./OrderSummary";
import { PaymentOptions } from "./PaymentOptions";

function describeShortages(shortages: StockShortage[]): string {
    return shortages
        .map((s) =>
            s.available !== undefined && s.requested !== undefined
                ? `${s.name} (you need ${s.requested}, only ${s.available} left)`
                : s.name
        )
        .join(", ");
}

function Notice({ children }: { children: React.ReactNode }) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{children}</p>;
}

export function CheckoutClient() {
    const router = useRouter();
    const { session, user, loading: authLoading, isLoggedIn, setAuthMenuOpen } = useAuth();
    const { cart, loading: cartLoading, error: cartError, refreshCart } = useCart();

    const [values, setValues] = useState<CheckoutFormValues>({
        ...EMPTY_FORM,
        paymentMethod: CARD_PAYMENTS_ENABLED ? "CARD" : "COD"
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [placedReference, setPlacedReference] = useState<string | null>(null);
    const submittingRef = useRef(false);

    const [quotes, setQuotes] = useState<CheckoutQuotes | null>(null);
    const [quotesLoading, setQuotesLoading] = useState(false);
    const [quotesError, setQuotesError] = useState<string | null>(null);
    const [quoteRetry, setQuoteRetry] = useState(0);

    const prefilled = useRef(false);
    const accessToken = session?.access_token;
    const deliveryState = getDeliveryState(values);
    const hasItems = !!cart && cart.items.length > 0;

    function update(patch: Partial<CheckoutFormValues>) {
        setValues((prev) => ({ ...prev, ...patch }));
        // Clear the message for any field being edited.
        setErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(patch) as (keyof CheckoutFormValues)[]) delete next[key];
            return next;
        });
    }

    // Prefill once from the account and the last-used saved address. Only empty
    // fields are filled, so nothing the customer has typed is overwritten.
    useEffect(() => {
        if (!accessToken || !user || prefilled.current) return;
        prefilled.current = true;

        const name = splitFullName(user.fullName);
        setValues((prev) => ({
            ...prev,
            firstName: prev.firstName || name.firstName,
            lastName: prev.lastName || name.lastName,
            email: prev.email || user.email,
            phone: prev.phone || user.phone || ""
        }));

        getMyAddresses(accessToken)
            .then((addresses) => {
                if (addresses.length === 0) {
                    // First address: offer to remember it. With saved addresses we
                    // don't, so repeat orders don't pile up duplicates.
                    setValues((prev) => ({ ...prev, saveAddress: true }));
                    return;
                }

                const address =
                    addresses.find((a) => a.isLastUsed) ??
                    addresses.find((a) => a.isDefault) ??
                    addresses[0];
                const addressName = splitFullName(address.fullName);

                setValues((prev) => ({
                    ...prev,
                    firstName: prev.firstName || addressName.firstName,
                    lastName: prev.lastName || addressName.lastName,
                    phone: prev.phone || address.phone,
                    address: prev.address || address.street,
                    city: prev.city || address.city,
                    state: prev.state || (isNigerianState(address.state) ? address.state : "")
                }));
            })
            .catch(() => {
                // Prefill is a convenience; a failure just leaves the form empty.
            });
    }, [accessToken, user]);

    // Shipping depends on where the order goes, so totals are re-quoted when the
    // delivery state or the cart changes. Both payment methods come back at once.
    useEffect(() => {
        if (!accessToken || !hasItems) return;

        let cancelled = false;
        setQuotesLoading(true);
        setQuotesError(null);

        getCheckoutQuote(deliveryState, accessToken).then((result) => {
            if (cancelled) return;
            setQuotesLoading(false);
            if (result.ok) setQuotes(result.quotes);
            else setQuotesError(result.error);
        });

        return () => {
            cancelled = true;
        };
    }, [accessToken, hasItems, cart, deliveryState, quoteRetry]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (submittingRef.current || !accessToken) return;

        const found = validateCheckoutForm(values);
        setErrors(found);

        const firstInvalid = firstInvalidField(found);
        if (firstInvalid) {
            const el = document.getElementById(`field-${firstInvalid}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            el?.focus();
            return;
        }

        if (values.paymentMethod === "CARD" && !CARD_PAYMENTS_ENABLED) {
            toast.info("Card payments are coming soon. Please choose Cash on Delivery.");
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);

        const result = await createOrder(buildCheckoutPayload(values), accessToken);

        if (!result.ok) {
            submittingRef.current = false;
            setSubmitting(false);

            if (result.shortages?.length) {
                toast.error(result.error, { description: describeShortages(result.shortages) });
                await refreshCart();
            } else {
                toast.error(result.error);
            }
            return;
        }

        // Cash on delivery: the order is placed. (Card orders continue to
        // payment once that step exists.) The submit stays locked until the
        // page changes so a second click can't place another order.
        setPlacedReference(result.order.reference);
        toast.success(`Order ${result.order.reference} placed`);
        router.push("/account");
        void refreshCart();
    }

    if (placedReference) {
        return (
            <div className="py-16 text-center">
                <p className="text-lg font-semibold text-blue-950">Thank you! Your order is placed.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Order {placedReference}. Taking you to your orders…
                </p>
            </div>
        );
    }

    if (authLoading || (isLoggedIn && cartLoading)) return <Notice>Loading checkout…</Notice>;

    if (!isLoggedIn) {
        return (
            <div className="rounded-lg border py-16 text-center">
                <p className="text-sm text-muted-foreground">Please log in to check out.</p>
                <Button className="mt-4" onClick={() => setAuthMenuOpen(true)}>
                    Log in
                </Button>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="rounded-lg border py-16 text-center">
                <p className="text-sm text-destructive">{cartError}</p>
                <Button variant="outline" className="mt-4" onClick={() => refreshCart()}>
                    Try again
                </Button>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="rounded-lg border py-16 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Button asChild className="mt-4">
                    <Link href="/products">Return To Shop</Link>
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
        >
            <div className="space-y-10">
                <section>
                    <h2 className="mb-5 text-lg font-medium text-blue-950">Billing Information</h2>
                    <BillingFields
                        values={values}
                        errors={errors}
                        disabled={submitting}
                        onChange={update}
                    />
                </section>

                <section>
                    <h2 className="mb-5 text-lg font-medium text-blue-950">Payment Option</h2>
                    <PaymentOptions
                        value={values.paymentMethod}
                        disabled={submitting}
                        onChange={(paymentMethod) => update({ paymentMethod })}
                    />
                </section>

                <section>
                    <h2 className="mb-5 text-lg font-medium text-blue-950">Additional Information</h2>
                    <Field name="notes" label="Order Notes " optional error={errors.notes}>
                        <Textarea
                            id="field-notes"
                            value={values.notes}
                            disabled={submitting}
                            onChange={(e) => update({ notes: e.target.value })}
                            placeholder="Notes about your order, e.g. special notes for delivery"
                            rows={4}
                            aria-invalid={!!errors.notes}
                            aria-describedby={errors.notes ? "field-notes-error" : undefined}
                        />
                    </Field>
                </section>
            </div>

            <OrderSummary
                cart={cart}
                totals={quotes?.[values.paymentMethod] ?? null}
                totalsLoading={quotesLoading}
                totalsError={quotesError}
                submitting={submitting}
                onRetryTotals={() => setQuoteRetry((n) => n + 1)}
            />
        </form>
    );
}