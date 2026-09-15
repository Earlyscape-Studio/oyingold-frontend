"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { updateOrderStatus, type Order, type OrderStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const STATUS_OPTIONS: OrderStatus[] = [
    "PENDING_PAYMENT",
    "UNFULFILLED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
];



export function OrderStatusForm({ order }: { order: Order }) {
    const router = useRouter();
    const [status, setStatus] = useState<OrderStatus>(order.status);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);


    async function handleSave() {
        setSaving(true);
        setError(null);
        setSuccess(false);



        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
            setError("Your Session has expired. Please sign in again.");
            setSaving(false);
            return;
        }

        const result = await updateOrderStatus(
            order.id,
            { status, trackingNumber: trackingNumber || null },
            accessToken,
        );

        setSaving(false);


        if (!result.ok) {
            setError(result.error);
            return;
        }

        setSuccess(true);
        router.refresh();
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Fulfillment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700">
                        Order updated.
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as OrderStatus)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="trackingNumber">Tracking number</Label>
                        <Input
                            id="trackingNumber"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Update order"}
                </Button>
            </CardContent>
        </Card>
    );
}