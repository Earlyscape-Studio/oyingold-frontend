"use client"


import {useState} from "react"
import {useRouter} from "next/navigation"
import {createProduct} from "@/lib/api"
import {supabase} from "@/lib/supabase-client"
import type {Category, Brand} from "@/lib/api"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}  from "@/components/ui/card"




export function NewProductForm ({categories, brands}: {categories: Category[], brands: Brand[]}) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [error, setError] = useState<string | null>(null);



    async function handleSubmit (e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError(null);

        if(!categoryId || !brandId){
            setError("Please select a category and a brand");
            return;
        }


        setSubmitting(true);

        const form = new FormData(e.currentTarget);

        const {data: sessionData} = await supabase.auth.getSession();

        const accessToken = sessionData.session?.access_token;

        if(!accessToken){
            setError("Your session expired. Please sign in again")
            setSubmitting(false);
            return;
        }


        const result = await createProduct({
            name: String(form.get("name") ?? ""),
            description: String(form.get("description") ?? "") || undefined,
            categoryId,
            brandId,
            variant: {
                sku: String(form.get("sku") ?? ""),
                unitLabel: String(form.get("unitLabel") ?? ""),
                unitsPerCarton: Number(form.get("unitsPerCarton") ?? 1),
                cartonPrice: String(form.get("cartonPrice") ?? ""),
                piecePrice: String(form.get("piecePrice") ?? "") || undefined,
                stockLevel: Number(form.get("stockLevel") ?? 0),
                lowStockThreshold: Number(form.get("lowStockThreshold") ?? 10),
            }
        },accessToken)
        
        setSubmitting(false);


        if(!result.ok) {
            setError(result.error);
            return;
        }

        router.push(`/products/${result.product.id}`);
        router.refresh()
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </p>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Product name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder="e.g. Goldwealth Vegetable Oil"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Brand</Label>
                            <Select value={brandId} onValueChange={setBrandId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">First variant</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Every product needs at least one sellable option (e.g. a specific
                        size). You can add more sizes later.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" name="sku" required placeholder="e.g. GW-VO-1L" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="unitLabel">Unit label</Label>
                            <Input
                                id="unitLabel"
                                name="unitLabel"
                                required
                                placeholder="e.g. 1 Litre"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="unitsPerCarton">Units per carton</Label>
                            <Input
                                id="unitsPerCarton"
                                name="unitsPerCarton"
                                type="number"
                                min={1}
                                required
                                defaultValue={1}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cartonPrice">Carton price (₦)</Label>
                            <Input
                                id="cartonPrice"
                                name="cartonPrice"
                                type="number"
                                step="0.01"
                                min={0}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="piecePrice">Piece price (₦)</Label>
                            <Input
                                id="piecePrice"
                                name="piecePrice"
                                type="number"
                                step="0.01"
                                min={0}
                                placeholder="Leave blank if carton-only"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="stockLevel">Stock level</Label>
                            <Input
                                id="stockLevel"
                                name="stockLevel"
                                type="number"
                                min={0}
                                defaultValue={0}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
                            <Input
                                id="lowStockThreshold"
                                name="lowStockThreshold"
                                type="number"
                                min={0}
                                defaultValue={10}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Adding product…" : "Add product"}
            </Button>
        </form>
    )

}