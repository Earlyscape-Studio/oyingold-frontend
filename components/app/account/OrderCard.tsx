import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { OrderProgress } from "@/components/app/account/OrderProgress";
import { OrderStatusPill } from "@/components/app/account/OrderStatusPill";
import { formatNaira, formatOrderDate } from "@/lib/format";
import type { CustomerOrder } from "@/lib/api";

export function OrderCard({ order }: { order: CustomerOrder }) {
    return (
        <article className="overflow-hidden rounded-3xl border bg-card">
            <header className="m-3 mb-0 grid grid-cols-2 items-center gap-4 rounded-xl bg-muted/60 px-5 py-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="mt-1 font-semibold text-foreground">{order.reference}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="mt-1 font-medium text-muted-foreground">
                        {formatOrderDate(order.createdAt)}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="mt-1 font-semibold text-blue-950">{formatNaira(order.total)}</p>
                </div>
                <OrderStatusPill status={order.status} className="justify-self-start sm:justify-self-end" />
            </header>

            <ul className="divide-y px-6">
                {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 py-5">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-1"
                                    sizes="56px"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <HugeiconsIcon icon={Image01Icon} size={20} />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">{item.name}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Qty: {item.quantity} · {item.pricingType}
                            </p>
                        </div>

                        <p className="shrink-0 font-medium text-foreground">
                            {formatNaira(item.unitPrice * item.quantity)}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="px-6 pt-2 pb-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base text-muted-foreground">Order Progress</h3>
                    {order.trackingNumber && (
                        <p className="text-xs text-muted-foreground">
                            Tracking no: <span className="font-medium text-foreground">{order.trackingNumber}</span>
                        </p>
                    )}
                </div>

                {order.step === null ? (
                    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                        This order was cancelled.
                    </p>
                ) : (
                    <OrderProgress step={order.step} />
                )}
            </div>
        </article>
    );
}