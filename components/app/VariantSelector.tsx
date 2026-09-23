"use client"


import { useState } from "react"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductVariant, PricingType } from "@/lib/api";
import { formatNaira } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";



export function VariantSelector({ variants }: { variants: ProductVariant[] }) {

    const router = useRouter();
    const { addItem } = useCart();


    const [selectedId, setSelectedId] = useState(variants[0]?.id);
    const [pricingType, setPricingType] = useState<PricingType>("carton")
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);


    const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

    if (!selected) {
        return (
            <p className="text-sm text-muted-foreground">
                No options available for this product
            </p>
        )
    }


    const outOfStock = selected.stockLevel <= 0;
    const lowStock = !outOfStock && selected.stockLevel <= selected.lowStockThreshold;

    const canSellByPiece = !!selected.piecePrice;

    async function handleAddToCart() {
        setSubmitting(true);


        const result = await addItem({
            productVariantId: selected.id,
            pricingType,
            quantity
        })


        setSubmitting(false);

        if (!result.ok) {
            if (result.error.toLowerCase().includes("logged in")) {
                toast.error("Please login to add items to your cart.");
                router.push("/login")  //TODO: Change later to accomdate authentication modal.
                return;
            }

            toast.error(result.error);
            return;
        }


        toast.success("Added to cart.");
    }



    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                    <Button
                        key={v.id}
                        type="button"
                        size="sm"
                        variant={v.id === selectedId ? "default" : "outline"}
                        onClick={() => {
                            setSelectedId(v.id);
                            setPricingType("carton");
                        }}>
                        {v.unitLabel}
                    </Button>
                ))}
            </div>

            <div className="mt-4 space-y-1">
                <p className="text-2xl font-bold">
                    {formatNaira(selected.cartonPrice)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / carton of {selected.unitsPerCarton}
                    </span>
                </p>
                {selected.piecePrice ? (
                    <p className="text-sm text-muted-foreground">
                        {formatNaira(selected.piecePrice)} / piece
                    </p>
                )
                    :
                    (
                        <p className="text-sm text-muted-foreground">sold by carton ony </p>
                    )
                }
            </div>

            {canSellByPiece && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={pricingType === "carton" ? "default" : "outline"}
                        onClick={() => setPricingType("carton")}
                    >
                        By carton
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={pricingType === "piece" ? "default" : "outline"}
                        onClick={() => setPricingType("piece")}
                    >
                        By piece
                    </Button>
                </div>
            )}

            <div className="mt-4 flex items-center gap-2">
                <label htmlFor="quantity" className="text-sm text-muted-foreground">
                    Qty
                </label>
                <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20"
                />
            </div>

            <div>
                {outOfStock ? (
                    <Badge variant="destructive">Out of stock</Badge>
                ) : lowStock ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                        Low stock - {selected.stockLevel} left
                    </Badge>
                ) : (
                    <Badge variant="outline" className="border-green-600 text-green-600">
                        In stock
                    </Badge>
                )}
            </div>

            <Button
                disabled={outOfStock || submitting}
                onClick={handleAddToCart}
                className="mt-6 w-full"
            >
                {outOfStock ? "Out of stock" : submitting ? "Adding…" : "Add to cart"}
            </Button>
        </div>
    )
}
