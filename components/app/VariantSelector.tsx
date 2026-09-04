"use client"


import {useState} from "react"
import type {ProductVariant} from "@/lib/api"
import {formatNaira} from "@/lib/format"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"



export function VariantSelector ({variants}:{variants: ProductVariant[]}) {
    const [selectedId, setSelectedId] = useState(variants[0]?.id);
    const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

    if(!selected){
        return (
            <p className="text-sm text-muted-foreground">
                No options available for this product
            </p>
        )
    }


    const outOfStock = selected.stockLevel <= 0;
    const lowStock = !outOfStock && selected.stockLevel <= selected.lowStockThreshold;



    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                    <Button
                     key={v.id}
                     type="button"
                     size="sm"
                     variant={v.id === selectedId ? "default" : "outline"}
                     onClick={() => setSelectedId(v.id)}>
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

            <Button disabled={outOfStock} className="mt-6 w-full">
                {outOfStock ? "Out of stock" : "Add to cart"}
            </Button> 
        </div>
    )
}
