import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/lib/api";

function Line({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

// Where the order goes and who to call, as captured at checkout.
export function OrderDeliveryCard({ order }: { order: Order }) {
    const address = order.shippingAddress;
    const email = order.contactEmail ?? order.user.email;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Delivery</CardTitle>
            </CardHeader>
            <CardContent>
                {address ? (
                    <dl className="space-y-2.5">
                        <Line label="Deliver to">{address.fullName}</Line>
                        <Line label="Phone">{address.phone}</Line>
                        <Line label="Address">
                            <address className="not-italic">
                                <span className="block">{address.street}</span>
                                <span className="block">
                                    {[address.city, address.state, address.zipCode]
                                        .filter(Boolean)
                                        .join(", ")}
                                </span>
                                <span className="block">{address.country}</span>
                            </address>
                        </Line>
                    </dl>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No delivery address was recorded for this order.
                    </p>
                )}

                <dl className="mt-2.5 space-y-2.5 border-t pt-3">
                    <Line label="Email">{email}</Line>
                    {order.contactPhone && <Line label="Contact phone">{order.contactPhone}</Line>}
                    {order.companyName && <Line label="Company">{order.companyName}</Line>}
                    {order.notes && (
                        <Line label="Order notes">
                            <span className="whitespace-pre-wrap">{order.notes}</span>
                        </Line>
                    )}
                </dl>
            </CardContent>
        </Card>
    );
}
