"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { getDashboardStats, type DashboardStats } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"



export default function AdminDashboardPage() {

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);



    useEffect(() => {
        let cancelled = false;

        async function load() {
            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;



            if (!accessToken) return;

            try {
                const result = await getDashboardStats(accessToken);
                if (!cancelled) setStats(result);
            } catch {
                if (!cancelled) setError("Couldn't load dashboard stats.");
            }
        }



        load();

        return () => {
            cancelled = true;
        };
    }, []);


    if (error) {
        return (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
            </p>
        );
    }

    if (!stats) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">{stats.note}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Sales today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">
                            {formatNaira(stats.sales.today)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stats.sales.todayOrderCount} orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Sales this month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">
                            {formatNaira(stats.sales.month)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {stats.sales.monthOrderCount} orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Avg order value (month)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">
                            {formatNaira(stats.sales.averageOrderValueMonth)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Low stock items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold">
                            {stats.lowStockVariants.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Recent orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No orders yet.</p>
                        ) : (
                            <ul className="divide-y">
                                {stats.recentOrders.map((order) => (
                                    <li
                                        key={order.id}
                                        className="flex items-center justify-between py-2 text-sm"
                                    >
                                        <div>
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {order.user.email}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>{formatNaira(order.totalAmount)}</span>
                                            <Badge variant="secondary">{order.status}</Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Low stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.lowStockVariants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nothing is running low.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {stats.lowStockVariants.map((v) => (
                                    <li
                                        key={v.id}
                                        className="flex items-center justify-between py-2 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">{v.productName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {v.unitLabel} · {v.sku}
                                            </p>
                                        </div>
                                        <Badge variant="destructive">
                                            {v.stockLevel} left
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}