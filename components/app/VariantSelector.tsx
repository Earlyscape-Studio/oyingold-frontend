"use client"


import { useState } from "react"
import { toast } from "sonner";
import type { ProductVariant, PricingType } from "@/lib/api";
import { hasValidPrice } from "@/lib/api";
import { formatNaira } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";



export function VariantSelector({ variants }: { variants: ProductVariant[] }) {

    const { addItem } = useCart();
    const { setAuthMenuOpen } = useAuth();


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

    const priceUnavailable = !hasValidPrice(selected.cartonPrice);
    const canSellByPiece = hasValidPrice(selected.piecePrice);
    const unavailable = outOfStock || priceUnavailable;


    async function handleAddToCart() {
        setSubmitting(true);

        try {
            const result = await addItem({
                productVariantId: selected.id,
                pricingType,
                quantity
            })

            if (!result.ok) {
                if (result.error.toLowerCase().includes("logged in")) {
                    toast.error("Please log in to add items to your cart.");
                    setAuthMenuOpen(true);
                    return;
                }

                toast.error(result.error);
                return;
            }

            toast.success("Added to cart.");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
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
                {priceUnavailable ? (
                    <p className="text-lg font-medium text-muted-foreground">
                        Price coming soon
                    </p>
                ) : (
                    <>
                        <p className="text-2xl font-bold">
                            {formatNaira(selected.cartonPrice)}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                                / carton of {selected.unitsPerCarton}
                            </span>
                        </p>
                        {hasValidPrice(selected.piecePrice) ? (
                            <p className="text-sm text-muted-foreground">
                                {formatNaira(selected.piecePrice)} / piece
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">sold by carton only</p>
                        )}
                    </>
                )}
            </div>

            {canSellByPiece && !priceUnavailable && (
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
                    onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
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
                disabled={unavailable || submitting}
                onClick={handleAddToCart}
                className="mt-6 w-full"
            >
                {outOfStock
                    ? "Out of stock"
                    : priceUnavailable
                        ? "Price coming soon"
                        : submitting
                            ? "Adding…"
                            : "Add to cart"}
            </Button>
        </div>
    );
}