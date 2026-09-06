import Link from "next/link";
import { getProducts, getCategories } from "@/lib/api";
// import {ProductCard} from "@/components/app/ProductCard";
import { ShopControls } from "@/components/app/ShopControls";
import { cn } from "@/lib/utils";







export default async function ProductsPage({
    searchParams
}: { searchParams: Promise<{ category?: string, q?: string }> }) {
    const { category, q } = await searchParams;

    const [products, categories] = await Promise.all([
        getProducts({ category, q }),
        getCategories()
    ]);


    const categorySidebar = (
        <div className="rounded-lg border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product Categories
            </p>
            <nav className="flex flex-col gap-1 text-sm">
                <Link
                    href="/products"
                    className={cn("rounded px-2 py-1.5", !category && "bg-red-50 font-medium text-red-600")}
                >
                    All
                </Link>
                {categories.map((c) => (
                    <Link
                        key={c.id}
                        href={`/products?category=${c.slug}`}
                        className={cn(
                            "rounded px-2 py-1.5",
                            category === c.slug && "bg-red-50 font-medium text-red-600"
                        )}
                    >
                        {c.name}
                    </Link>
                ))}
            </nav>
        </div>
    )

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="text-2xl font-bold text-blue-950">Shop</h1>
            <div className="mt-6">
                <ShopControls products={products} categorySidebar={categorySidebar} />
            </div>
        </div>
    )
}