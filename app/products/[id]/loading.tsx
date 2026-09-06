import {Skeleton} from "@/components/ui/skeleton";



export default function ProductDetailLoading() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    )
}