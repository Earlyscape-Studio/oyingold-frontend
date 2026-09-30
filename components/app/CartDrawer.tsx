"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ShoppingCart01Icon,
    Image01Icon,
    Cancel01Icon,
    Add01Icon,
    Remove01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter
} from "@/components/ui/drawer";
import { formatNaira } from "@/lib/format";
import { getCartItemUnitPrice, getCartTotal, type CartItem } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

// Pages where a floating "view cart" affordance would just be noise -
// you're either already looking at the cart, or in the middle of paying.
const HIDDEN_PATH_PREFIXES = ["/cart", "/checkout", "/order"];

export function CartDrawer() {
    const pathname = usePathname();
    const { cart, itemCount, loading, isLoggedIn, updateItemQuantity, removeItem } = useCart();
    const [open, setOpen] = useState(false);
    const [pendingItemId, setPendingItemId] = useState<string | null>(null);

    const subtotal = useMemo(() => getCartTotal(cart), [cart]);

    const hidden = HIDDEN_PATH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (hidden || !isLoggedIn) return null;


    async function handleQuantityChange(item: CartItem, quantity: number) {
        if (quantity < 1) return;

        setPendingItemId(item.id);
        const result = await updateItemQuantity(item.id, quantity);
        setPendingItemId(null);

        if (!result.ok) {
            toast.error(result.error);
        }
    }


    async function handleRemove(itemId: string) {
        setPendingItemId(itemId);
        const result = await removeItem(itemId);
        setPendingItemId(null);

        if (!result.ok) {
            toast.error(result.error);
        }
    }


    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open cart"
                className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-950 text-white shadow-lg transition-transform hover:scale-105"
            >
                <HugeiconsIcon icon={ShoppingCart01Icon} size={24} />
                {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] text-white">
                        {itemCount}
                    </span>
                )}
            </button>

            <Drawer open={open} onOpenChange={setOpen} direction="right">
                <DrawerContent className="flex">
                    <DrawerHeader className="border-b text-left">
                        <DrawerTitle>Your cart</DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-4">
                        {loading ? (
                            <p className="py-12 text-center text-sm text-muted-foreground">
                                Loading your cart…
                            </p>
                        ) : !cart || cart.items.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                                <Button asChild className="mt-4" onClick={() => setOpen(false)}>
                                    <Link href="/products">Return to shop</Link>
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {cart.items.map((item) => (
                                    <li key={item.id} className="flex gap-3 py-4">
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                                            {item.productVariant.product.images[0] ? (
                                                <Image
                                                    src={item.productVariant.product.images[0]}
                                                    alt={item.productVariant.product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                    <HugeiconsIcon icon={Image01Icon} size={18} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col">
                                            <div className="flex items-start justify-between gap-2">
                                                <Link
                                                    href={`/products/${item.productVariant.product.id}`}
                                                    onClick={() => setOpen(false)}
                                                    className="text-sm font-medium text-blue-950 hover:underline"
                                                >
                                                    {item.productVariant.product.name}
                                                </Link>
                                                <button
                                                    type="button"
                                                    aria-label="Remove item"
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={pendingItemId === item.id}
                                                    className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                                                >
                                                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                                </button>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {item.productVariant.unitLabel} · {item.pricingType}
                                            </p>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        aria-label="Decrease quantity"
                                                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                        disabled={pendingItemId === item.id || item.quantity <= 1}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full border disabled:opacity-50"
                                                    >
                                                        <HugeiconsIcon icon={Remove01Icon} size={12} />
                                                    </button>
                                                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        aria-label="Increase quantity"
                                                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                        disabled={pendingItemId === item.id}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full border disabled:opacity-50"
                                                    >
                                                        <HugeiconsIcon icon={Add01Icon} size={12} />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {formatNaira(getCartItemUnitPrice(item) * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {cart && cart.items.length > 0 && (
                        <DrawerFooter className="border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">{formatNaira(subtotal)}</span>
                            </div>
                            <Button asChild className="w-full" onClick={() => setOpen(false)}>
                                <Link href="/cart">View cart</Link>
                            </Button>
                        </DrawerFooter>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}