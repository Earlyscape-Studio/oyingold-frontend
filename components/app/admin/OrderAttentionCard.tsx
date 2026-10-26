"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { resolveOrderAttention, type Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Shown at the top of an order the system has flagged. Marking it resolved is
// the admin saying the problem (refund, call to the customer...) has been dealt with.
export function OrderAttentionCard({
    order,
    onResolved
}: {
    order: Order;
    onResolved: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!order.needsAttention) return null;

    async function handleResolve() {
        setSaving(true);
        setError(null);

        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
            setError("Your session has expired. Please sign in again.");
            setSaving(false);
            return;
        }

        const result = await resolveOrderAttention(order.id, accessToken);
        setSaving(false);

        if (!result.ok) {
            setError(result.error);
            return;
        }

        onResolved();
    }

    return (
        <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
                <CardTitle className="text-sm text-destructive">Needs attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm">
                    {order.needsAttentionReason ?? "This order was flagged for review."}
                </p>
                <p className="text-xs text-muted-foreground">
                    Sort the issue out first (refund, contact the customer, adjust the order), then
                    mark it as resolved so it drops off the attention list.
                </p>

                {error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <Button onClick={handleResolve} disabled={saving} variant="outline">
                    {saving ? "Saving…" : "Mark as resolved"}
                </Button>
            </CardContent>
        </Card>
    );
}