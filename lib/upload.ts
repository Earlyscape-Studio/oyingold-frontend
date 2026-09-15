import {supabase} from "@/lib/supabase-client";


const BUCKET = "product-images";


export async function uploadProductImages(
    files: File[]
): Promise<{ok: true; urls: string[]} | {ok: false; error: string}>{

    const urls: string[] = [];

    for(const file of files){
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;

        const {error}  = await supabase.storage
            .from(BUCKET)
            .upload(path, file, {cacheControl: "36000", upsert: false});

        if (error){
            return {ok: false, error: `Failed to upload ${file.name}: ${error.message}`};
        }

        const {data} = await supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
    }

    return {ok: true, urls};
}