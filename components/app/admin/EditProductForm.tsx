import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { updateProduct } from "@/lib/api";
import { uploadProductImages } from "@/lib/upload";
import type { Product, Category, Brand } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";


export function EditProductForm({
    product,
    categories,
    brands
}: {
    product: Product;
    categories: Category[];
    brands: Brand[]
}) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [categoryId, setCategoryId] = useState(product.category.id);
    const [brandId, setBrandId] = useState(product.brand.id);
    const [isFeatured, setIsFeatured] = useState(product.isFeatured);
    const [existingImages, setExistingImages] = useState<string[]>(product.images);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false);


    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));


    function handleImagesSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setNewFiles((prev) => [...prev, ...files]);
        e.target.value = "";
    }

    function removeExistingImage(url: string) {
        setExistingImages((prev) => prev.filter((u) => u !== url));
    }


    function removeNewFile(index: number) {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    }


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setSubmitting(true);



        const form = new FormData(e.currentTarget);

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;



        if (!accessToken) {
            setError("Your session has ended. Please sign in again.");
            setSubmitting(false);
            return;
        }

        let images = existingImages;

        if (newFiles.length > 0) {
            setUploadingImages(true);
            const uploadResult = await uploadProductImages(newFiles);
            setUploadingImages(false);

            if (!uploadResult.ok) {
                setError(uploadResult.error);
                setSubmitting(false);
                return;
            }

            images = [...existingImages, ...uploadResult.urls];
        }


        const result = await updateProduct(
            product.id,
            {
                name: String(form.get("name") ?? ""),
                description: String(form.get("description") ?? "") || null,
                categoryId,
                brandId,
                isFeatured,
                images
            },
            accessToken
        );


        setSubmitting(true);



        if (!result.ok) {
            setError(result.error);
            return;
        }

        setNewFiles([]);
        setExistingImages([]);
        setSuccess(true);
        router.refresh();
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </p>
            )}

            {success && (
                <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-700">
                    Product updated.
                </p>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Product name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            defaultValue={product.name}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            rows={3}
                            defaultValue={product.description ?? ""}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Brand</Label>
                            <Select value={brandId} onValueChange={setBrandId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="size-4"
                        />
                        Featured product
                    </label>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(existingImages.length > 0 || newFiles.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {existingImages.map((url) => (
                                <div key={url} className="group relative aspect-square">
                                    <Image
                                        src={url}
                                        alt="Product image"
                                        fill
                                        className="rounded-md object-cover"
                                        unoptimized
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(url)}
                                        className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
                                        aria-label="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {newPreviewUrls.map((url, i) => (
                                <div key={url} className="group relative aspect-square">
                                    <Image
                                        src={url}
                                        alt="New image preview"
                                        fill
                                        className="rounded-md object-cover ring-2 ring-primary/50"
                                        unoptimized
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewFile(i)}
                                        className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
                                        aria-label="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesSelected}
                    />
                    <p className="text-xs text-muted-foreground">
                        Newly added photos (outlined) upload when you save changes.
                    </p>
                </CardContent>
            </Card>

            <Button type="submit" disabled={submitting}>
                {uploadingImages
                    ? "Uploading images…"
                    : submitting
                        ? "Saving…"
                        : "Save changes"}
            </Button>
        </form>
    );
}