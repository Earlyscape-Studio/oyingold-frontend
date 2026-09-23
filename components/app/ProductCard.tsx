"use client";


import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/api";
import { getStartingPrice } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon, FavouriteIcon, Image01Icon } from "@hugeicons/core-free-icons";
// import {Card, CardContent} from "@/components/ui/card";
// import {Badge} from "@/components/ui/badge";




export function ProductCard({ product }: { product: Product }) {

    const router = useRouter();
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);

    const price = getStartingPrice(product);
    const hasMultipleVariants = product.variants.length > 1;
    const image = product.images[0];
    // const fromVariant = product.variants.reduce((lowest, v) => parseFloat(v.cartonPrice) < parseFloat(lowest.cartonPrice) ? v : lowest, product.variants[0]);

    async function handleQuickAdd() {
        if (!price) return;

        const variant = product.variants.find((v) => {
            const candidateAmount = v.piecePrice ?? v.cartonPrice;
            const candidateUnit = v.piecePrice ? "piece" : "carton";
            return candidateAmount === price.amount && candidateUnit === price.unit;
        }) ?? product.variants[0];


        if (!variant) return;

        setAdding(true);

        const result = await addItem({
            productVariantId: variant.id,
            pricingType: price.unit,
            quantity: 1,
        });

        setAdding(false);


        if (!result.ok) {
            if (result.error.toLowerCase().includes("logged in")) {
                toast.error("Please log in to add items to your cart.");
                router.push("/login") //TODO: again don't forget to alter this to trigger a modal instead.
                return;
            }
            toast.error(result.error);
            return;
        }

        toast.success("Added to cart")
    }

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square w-full bg-muted">
                    {image ? (
                        <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 640px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <HugeiconsIcon icon={Image01Icon} size={32} />
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-3">
                <p className="text-xs font-medium text-red-600">{product.category.name}</p>
                <Link href={`/products/${product.id}`}>
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-blue-950">
                        {product.name}
                    </h3>
                </Link>

                {price ? (
                    <p className="mt-1.5 text-base font-bold text-red-600">
                        {hasMultipleVariants && "From "}
                        {formatNaira(price.amount)}
                        <span className="text-xs font-normal text-muted-foreground">
                            /{price.unit}
                        </span>
                    </p>
                ) : (
                    <p className="mt-1.5 text-sm text-muted-foreground">No pricing yet</p>
                )}

                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        disabled={!price || adding}
                        onClick={handleQuickAdd}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-950 py-2 text-xs font-semibold text-white transition hover:bg-blue-900 disabled:opacity-50"
                    >
                        <HugeiconsIcon icon={ShoppingCart01Icon} size={14} />
                        {adding ? "ADDING…" : "ADD TO CART"}
                    </button>
                    <button
                        type="button"
                        aria-label="Add to wishlist"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-red-500 transition hover:bg-red-50"
                    >
                        <HugeiconsIcon icon={FavouriteIcon} size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}




