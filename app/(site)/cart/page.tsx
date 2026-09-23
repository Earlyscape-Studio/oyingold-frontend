import Link from "next/link";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/app/ProductCard";
import { CartClient } from "@/components/app/CartClient";


export default async function CartPage() {
    const products = await getProducts();
    const related = products.slice(0, 4); //TODO: would be preferably randomized.


    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/">Home</Link>
                <span>›</span>
                <span className="text-blue-950">Cart</span>
            </nav>

            <h1 className="mt-4 text-2xl font-bold text-blue-950">Cart</h1>

            <div className="mt-6">
                <CartClient />
            </div>

            {related.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-xl font-bold text-red-600">Related Products</h2>
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}