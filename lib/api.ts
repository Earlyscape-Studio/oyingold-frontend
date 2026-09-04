const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ProductVariant = {
    id: string;
    productId: string;
    sku: string;
    unitLabel: string;
    unitsPerCarton: number;
    cartonPrice: string;
    piecePrice: string | null;
    stockLevel:number;
    lowStockThreshold: number;
}

export type Category = {
    id: string;
    name: string;
    slug: string;
}


export type Brand = {
    id: string;
    name: string;
    slug: string;
}


export type Product = {
    id: string;
    name: string;
    description: string | null;
    category: Category;
    brand: Brand;
    variants: ProductVariant[]
}


type ProductListParams = {
    category?: string;
    brand?: string;
    q?: string;
}




export async function getProducts(
    params: ProductListParams = {}
): Promise<Product[]>{
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set("category", params.category);
    if (params.brand) searchParams.set("brand", params.brand);
    if (params.q) searchParams.set("q", params.q);


    const res = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
        next: {revalidate: 30}
    });

    if(!res.ok){
        throw new Error(`Failed to fetch products, ${res.status}`);
    }

    return res.json();
}



export async function getProduct(id: string): Promise<Product | null>{
    const res = await fetch(`${API_URL}/products/${id}`, {
        next: {revalidate: 30}
    });

    if(res.status === 404) return null;
    if(!res.ok){
        throw new Error(`Failed to fetch product ${id}, ${res.status}`);;
    }

    return res.json();
}



export async function getCategories(): Promise<Category[]> {

    const res = await fetch(`${API_URL}/categories`, {
        next: {revalidate: 60}
    });

    if(!res.ok){
        throw new Error(`Failed to fetch categories, ${res.status}`);
    }

    return res.json()
}


export async function getBrands(): Promise<Brand[]> {

    const res = await fetch(`${API_URL}/brands`, {
        next: {revalidate: 60}
    });

    if(!res.ok){
        throw new Error(`Failed to fetch brands, ${res.status}`);
    }

    return res.json()
}


export type CreateProductInput = {
    name: string;
    description?: string | null;
    categoryId: string;
    brandId: string;
    variant: {
        sku: string;
        unitLabel: string;
        unitsPerCarton: number;
        cartonPrice: string;
        piecePrice?: string;
        stockLevel: number;
        lowStockThreshold: number;
    };
};


export async function createProduct (
    input: CreateProductInput,
    accessToken: string
): Promise<{ok: true; product: Product} | {ok: false; error: string}> {
    const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    });

    const data = await res.json()


    if(!res.ok){
        return {ok: false, error: data?.error ?? 'Failed to create product'};
    }

    return {ok: true, product: data};
}

