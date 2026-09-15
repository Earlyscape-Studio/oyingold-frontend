"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import {
    createCategory,
    updateCategory,
    deleteCategory,
    createBrand,
    updateBrand,
    deleteBrand,
    type Category,
    type Brand,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableHeader,
    TableHead,
    TableRow,
    TableCell
} from "@/components/ui/table";


type Item = Category | Brand;
type Resource = "categories" | "brands";

// type Actions = {
//     create: (input: { name: string; slug: string }, token: string) => Promise<{ ok: true; data: Item } | { ok: false; error: string }>;
//     update: (id: string, input: { name?: string; slug?: string }, token: string) => Promise<{ ok: true, data: Item } | { ok: false; error: string }>;
//     remove: (id: string, token: string) => Promise<{ ok: true } | { ok: false; error: string }>;
// }


type Props = {
    label: string;
    items: Item[];
    resource: Resource;
};



function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}





async function getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}


function EditableRow({
    item,
    resource,
    onDone
}: {
    item: Item;
    // actions: Actions;
    resource: Resource
    onDone: () => void;
}) {
    const [name, setName] = useState(item.name);
    const [slug, setSlug] = useState(item.slug);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);



    async function handleSave() {
        setSaving(true);
        setError(null);

        const token = await getToken();
        if (!token) {
            setError("Session Expired!");
            setSaving(false);
            return;
        }

        const result = resource === "categories"
                ? await updateCategory(item.id, { name, slug }, token)
                : await updateBrand(item.id, { name, slug }, token);


        setSaving(false);

        if (!result.ok) {
            setError(result.error);
            return;
        }

        onDone();
    }


    return (
        <TableRow>
            <TableCell>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </TableCell>
            <TableCell>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </TableCell>
            <TableCell className="text-right">
                <Button size="sm" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving…" : "Save"}
                </Button>
            </TableCell>
        </TableRow>
    );
}


export function NameSlugManager({
    label,
    items,
    resource
}: Props) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [rowError, setRowError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);


    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateError(null);
        setCreating(true);



        const token = await getToken();
        if (!token) {
            setCreateError("Session expired.");
            setCreating(false);
            return;
        }

        const input = {
            name: newName,
            slug: newSlug || slugify(newName),
        };


        const result = resource === "categories"
                ? await createCategory(input, token)
                : await createBrand(input, token);


        setCreating(false);

        if (!result.ok) {
            setCreateError(result.error);
            return;
        }


        setNewName("");
        setNewSlug("");
        router.refresh();
    }


    async function handleDelete(item: Item) {
        const confirmed = window.confirm(`Delete "${item.name}"?`);
        if (!confirmed) return;

        setRowError(null);
        setDeletingId(item.id);


        const token = await getToken();
        if (!token) {
            setRowError("Session Expired");
            setDeletingId(null);
            return;
        }


        const result = resource === "categories"
                ? await deleteCategory(item.id, token)
                : await deleteBrand(item.id, token);
        
        
        setDeletingId(null);


        if (!result.ok) {
            setRowError(result.error);
            return;
        }

        router.refresh();
    }



    return (
        <div className="space-y-4">
            <form
                onSubmit={handleCreate}
                className="flex flex-wrap items-end gap-3 rounded-md border p-4"
            >
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input
                        value={newName}
                        onChange={(e) => {
                            setNewName(e.target.value);
                            if (!newSlug) setNewSlug(slugify(e.target.value));
                        }}
                        placeholder={`New ${label.toLowerCase()} name`}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        placeholder="auto-generated-slug"
                        required
                    />
                </div>
                <Button type="submit" disabled={creating}>
                    {creating ? "Adding…" : `Add ${label.toLowerCase()}`}
                </Button>
                {createError && (
                    <p className="w-full text-sm text-destructive">{createError}</p>
                )}
            </form>

            {rowError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {rowError}
                </p>
            )}

            {items.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No {label.toLowerCase()}s yet.
                </p>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) =>
                                editingId === item.id ? (
                                    <EditableRow
                                        key={item.id}
                                        item={item}
                                        resource={resource}
                                        onDone={() => {
                                            setEditingId(null);
                                            router.refresh();
                                        }}
                                    />
                                ) : (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.slug}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingId(item.id)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingId === item.id}
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    {deletingId === item.id
                                                        ? "Deleting…"
                                                        : "Delete"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}