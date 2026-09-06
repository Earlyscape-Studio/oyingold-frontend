import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import { getCategories, getProducts } from "@/lib/api";



export async function CategoryGrid() {
    const [categories, products] = await Promise.all([getCategories(), getProducts()]);
    const popular = categories.slice(0, 5);

    return (
        <section className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-red-600">Popular Categories</h2>
                <Link href="/products" className="text-sm font-medium text-blue-950 hover:underline">
                    View All Categories →
                </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {popular.map((category) => {
                    const thumbnail = products.find(
                        (p) => p.category.id === category.id && p.images[0]
                    )?.images[0]

                    return (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="flex flex-col items-center gap-3 rounded-lg border p-4 text-center transition hover:border-red-600"
                        >
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted">
                                {thumbnail ? (
                                    <Image src={thumbnail} alt={category.name} width={80} height={80} className="object-contain" />
                                ) : (
                                    <HugeiconsIcon icon={Image01Icon} size={28} className="text-muted-foreground" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-blue-950">{category.name}</p>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}