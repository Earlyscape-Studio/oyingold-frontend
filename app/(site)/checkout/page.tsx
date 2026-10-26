import Link from "next/link";
import { CheckoutClient } from "@/components/app/checkout/CheckoutClient";

export default function CheckoutPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/">Home</Link>
                <span>›</span>
                <span className="text-blue-950">Checkout</span>
            </nav>

            <h1 className="mt-4 text-2xl font-bold text-blue-950">Checkout</h1>

            <div className="mt-8">
                <CheckoutClient />
            </div>
        </div>
    );
}