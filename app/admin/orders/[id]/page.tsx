import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { getOrder, type Order } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableHead,
    TableBody,
    TableHeader,
    TableRow,
    TableCell
} from "@/components/ui/table";
import { OrderStatusForm } from "@/components/app/admin/OrderStatusForm";


export default function AdminOrderDetailPage() {

    const params = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;


        async function load() {
            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;

            if (!accessToken) return;

            try {
                const result = await getOrder(
                    params.id,
                    accessToken,
                );
                if (!cancelled) setOrder(result);
            } catch {
                if (!cancelled) setError("Couldn't load this order.");
            }
        }


        load();


        return () => {
            cancelled = true;
        };
    }, [params.id]);


    if (error) {
        return (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
            </p>
        );
    }

    if (order === undefined) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (order === null) {
        return (
            <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                Order not found.
            </p>
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {order.user.email} · placed {new Date(order.createdAt).toLocaleString()}
                </p>
            </div>

            <OrderStatusForm order={order} />

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Pricing</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead className="text-right">Line total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.productVariant.product.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.productVariant.unitLabel}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.pricingType === "CARTON" ? "Carton" : "Piece"}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        {formatNaira(
                                            Number(item.unitPrice) * item.quantity
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex justify-end text-sm font-semibold">
                        Total: {formatNaira(order.totalAmount)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}