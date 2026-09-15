import Link from "next/link";
import { getProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/app/admin/ProductsTable"



export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {products.length} product{products.length === 1 ? "" : "s"}
                    </p>
                </div>

                <Button asChild>
                    <Link href="/admin/products/new">Add product</Link>
                </Button>
            </div>

            <ProductsTable products={products} />
        </div>
    )
}