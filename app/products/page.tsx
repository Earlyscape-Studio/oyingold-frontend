import Link from "next/link"
import {getProducts, getCategories} from "@/lib/api"
import {Button} from "@/components/ui/button"
import {ProductCard} from "@/components/app/ProductCard"




export default async function ProductsPage({
    searchParams
}: {searchParams: Promise<{category?: string, q?: string}>}) {
    const {category, q} = await searchParams;

    const [products, categories] = await Promise.all([
        getProducts({category, q}),
        getCategories()
    ]);


    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="text-2xl font-bold">Products</h1>

            <div className="mt-6 flex flex-wrap gap-2">
                <Button
                    asChild
                    size="sm"
                    variant={!category ? "default" : "outline"}
                    className="rounded-full"
                >
                    <Link href="/products">All</Link>
                </Button>
                {categories.map((c) => (
                    <Button
                        key={c.id}
                        asChild
                        size="sm"
                        variant={category === c.slug ? "default" : "outline"}
                        className="rounded-full"
                    >
                        <Link href={`/products?category=${c.slug}`}>{c.name}</Link>
                    </Button>
                ))}
            </div>

            {products.length === 0 ? (
                <p className="mt-10 text-muted-foreground">No products found.</p>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}