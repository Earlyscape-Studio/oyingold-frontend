"use client";


import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { deleteProduct, type Product } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";



export function ProductsTable({ products }: { products: Product[] }) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);



    async function handleDelete(product: Product) {
        const confirmed = window.confirm(
            `Delete "${product.name}"? This can't be undone.`
        );

        if (!confirmed) return;


        setError(null);
        setDeletingId(product.id);

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;


        if (!accessToken) {
            setError("Your session expired. Please sign in again.");
            setDeletingId(null);
            return;
        }

        const result = await deleteProduct(product.id, accessToken);

        setDeletingId(null);


        if (!result.ok) {
            setError(result.error);
            return;
        }

        router.refresh();
    }


    if (products.length === 0) {
        return (
            <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No products yet.
            </p>
        );
    }



    return (
        <div className="space-y-3">
            {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </p>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Variants</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const totalStock = product.variants.reduce(
                                (sum, v) => sum + v.stockLevel,
                                0
                            );
                            const anyLowStock = product.variants.some(
                                (v) => v.stockLevel <= v.lowStockThreshold
                            );

                            return (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.category.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.brand.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.variants.length}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                anyLowStock ? "font-medium text-destructive" : ""
                                            }
                                        >
                                            {totalStock}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {product.isFeatured && (
                                            <Badge variant="secondary">Featured</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/products/${product.id}/edit`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={deletingId === product.id}
                                                onClick={() => handleDelete(product)}
                                            >
                                                {deletingId === product.id
                                                    ? "Deleting…"
                                                    : "Delete"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}