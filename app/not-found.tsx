import Link from "next/link";
import { Button } from "@/components/ui/button";


export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="text-6xl font-bold text-red-600">404</p>
            <div className="space-y-1">
                <h1 className="text-lg font-semibold text-blue-950">Page not found</h1>
                <p className="text-sm text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                </p>
            </div>
            <div className="mt-2 flex gap-3">
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/products">Browse Shop</Link>
                </Button>
            </div>
        </div>
    )
}