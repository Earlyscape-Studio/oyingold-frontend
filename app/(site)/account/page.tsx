import type { Metadata } from "next";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";
import { AccountClient } from "@/components/app/account/AccountClient";

export const metadata: Metadata = {
    title: "My Account",
};

export default function AccountPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/" className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Home01Icon} size={16} />
                    Home
                </Link>
                <span>›</span>
                <span className="text-blue-950">My Account</span>
            </nav>

            <h1 className="mt-4 text-3xl font-bold text-blue-950">My Account</h1>

            <div className="mt-10">
                <AccountClient />
            </div>
        </div>
    );
}