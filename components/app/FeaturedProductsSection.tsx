import {getProducts} from "@/lib/api";
import {ProductSection} from "./ProductSection";



export async function FeaturedProductsSection(){
    const products = await getProducts();
    const featured = products.filter((p) => p.isFeatured);
    const list = (featured.length > 0 ? featured : products).slice(0, 4);



    return <ProductSection title="Featured Products" viewAllHref="/products" products={list} />
}