import {notFound} from "next/navigation";
import {getProduct, getCategories, getBrands} from "@/lib/api";
import {EditProductForm} from "@/components/app/admin/EditProductForm";
import {VariantsEditor} from "@/components/app/admin/VariantsEditor";



export default async function EditProductsPage({
    params
} : {params: Promise<{id: string}>}){
    const {id} = await params;


    const [product, categories, brands] = await Promise.all([
        getProduct(id),
        getCategories(),
        getBrands()
    ])

    if(!product){
        notFound();
    }

    return(
         <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Edit product</h1>
                <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
            </div>

            <EditProductForm
                product={product}
                categories={categories}
                brands={brands}
            />

            <VariantsEditor productId={product.id} variants={product.variants} />
        </div>
    );
}