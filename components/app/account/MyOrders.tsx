"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderCard } from "@/components/app/account/OrderCard";
import { getMyOrders, type CustomerOrder } from "@/lib/api";

const PAGE_SIZE = 10;

export function MyOrders({ accessToken }: { accessToken: string }) {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPage = useCallback(
        async (nextPage: number) => {
            setError(null);
            if (nextPage === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const result = await getMyOrders(accessToken, {
                    page: nextPage,
                    limit: PAGE_SIZE,
                });

                setOrders((prev) =>
                    nextPage === 1 ? result.data : [...prev, ...result.data]
                );
                setTotal(result.total);
                setPage(result.page);
                setTotalPages(result.totalPages);
            } catch {
                setError("We couldn't load your orders. Please try again.");
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [accessToken]
    );

    useEffect(() => {
        loadPage(1);
    }, [loadPage]);

    return (
        <section>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                My Orders
                {total !== null && (
                    <span className="ml-2 font-normal text-muted-foreground">({total})</span>
                )}
            </h2>

            <div className="mt-6 space-y-6">
                {loading ? (
                    <>
                        <Skeleton className="h-80 w-full rounded-3xl" />
                        <Skeleton className="h-80 w-full rounded-3xl" />
                    </>
                ) : error && orders.length === 0 ? (
                    <div className="rounded-3xl border p-8 text-center">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button className="mt-4" variant="outline" onClick={() => loadPage(1)}>
                            Try again
                        </Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-3xl border p-10 text-center">
                        <p className="font-medium text-foreground">You haven&apos;t placed any orders yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            When you do, you can track them here.
                        </p>
                        <Button asChild className="mt-5">
                            <Link href="/products">Start shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}

                        {error && (
                            <p className="text-center text-sm text-destructive">{error}</p>
                        )}

                        {page < totalPages && (
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    disabled={loadingMore}
                                    onClick={() => loadPage(page + 1)}
                                >
                                    {loadingMore ? "Loading…" : "Load more orders"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}