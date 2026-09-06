import {getProducts} from "@/lib/api";
import {ProductSection} from "./ProductSection";


export async function NewProductsSection() {
    const products = await getProducts();
    const sorted = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return <ProductSection title="New Products" viewAllHref="/products" products={sorted.slice(0, 8)} />
}