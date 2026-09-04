import {notFound} from "next/navigation";
import Link from "next/link";
import {getProduct} from "@/lib/api";
import {VariantSelector} from "@/components/app/VariantSelector";
import {Button} from "@/components/ui/button";


export default async function ProductDetailPage ({
    params,
} : {params: Promise<{id: string}>}) {
    const {id} = await params;
    const product = await getProduct(id);


    if(!product){
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <Button asChild variant="link" className="h-auto p-0 text-muted-foreground">
                <Link href="/products">← Back to products</Link>
            </Button>

            <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    Product image
                </div>

                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {product.brand.name} · {product.category.name}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
                    {product.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {product.description}
                        </p>
                    )}

                    <div className="mt-6">
                        <VariantSelector variants={product.variants} />
                    </div>
                </div>
            </div>
        </div>
    )
}