import {Skeleton} from "@/components/ui/skeleton";
import {ProductCardSkeleton} from "@/components/app/ProductCardSkeleton";


export default function ProductsLoading () {
    return(
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Skeleton className="h-8 w-24" />
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
                <Skeleton className="h-64 w-full rounded-lg" />
                <div>
                    <Skeleton className="h-5 w-64" />
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}