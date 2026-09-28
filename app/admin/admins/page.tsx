"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { getAdmins, inviteAdmin, type AdminUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableHeader,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table";


async function getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}


export default function AdminAdminsPage() {
    const [admins, setAdmins] = useState<AdminUser[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);


    const loadAdmins = useCallback(async () => {
        const token = await getToken();

        if (!token) {
            setLoadError("Session expired.");
            return;
        }

        try {
            const list = await getAdmins(token);
            setAdmins(list);
        } catch {
            setLoadError("Couldn't load admins.");
        }
    }, []);


    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);


    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setAddError(null);
        setAdding(true);

        const token = await getToken();
        if (!token) {
            setAddError("Session expired.");
            setAdding(false);
            return;
        }

        const result = await inviteAdmin(email, token);

        setAdding(false);

        if (!result.ok) {
            setAddError(result.error);
            return;
        }

        setEmail("");
        await loadAdmins();
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Admins</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    People with access to this dashboard. New admins sign in with
                    email + a one-time code &mdash; no password.
                </p>
            </div>

            <form
                onSubmit={handleAdd}
                className="flex flex-wrap items-end gap-3 rounded-md border p-4"
            >
                <div className="flex-1 space-y-1" style={{ minWidth: "16rem" }}>
                    <label className="text-xs text-muted-foreground">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@oyingoldretail.com"
                        required
                    />
                </div>
                <Button type="submit" disabled={adding}>
                    {adding ? "Adding…" : "Add admin"}
                </Button>
                {addError && (
                    <p className="w-full text-sm text-destructive">{addError}</p>
                )}
            </form>

            {loadError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {loadError}
                </p>
            )}

            {admins === null ? (
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            ) : admins.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No admins yet.
                </p>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">
                                        {admin.email}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}