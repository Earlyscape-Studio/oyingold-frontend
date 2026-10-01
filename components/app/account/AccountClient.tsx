"use client";

import { useEffect, useState } from "react";
import { RequireCustomerSession } from "@/components/app/RequireCustomerSession";
import { AccountDetailsCard } from "@/components/app/account/AccountDetailsCard";
import { DeliveryAddressCard } from "@/components/app/account/DeliveryAddressCard";
import { MyOrders } from "@/components/app/account/MyOrders";
import { useAuth } from "@/lib/auth-context";
import { getMyAddresses, type SavedAddress } from "@/lib/api";

export function AccountClient() {
    return (
        <RequireCustomerSession>
            <AccountContent />
        </RequireCustomerSession>
    );
}

function AccountContent() {
    const { session, user } = useAuth();
    const accessToken = session?.access_token;

    // undefined = loading, null = failed
    const [addresses, setAddresses] = useState<SavedAddress[] | null | undefined>(undefined);

    useEffect(() => {
        if (!accessToken) return;

        let cancelled = false;

        getMyAddresses(accessToken)
            .then((result) => {
                if (!cancelled) setAddresses(result);
            })
            .catch(() => {
                if (!cancelled) setAddresses(null);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    if (!accessToken) return null;

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-6">
                <AccountDetailsCard user={user} />
                <DeliveryAddressCard addresses={addresses} />
            </aside>

            <MyOrders accessToken={accessToken} />
        </div>
    );
}