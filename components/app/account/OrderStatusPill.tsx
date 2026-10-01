import { cn } from "@/lib/utils";
import { ORDER_STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/api";

export function OrderStatusPill({
    status,
    className,
}: {
    status: OrderStatus;
    className?: string;
}) {
    const meta = ORDER_STATUS_META[status];

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