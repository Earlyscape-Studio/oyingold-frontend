import type { Metadata } from "next";
import Link from "next/link";
import { PaymentResultClient } from "@/components/app/checkout/PaymentResultClient";

export const metadata: Metadata = {
    title: "Payment"
};

// Customers land here after paying (popup closed, or back from FCMB's hosted page).
// What the address says about success is never trusted: the page asks the server,
// which asks FCMB.
export default async function CheckoutCompletePage({
    searchParams
}: {
    searchParams: Promise<{ reference?: string | string[] }>;
}) {
    const { reference } = await searchParams;
    // FCMB may add its own parameters when sending customers back; ours comes first.
    const value = Array.isArray(reference) ? reference[0] : reference;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/">Home</Link>
                <span>›</span>
                <span className="text-blue-950">Payment</span>
            </nav>

            <h1 className="mt-4 text-2xl font-bold text-blue-950">Payment</h1>

            <div className="mt-8">
                <PaymentResultClient reference={value?.trim() || null} />
            </div>
        </div>
    );
}