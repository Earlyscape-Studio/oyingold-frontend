"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { RequireCustomerSession } from "@/components/app/RequireCustomerSession";
import { ProductCard } from "@/components/app/ProductCard";
import { WishlistRow } from "@/components/app/wishlist/WishlistRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { getProducts, getWishlist, type Product, type WishlistItem } from "@/lib/api";

export function WishlistClient() {
    return (
        <RequireCustomerSession>
            <WishlistContent />
        </RequireCustomerSession>
    );
}

function WishlistContent() {
    const { session } = useAuth();
    const { remove } = useWishlist();
    const accessToken = session?.access_token;

    const [items, setItems] = useState<WishlistItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!accessToken) return;

        let cancelled = false;

        getWishlist(accessToken)
            .then((result) => {
                if (!cancelled) {
                    setItems(result);
                    setError(null);
                }
            })
            .catch(() => {
                if (!cancelled) setError("We couldn't load your wishlist. Please try again.");
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, reloadKey]);

    // "Related Products": more from the category of the most recently saved item.
    const categorySlug = items?.[0]?.product.category.slug;

    useEffect(() => {
        if (!categorySlug) return;

        let cancelled = false;

        getProducts({ category: categorySlug, limit: 12 })
            .then((products) => {
                if (!cancelled) setRelated(products);
            })
            .catch(() => {
                if (!cancelled) setRelated([]);
            });

        return () => {
            cancelled = true;
        };
    }, [categorySlug]);

    async function handleRemove(productId: string) {
        setRemovingId(productId);

        const result = await remove(productId);

        setRemovingId(null);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }

        setItems((prev) => prev?.filter((item) => item.product.id !== productId) ?? prev);
        toast.success("Removed from wishlist");
    }

    const savedIds = new Set(items?.map((item) => item.product.id));
    const relatedProducts = related.filter((p) => !savedIds.has(p.id)).slice(0, 4);

    return (
        <>
            <div className="overflow-hidden rounded-xl border">
                <div className="hidden bg-muted px-8 py-4 text-sm font-medium uppercase text-foreground md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto] md:gap-4">
                    <span>Products</span>
                    <span className="text-center">Price</span>
                    <span className="text-center">Stock status</span>
                    <span className="w-[calc(11rem+2.25rem)] text-center text-xs">Actions</span>
                </div>

                {error && !items ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => {
                                setError(null);
                                setReloadKey((k) => k + 1);
                            }}
                        >
                            Try again
                        </Button>
                    </div>
                ) : !items ? (
                    <div className="space-y-3 p-5">
                        <Skeleton className="h-24 w-full rounded-3xl" />
                        <Skeleton className="h-24 w-full rounded-3xl" />
                        <Skeleton className="h-24 w-full rounded-3xl" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="font-medium text-foreground">Your wishlist is empty</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tap the heart on any product to save it here.
                        </p>
                        <Button asChild className="mt-5">
                            <Link href="/products">Browse products</Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-1 p-3">
                        {items.map((item) => (
                            <WishlistRow
                                key={item.id}
                                product={item.product}
                                removing={removingId === item.product.id}
                                onRemove={() => handleRemove(item.product.id)}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {relatedProducts.length > 0 && (
                <section className="mt-20">
                    <h2 className="border-b pb-4 text-2xl font-bold text-red-600">Related Products</h2>
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {relatedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}