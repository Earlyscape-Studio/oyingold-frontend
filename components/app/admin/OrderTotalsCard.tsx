import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNairaExact } from "@/lib/format";
import type { Order } from "@/lib/api";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between text-sm ${strong ? "border-t pt-2 font-semibold" : ""}`}>
            <span className={strong ? undefined : "text-muted-foreground"}>{label}</span>
            <span>{value}</span>
        </div>
    );
}

export function OrderTotalsCard({ order }: { order: Order }) {
    const paymentFee = Number(order.paymentFee);
    const discount = Number(order.discount);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Payment summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Row
                    label="Payment method"
                    value={order.paymentMethod === "COD" ? "Cash on delivery" : "Debit/Credit card"}
                />
                <Row label="Sub-total" value={formatNairaExact(order.subtotal)} />
                <Row label="Shipping" value={formatNairaExact(order.shippingFee)} />
                {paymentFee > 0 && (
                    <Row label="Card processing fee" value={formatNairaExact(paymentFee)} />
                )}
                {discount > 0 && <Row label="Discount" value={`-${formatNairaExact(discount)}`} />}
                <Row label="Total" value={formatNairaExact(order.totalAmount)} strong />
            </CardContent>
        </Card>
    );
}
