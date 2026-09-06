import {getProducts} from "@/lib/api";
import {ProductCard} from "./ProductCard";


export async function RelatedProducts({
    categorySlug,
    excludeId
}:{
    categorySlug: string
    excludeId: string
}){
    const products = await getProducts({category: categorySlug});
    const related = products.filter((p) => p.id !== excludeId).slice(0, 4);

    if (related.length === 0) return null;


    return (
        <section className="mt-16">
            <h2 className="text-xl font-bold text-blue-950">Related Products</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    )
}