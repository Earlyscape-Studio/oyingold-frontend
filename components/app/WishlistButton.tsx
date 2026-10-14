"use client";

import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";


export function WishlistButton({
    productId,
    className,
    size = 16,
}: {
    productId: string;
    className?: string;
    size?: number;
}) {
    const { isLoggedIn, setAuthMenuOpen } = useAuth();
    const { isWishlisted, isPending, toggle } = useWishlist();

    const wishlisted = isWishlisted(productId);

    async function handleClick() {
        if (!isLoggedIn) {
            toast.error("Please log in to save items to your wishlist.");
            setAuthMenuOpen(true);
            return;
        }

        const result = await toggle(productId);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }

        toast.success(result.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    }

    return (
        <button
            type="button"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            disabled={isPending(productId)}
            onClick={handleClick}
            className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-red-500 transition hover:bg-red-50 disabled:opacity-60",
                className
            )}
        >
            <HugeiconsIcon
                icon={FavouriteIcon}
                size={size}
                className={cn(wishlisted && "fill-red-500")}
            />
        </button>
    );
}