"use client";



import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { getOrders, type Order, type OrderStatus } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableHead,
    TableBody,
    TableHeader,
    TableRow,
    TableCell
} from "@/components/ui/table";


const STATUS_OPTIONS: OrderStatus[] = [
    "PENDING_PAYMENT",
    "UNFULFILLED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
];


export default function AmdinOrdersPage() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let cancelled = false;



        async function load() {
            setOrders(null);
            setError(null);


            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;
            if (!accessToken) return;




            try {
                const result = await getOrders(
                    accessToken,
                    statusFilter === "ALL" ? undefined : statusFilter
                );

                if (!cancelled) setOrders(result);
            } catch {
                if (!cancelled) setError("Couldn't load orders.");
            }
        }

        load();


        return () => {
            cancelled = true;
        };
    }, [statusFilter]);


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Orders</h1>

                <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as OrderStatus | "ALL")}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </p>
            )}

            {!orders && !error ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : orders && orders.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No orders match this filter.
                </p>
            ) : orders ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Placed</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {order.user.email}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {order.items.length}
                                    </TableCell>
                                    <TableCell>{formatNaira(order.totalAmount)}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{order.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : null}
        </div>
    );
}





