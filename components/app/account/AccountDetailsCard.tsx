import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMonthYear, getEmailDisplayName } from "@/lib/format";
import type { Me } from "@/lib/api";

export function AccountDetailsCard({ user }: { user: Me | null }) {
    return (
        <Card className="rounded-3xl">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <HugeiconsIcon icon={UserIcon} size={18} className="text-muted-foreground" />
                    Account Details
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-3 border-b pb-6 text-center">
                    <div className="flex size-20 items-center justify-center rounded-full bg-red-100 shadow-md">
                        <HugeiconsIcon icon={UserIcon} size={32} className="text-red-600" />
                    </div>

                    {user ? (
                        <div>
                            <p className="font-medium text-foreground">
                                {user.fullName ?? getEmailDisplayName(user.email)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Skeleton className="mx-auto h-4 w-28" />
                            <Skeleton className="mx-auto h-4 w-40" />
                        </div>
                    )}
                </div>

                <dl className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Member Since</dt>
                        <dd className="text-muted-foreground">
                            {user ? formatMonthYear(user.memberSince) : <Skeleton className="h-4 w-20" />}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Total Order</dt>
                        <dd className="text-muted-foreground">
                            {user ? user.totalOrders : <Skeleton className="h-4 w-8" />}
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    );
}