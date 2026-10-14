"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ShoppingCart01Icon,
    CancelCircleIcon,
    Image01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import {
    getStartingPrice,
    hasValidPrice,
    isVariantPurchasable,
    type Product,
} from "@/lib/api";

export function WishlistRow({
    product,
    removing,
    onRemove,
}: {
    product: Product;
    removing: boolean;
    onRemove: () => void;
}) {
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);

    const price = getStartingPrice(product);
    const image = product.images[0];
    const purchasable = product.variants.filter(isVariantPurchasable);
    const inStock = purchasable.length > 0;

    // One buyable variant: add it straight from here. Several: pick on the product page.
    const singleVariant = purchasable.length === 1 ? purchasable[0] : null;

    async function handleAddToCart() {
        if (!singleVariant) return;

        setAdding(true);

        try {
            const result = await addItem({
                productVariantId: singleVariant.id,
                pricingType: hasValidPrice(singleVariant.piecePrice) ? "piece" : "carton",
                quantity: 1,
            });

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            toast.success("Added to cart");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setAdding(false);
        }
    }

    const buttonClass =
        "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-xs font-semibold uppercase tracking-wide transition md:w-44";

    return (
        <li className="flex flex-col gap-3 rounded-3xl px-4 py-4 odd:bg-muted/60 md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto] md:items-center md:gap-4 md:px-8">
            <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded bg-white">
                    {image ? (
                        <Image
                            src={image}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <HugeiconsIcon icon={Image01Icon} size={20} />
                        </div>
                    )}
                </div>

                <Link
                    href={`/products/${product.id}`}
                    className="font-medium text-foreground hover:underline"
                >
                    {product.name}
                </Link>
            </div>

            <p className="font-medium text-foreground md:text-center">
                {price ? (
                    <>
                        {product.variants.length > 1 && (
                            <span className="mr-1 text-xs font-normal text-muted-foreground">From</span>
                        )}
                        {formatNaira(price.amount)}
                    </>
                ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
            </p>

            <p className="text-sm font-semibold uppercase text-red-600 md:text-center md:text-base">
                {inStock ? "In stock" : "Out of stock"}
            </p>

            <div className="flex items-center gap-3">
                {!inStock ? (
                    <button type="button" disabled className={cn(buttonClass, "bg-gray-300 text-white")}>
                        Add to cart
                        <HugeiconsIcon icon={ShoppingCart01Icon} size={16} />
                    </button>
                ) : singleVariant ? (
                    <button
                        type="button"
                        disabled={adding}
                        onClick={handleAddToCart}
                        className={cn(buttonClass, "bg-blue-950 text-white hover:bg-blue-900 disabled:opacity-60")}
                    >
                        {adding ? "Adding…" : "Add to cart"}
                        <HugeiconsIcon icon={ShoppingCart01Icon} size={16} />
                    </button>
                ) : (
                    <Link
                        href={`/products/${product.id}`}
                        className={cn(buttonClass, "bg-blue-950 text-white hover:bg-blue-900")}
                    >
                        Select options
                    </Link>
                )}

                <button
                    type="button"
                    aria-label={`Remove ${product.name} from wishlist`}
                    disabled={removing}
                    onClick={onRemove}
                    className="shrink-0 text-muted-foreground transition hover:text-red-600 disabled:opacity-50"
                >
                    <HugeiconsIcon icon={CancelCircleIcon} size={22} />
                </button>
            </div>
        </li>
    );
}