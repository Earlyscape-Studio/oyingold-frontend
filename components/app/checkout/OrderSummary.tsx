"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira, formatNairaExact } from "@/lib/format";
import { getCartItemUnitPrice, type Cart } from "@/lib/api";
import type { Totals } from "@/lib/checkout-api";

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className={strong ? "font-medium text-blue-950" : "text-muted-foreground"}>{label}</span>
            <span className={strong ? "text-base font-semibold text-blue-950" : "text-blue-950"}>{value}</span>
        </div>
    );
}

export function OrderSummary({
    cart,
    totals,
    totalsLoading,
    totalsError,
    submitting,
    onRetryTotals
}: {
    cart: Cart;
    totals: Totals | null;
    totalsLoading: boolean;
    totalsError: string | null;
    submitting: boolean;
    onRetryTotals: () => void;
}) {
    const placeOrderDisabled = submitting || totalsLoading || !totals;

    return (
        <aside className="h-fit rounded-lg border p-5">
            <h2 className="text-base font-semibold text-blue-950">Order Summary</h2>

            <ul className="mt-5 space-y-4">
                {cart.items.map((item) => {
                    const product = item.productVariant.product;
                    const image = product.images[0];

                    return (
                        <li key={item.id} className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                {image ? (
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-1"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <HugeiconsIcon icon={Image01Icon} size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 text-sm">
                                <p className="truncate text-blue-950">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.quantity} x{" "}
                                    <span className="font-medium text-blue-950">
                                        {formatNaira(getCartItemUnitPrice(item))}
                                    </span>
                                    <span className="ml-1">({item.pricingType})</span>
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-5 space-y-3 border-t pt-5">
                {totalsError ? (
                    <div className="space-y-2 text-sm">
                        <p className="text-destructive">{totalsError}</p>
                        <Button type="button" variant="outline" size="sm" onClick={onRetryTotals}>
                            Try again
                        </Button>
                    </div>
                ) : totalsLoading || !totals ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                ) : (
                    <>
                        <Row label="Sub-total" value={formatNairaExact(totals.subtotal)} />
                        <Row label="Shipping" value={formatNairaExact(totals.shippingFee)} />
                        {totals.paymentFee > 0 && (
                            <Row label="Card processing fee" value={formatNairaExact(totals.paymentFee)} />
                        )}
                        {totals.discount > 0 && (
                            <Row label="Discount" value={`-${formatNairaExact(totals.discount)}`} />
                        )}
                        <div className="border-t pt-3">
                            <Row label="Total" value={formatNairaExact(totals.total)} strong />
                        </div>
                    </>
                )}
            </div>

            <Button
                type="submit"
                disabled={placeOrderDisabled}
                className="mt-6 h-12 w-full bg-red-600 text-sm font-semibold uppercase text-white hover:bg-red-700"
            >
                {submitting ? "Placing order…" : "Place order"}
                {!submitting && <HugeiconsIcon icon={ArrowRight01Icon} size={18} />}
            </Button>
        </aside>
    );
}