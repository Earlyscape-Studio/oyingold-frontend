import { cn } from "@/lib/utils";
import { getOrderStatusMeta, type PaymentMethod } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/api";

export function OrderStatusPill({
    status,
    paymentMethod,
    className,
}: {
    status: OrderStatus;
    paymentMethod?: PaymentMethod;
    className?: string;
}) {
    const meta = getOrderStatusMeta(status, paymentMethod);

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap",
                meta.className,
                className
            )}
        >
            {meta.label}
        </span>
    );
}