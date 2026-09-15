import {Suspense} from "react";
import {notFound} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {HugeiconsIcon} from "@hugeicons/react";
import {Image01Icon} from "@hugeicons/core-free-icons";
import {VariantSelector} from "@/components/app/VariantSelector";
import {getProduct} from "@/lib/api";
import {RelatedProducts} from "@/components/app/RelatedProducts";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {ProductCardSkeleton} from "@/components/app/ProductCardSkeleton";


export default async function ProductDetailPage ({
    params,
} : {params: Promise<{id: string}>}) {
    const {id} = await params;
    const product = await getProduct(id);


    if(!product){
        notFound();
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <Button asChild variant="link" className="h-auto p-0 text-muted-foreground">
                <Link href="/products">← Back to products</Link>
            </Button>

            <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="relative aspect-square w-full rounded-lg bg-muted">
                    {product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain p-8"
                            priority
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <HugeiconsIcon icon={Image01Icon} size={48} />
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {product.brand.name} · {product.category.name}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-blue-950">{product.name}</h1>
                    {product.description && (
                        <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
                    )}

                    <div className="mt-6">
                        <VariantSelector variants={product.variants} />
                    </div>

                    <p className="mt-4 text-sm">
                        Categories:{" "}
                        <Link href={`/products?category=${product.category.slug}`} className="text-red-600">
                            {product.category.name}
                        </Link>
                    </p>
                </div>
            </div>

            <Suspense
                fallback={
                    <div className="mt-16">
                        <Skeleton className="h-6 w-40" />
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                }
            >
                <RelatedProducts categorySlug={product.category.slug} excludeId={product.id} />
            </Suspense>
        </div>
    )
}