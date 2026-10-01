import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedAddress } from "@/lib/api";

type Props = {
    // undefined while loading, null when the request failed
    addresses: SavedAddress[] | null | undefined;
};

export function DeliveryAddressCard({ addresses }: Props) {
    // Read-only for now: show the last used address, else the default, else the newest.
    const address = addresses
        ? (addresses.find((a) => a.isLastUsed) ?? addresses.find((a) => a.isDefault) ?? addresses[0])
        : undefined;

    return (
        <Card className="rounded-3xl">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <HugeiconsIcon icon={Location01Icon} size={18} className="text-muted-foreground" />
                    Delivery Address
                </CardTitle>
            </CardHeader>

            <CardContent>
                {addresses === undefined ? (
                    <Skeleton className="h-32 w-full rounded-xl" />
                ) : addresses === null ? (
                    <p className="text-sm text-muted-foreground">
                        We couldn&apos;t load your address right now.
                    </p>
                ) : !address ? (
                    <p className="text-sm text-muted-foreground">
                        No delivery address yet. We&apos;ll save one when you place your first order.
                    </p>
                ) : (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-4">
                        {address.isLastUsed && (
                            <span className="inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-blue-950">
                                Last Used
                            </span>
                        )}
                        <p className="mt-2 font-medium text-foreground">{address.fullName}</p>
                        <address className="mt-1 text-sm leading-6 text-muted-foreground not-italic">
                            {address.street}
                            <br />
                            {address.city}, {address.state}
                            <br />
                            {address.country}
                            <br />
                            {address.phone}
                        </address>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}