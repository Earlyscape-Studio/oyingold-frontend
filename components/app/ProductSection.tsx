import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/api";


export function ProductSection({
    title,
    viewAllHref,
    products
}: {
    title: string
    viewAllHref: string
    products: Product[]
}) {
    return (
        <section className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-blue-950">{title}</h2>
                <Link href={viewAllHref} className="text-sm font-medium text-blue-950 hover:underline">
                    View All Product →
                </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    )
}