"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { updateProductVariant } from "@/lib/api";
import type { ProductVariant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


function VariantRow({
    productId,
    variant
}: {
    productId: string;
    variant: ProductVariant
}) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);


    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null);
        setSaving(true);


        const form = new FormData(e.currentTarget);

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;


        if (!accessToken) {
            setError("Your session has expired. Please sign in again.");
            setSaving(false);
            return;
        }

        const piecePriceRaw = String(form.get("piecePrice") ?? "").trim();

        const result = await updateProductVariant(
            productId,
            variant.id,
            {
                sku: String(form.get("sku") ?? ""),
                unitLabel: String(form.get("unitLabel") ?? ""),
                unitsPerCarton: Number(form.get("unitsPerCarton") ?? 1),
                cartonPrice: String(form.get("cartonPrice") ?? ""),
                piecePrice: piecePriceRaw === "" ? null : piecePriceRaw,
                stockLevel: Number(form.get("stockLevel") ?? 0),
                lowStockThreshold: Number(form.get("lowStockThreshold") ?? 10),
            },
            accessToken
        );


        setSaving(false);

        if (!result.ok) {
            setError(result.error);
            return;
        }

        router.refresh();
    }



    return (
        <form onSubmit={handleSave} className="space-y-3 py-4">
            {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1">
                    <Label htmlFor={`sku-${variant.id}`}>SKU</Label>
                    <Input
                        id={`sku-${variant.id}`}
                        name="sku"
                        defaultValue={variant.sku}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`unitLabel-${variant.id}`}>Unit label</Label>
                    <Input
                        id={`unitLabel-${variant.id}`}
                        name="unitLabel"
                        defaultValue={variant.unitLabel}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`unitsPerCarton-${variant.id}`}>
                        Units/carton
                    </Label>
                    <Input
                        id={`unitsPerCarton-${variant.id}`}
                        name="unitsPerCarton"
                        type="number"
                        min={1}
                        defaultValue={variant.unitsPerCarton}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`cartonPrice-${variant.id}`}>
                        Carton price (₦)
                    </Label>
                    <Input
                        id={`cartonPrice-${variant.id}`}
                        name="cartonPrice"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={variant.cartonPrice}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`piecePrice-${variant.id}`}>
                        Piece price (₦)
                    </Label>
                    <Input
                        id={`piecePrice-${variant.id}`}
                        name="piecePrice"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={variant.piecePrice ?? ""}
                        placeholder="Carton-only"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`stockLevel-${variant.id}`}>Stock</Label>
                    <Input
                        id={`stockLevel-${variant.id}`}
                        name="stockLevel"
                        type="number"
                        min={0}
                        defaultValue={variant.stockLevel}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor={`lowStockThreshold-${variant.id}`}>
                        Low stock at
                    </Label>
                    <Input
                        id={`lowStockThreshold-${variant.id}`}
                        name="lowStockThreshold"
                        type="number"
                        min={0}
                        defaultValue={variant.lowStockThreshold}
                    />
                </div>
            </div>

            <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save variant"}
            </Button>
        </form>
    );
}



export function VariantsEditor({
    productId,
    variants
}: {
    productId: string;
    variants: ProductVariant[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Variants</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
                {variants.map((variant, i) => (
                    <div key={variant.id}>
                        {i > 0 && <Separator className="my-0" />}
                        <VariantRow productId={productId} variant={variant} />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}