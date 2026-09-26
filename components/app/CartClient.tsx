"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { formatNaira } from "@/lib/format";
import { getCartItemUnitPrice, getCartTotal, type CartItem } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import {useAuth} from "@/lib/auth-context";






export function CartClient() {
    const { cart, loading, isLoggedIn, error, updateItemQuantity, removeItem, refreshCart } = useCart();
    const {setAuthMenuOpen} = useAuth();

    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
    const [updating, setUpdating] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState("");

    // useEffect(() => {
    //     if (!cart) return;
    //     setLocalQuantities((prev) => {
    //         const next = {...prev};
    //         for(const item of cart.items){
    //             if(!(item.id in next)){
    //                 next[item.id] = item.quantity;
    //             }
    //         }

    //         for (const id of Object.keys(next)){
    //             if(!cart.items.some((item) => item.id === id)){
    //                 delete next[id];
    //             }
    //         }

    //         return next;
    //     })
    // }, [cart]);


    const subtotal = useMemo(() => getCartTotal(cart), [cart])


    async function handleRemove(itemId: string) {
        setRemovingId(itemId);

        const result = await removeItem(itemId);

        setRemovingId(null);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }


        setLocalQuantities((prev) => {
            if (!(itemId in prev)) return prev;
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    }


    async function handleUpdateCart() {
        if (!cart) return;

        const changed = cart.items.filter(
            (item) => localQuantities[item.id] !== undefined && localQuantities[item.id] !== item.quantity
        );

        if (changed.length === 0) return;


        setUpdating(true);

        for (const item of changed) {
            const result = await updateItemQuantity(item.id, localQuantities[item.id]);

            if (!result.ok) {
                toast.error(result.error);
            }
        }
        setUpdating(false);
        toast.success("Cart Updated!")
    }


    function handleApplyCoupon() {
        if (!couponCode.trim()) return;
        toast.info("Coupons aren't avaialble yet.")
    }

    function handleCheckout() {
        toast.info("Checkout is coming soon");
    }

    if (loading) {
        //TODO: find a way to replace this with skeleton instead
        return <p className="py-16 text-center text-sm text-muted-foreground">Loading your cart…</p>;
    }


    if (!isLoggedIn) {
        return (
            <div className="rounded-lg border py-16 text-center">
                <p className="text-sm text-muted-foreground">
                    Please log in to view your cart.
                </p>
                <Button asChild className="mt-4" onClic={() => setAuthMenuOpen(true)}>
                    <Link href="/login">Log in</Link>
                </Button>
            </div>
        )
    }



    if (error) {
        return (
            <div className="rounded-lg border py-16 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => refreshCart()}>
                    Try again
                </Button>
            </div>
        )
    }


    if (!cart || cart.items.length === 0) {
        return (
            <div className="rounded-lg border py-16 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Button asChild className="mt-4">
                    <Link href="/products">Return To Shop</Link>
                </Button>
            </div>
        )
    }

    return (
        <div>
            <div className="rounded-lg border">
                <Table className="min-w-[640px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-4 font-semibold text-blue-950">Product</TableHead>
                            <TableHead className="px-4 py-4 font-semibold text-blue-950">Price</TableHead>
                            <TableHead className="px-4 py-4 font-semibold text-blue-950">Quantity</TableHead>
                            <TableHead className="px-4 py-4 font-semibold text-blue-950">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.items.map((item) => (
                            <CartRow
                                key={item.id}
                                item={item}
                                quantity={localQuantities[item.id] ?? item.quantity}
                                removing={removingId === item.id}
                                onQuantityChange={(qty) =>
                                    setLocalQuantities((prev) => ({ ...prev, [item.id]: qty }))
                                }
                                onRemove={() => handleRemove(item.id)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button asChild variant="outline">
                    <Link href="/products">Return To Shop</Link>
                </Button>
                <Button onClick={handleUpdateCart} disabled={updating}>
                    {updating ? "Updating…" : "Update Cart"}
                </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex gap-3">
                    <Input
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="max-w-xs rounded-md"
                    />
                    <Button
                        variant="destructive"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={handleApplyCoupon}
                    >
                        Apply Coupon
                    </Button>
                </div>

                <div className="rounded-lg border p-6">
                    <h2 className="text-lg font-bold text-blue-950">Cart Total</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between border-b pb-3">
                            <span>Subtotal:</span>
                            <span>{formatNaira(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-3">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Total:</span>
                            <span className="font-semibold">{formatNaira(subtotal)}</span>
                        </div>
                    </div>
                    <Button
                        className="mt-6 w-full bg-red-600 text-white hover:bg-red-700"
                        onClick={handleCheckout}
                    >
                        Proceed to checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}



function CartRow({
    item,
    quantity,
    removing,
    onQuantityChange,
    onRemove
}: {
    item: CartItem;
    quantity: number;
    removing: boolean;
    onQuantityChange: (qty: number) => void;
    onRemove: () => void;
}) {
    const unitPrice = getCartItemUnitPrice(item);

    const image = item.productVariant.product.images[0];

    return (
        <TableRow>
            <TableCell className="px-4 py-4 whitespace-normal">
                <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <button
                            type="button"
                            aria-label="Remove item"
                            onClick={onRemove}
                            disabled={removing}
                            className="absolute -left-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white disabled:opacity-50"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={12} />
                        </button>
                        {image ? (
                            <Image
                                src={image}
                                alt={item.productVariant.product.name}
                                fill
                                className="object-contain p-1"
                                sizes="64px"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <HugeiconsIcon icon={Image01Icon} size={20} />
                            </div>
                        )}
                    </div>
                    <div>
                        <Link
                            href={`/products/${item.productVariant.product.id}`}
                            className="font-medium text-blue-950 hover:underline"
                        >
                            {item.productVariant.product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            {item.productVariant.unitLabel} · {item.pricingType}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="px-4 py-4">{formatNaira(unitPrice)}</TableCell>
            <TableCell className="px-4 py-4">
                <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 rounded-md"
                />
            </TableCell>
            <TableCell className="px-4 py-4 font-medium">{formatNaira(unitPrice * quantity)}</TableCell>
        </TableRow>
    );
}