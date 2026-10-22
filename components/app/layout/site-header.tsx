"use client";

import Link from "next/link";
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react";
import {
    FavouriteIcon,
    ShoppingCart01Icon
} from "@hugeicons/core-free-icons"
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { SearchBox } from "@/components/app/layout/SearchBox";
import { AccountMenu } from "@/components/app/layout/account-menu";




export function SiteHeader() {
    const { itemCount } = useCart();
    const { count: wishlistCount } = useWishlist();


    return (
        <header className="sticky top-0 z-40 bg-white">
            <div className="bg-red-600 py-2 text-center text-xs text-white">
                <span className="mr-2 rounded bg-white/20 px-2 py-0.5 font-semibold">
                    Special
                </span>
                Get 10% DISCOUNT for first order{" "}
                <Link href="/signup" className="underline">
                    Register Now
                </Link>
            </div>

            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
                <Link href="/" className="shrink-0 text-xl font-bold text-red-600">
                    <Image
                        src="./images/Logo-combo.svg"
                        alt="oyingold logo"
                        width={250}
                        height={150}
                    />
                </Link>

                <SearchBox />

                <nav className="flex shrink-0 items-center gap-5 text-sm">
                    <AccountMenu />

                    <Link href="/wishlist" className="relative text-blue-950" aria-label="Wishlist">
                        <HugeiconsIcon icon={FavouriteIcon} size={20} className="fill-blue-600" />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                            {wishlistCount}
                        </span>
                    </Link>

                    <Link href="/cart" className="relative text-blue-950" aria-label="Cart">
                        <HugeiconsIcon icon={ShoppingCart01Icon} size={20} className="fill-blue-600" />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                            {itemCount}
                        </span>
                    </Link>
                </nav>
            </div>

            <div className="border-t border-b flex items-center justify-center">
                <div className="mx-auto flex max-w-6xl gap-6 px-4 py-2.5 text-sm font-medium">
                    <Link href="/" className="text-blue-950">Home</Link>
                    <Link href="/products" className="text-blue-950">Shop</Link>
                    <Link href="/contact" className="text-blue-950">Contact</Link>
                </div>
            </div>
        </header>
    )
}