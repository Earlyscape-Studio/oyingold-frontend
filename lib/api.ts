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
    images: string[];
    isFeatured: boolean;
    category: Category;
    brand: Brand;
    variants: ProductVariant[]
    createdAt: string
}


export type Me = {
    id: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
}

export type DashboardStats = {
    sales:{
        today: number;
        month: number;
        todayOrderCount: number;
        monthOrderCount: number;
        averageOrderValueMonth: number;
    };
    recentOrders: {
        id: string;
        status: string;
        totalAmount: string;
        createdAt: string;
        user: {id: string; email: string}
    }[];
    lowStockVariants: {
        id: string;
        sku: string;
        unitLabel: string;
        stockLevel: number;
        lowStockThreshold: number;
        productName: string;
    }[];
    note: string;
}


export type UpdateProductInput = {
    name?: string;
    description?: string | null;
    categoryId?: string;
    brandId?: string;
    isFeatured?: boolean;
    images?: string[]
}

export type CreateProductInput = {
    name: string;
    description?: string | null;
    categoryId: string;
    brandId: string;
    images?: string[];
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

export type UpdateVariantInput = {
    sku?: string;
    unitLabel?: string;
    unitsPerCarton?: number;
    cartonPrice?: string;
    piecePrice?: string | null;
    stockLevel?: number;
    lowStockThreshold?: number;
}

export type CategoryOrBrandInput = {
    name?: string;
    slug?: string;
}

export type OrderStatus = 
    | "PENDING_PAYMENT"
    | "UNFULFILLED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export type OrderItemDetail = {
    id: string;
    quantity: number;
    unitPrice: number;
    pricingType: "CARTON" | "PIECE";
    productVariant: ProductVariant & {
        product: {
            id: string;
            name: string;
        };
    };
};


export type Order = {
    id: string;
    status: OrderStatus;
    totalAmount: string;
    trackingNumber: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
    };
    items: OrderItemDetail[];
}

export type UpdateOrderInput = {
    status: OrderStatus,
    trackingNumber?: string | null;
}

type ProductListParams = {
    category?: string;
    brand?: string;
    q?: string;
}


export type PricingType = "carton" | "piece";

export type CartItem = {
    id: string;
    cartId: string;
    productVariantId: string;
    pricingType: PricingType;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    productVariant: ProductVariant & {
        product: Product;
    }
}


export type Cart = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    items: CartItem[];
}

export type CartItemInput = {
    productVariantId: string;
    pricingType: PricingType;
    quantity?: number;
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


//----------------------Products---------



export async function getProducts(
    params: ProductListParams = {}
): Promise<Product[]>{
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set("category", params.category);
    if (params.brand) searchParams.set("brand", params.brand);
    if (params.q) searchParams.set("q", params.q);


    const res = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
        // next: {revalidate: 30}
        cache: "no-store"
    });

    if(!res.ok){
        throw new Error(`Failed to fetch products, ${res.status}`);
    }

    return res.json();
}

export async function getProduct(id: string): Promise<Product | null>{
    const res = await fetch(`${API_URL}/products/${id}`, {
        // next: {revalidate: 30}
        cache: "no-store"
    });

    if(res.status === 404) return null;
    if(!res.ok){
        throw new Error(`Failed to fetch product ${id}, ${res.status}`);;
    }

    return res.json();
}


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



export function getStartingPrice(product:Product) : {amount: string; unit: "piece" | "carton"} | null {

    if(product.variants.length === 0) return null;

    let best: {amount: string; unit: "piece" | "carton"} | null = null;

    for (const v of product.variants) {
      const candidate =  v.piecePrice
        ? {amount: v.piecePrice, unit: "piece" as const}
        : {amount: v.cartonPrice, unit: "carton" as const};

      if (!best || parseFloat(candidate.amount) < parseFloat(best.amount)){
        best = candidate
      }
    }

    return best;

}


export async function deleteProduct(
    id: string,
    accessToken: string,
): Promise<{ok: true} | {ok: false; error: string}>{

    const res = await fetch(`${API_URL}/product/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })


    if(!res.ok){
        const data = await res.json().catch(() => null);
        return {ok: false, error: data?.error ?? `Failed to delete product, ${res.status}`};
    }



    return {ok: true};
}


export async function updateProduct(id: string, input: UpdateProductInput, accessToken: string): Promise<{ok: true; product: Product} | {ok: false; error: string}> {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    });

    const data = await res.json();


    if(!res.ok){
        return {ok: false, error: data?.error ?? "Failed to update product"};
    }


    return {ok: true, product: data};
}


export async function updateProductVariant(
    productId: string,
    variantId: string,
    input: UpdateVariantInput,
    accessToken: string
): Promise<{ok: true; variant: ProductVariant} | {ok: false, error: string}>{
    const res = await fetch(`${API_URL}/products/%${productId}/variants/${variantId}`,{
        method: "PATCH",
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    });

    const data = await res.json();

    if(!res.ok){
        return {ok: false, error: `Failed to update variant`};
    }

    return {ok: true, variant: data};
}



export async function getMe(accessToken: string): Promise<Me | null> {
    const res = await fetch(`${API_URL}/me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
    });

    if(!res.ok) return null;

    return res.json();
}


export async function getDashboardStats(accessToken: string): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store",
    });

    if(!res.ok){
        throw new Error(`Failed to fetch dashboard stats, ${res.status}`);
    }

    return res.json();
}



async function createEntity(
    resource: "categories" | "brands",
    input: {name: string; slug: string},
    accessToken: string,
): Promise<{ok: true; data: Category | Brand} | {ok: false; error: string}>{
    const res = await fetch(`${API_URL}/${resource}`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    });

    const data = await res.json();


    if(!res.ok){
        return {ok: false, error: data?.error ?? `Failed to create ${resource.slice(0, -1)}`}
    }



    return {ok: true, data};
}


async function updateEntity(
    resource: "categories" | "brands",
    id: string,
    input: CategoryOrBrandInput,
    accessToken: string
) : Promise<{ok: true, data: Category | Brand} | {ok: false, error: string}>{
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    });

    const data = await res.json();

    if(!res.ok){
        return {ok: false, error: data?.error ?? `Failed to update ${resource.slice(0, -1)}`};
    }

    return {ok: true, data};
    
}


async function deleteEntity(
    resource: "categories"  | "brands",
    id: string,
    accessToken: string
): Promise<{ok: true} | {ok: false, error: string}>{
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if(!res.ok){
        const data = await res.json().catch(() => null);
        return {ok: false, error: data?.error ?? `Failed to delete ${resource.slice(0, -1)}`};
    }

    return {ok: true};
}





export const createCategory = (input: {name: string; slug: string}, token: string) => createEntity("categories", input, token);
export const updateCategory = (id: string, input: CategoryOrBrandInput, token: string) => updateEntity("categories", id, input, token);
export const deleteCategory = (id: string, token: string) => deleteEntity("categories", id, token);


export const createBrand = (input: {name: string; slug: string}, token: string) => createEntity("brands", input, token);
export const updateBrand = (id: string, input: CategoryOrBrandInput, token: string) => updateEntity("brands", id, input, token);
export const deleteBrand = (id: string, token: string) => deleteEntity("brands" , id, token);



//---------------------Orders -----------------------------------
export async function getOrders(
    accessToken: string,
    status?: OrderStatus
): Promise<Order[]> {

    const url = new URL(`${API_URL}/orders`);
    if(status) url.searchParams.set("status", status);

    
    const res = await fetch(url.toString(),{
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
    });

    if(!res.ok){
        throw new Error(`Failed to fetch orders ${res.status}`);
    }

    return res.json();
}


export async function getOrder(
    id: string,
    accessToken: string
): Promise<Order | null> {
    const res = await fetch(`${API_URL}/orders/${id}`, {
        headers:{
            Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
    });

    if(res.status === 404) return null;
    if(!res.ok){
        throw new Error(`Failed to fetch order, ${res.status}`);
    }

    return res.json();
}


export async function updateOrderStatus(
    id: string,
    input: UpdateOrderInput,
    accessToken: string
): Promise<{ok: true; order: Order} | {ok: false; error: string}>{

    const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    });

    const data = await res.json();


    if(!res.ok){
        return {ok: false, error: data?.error ??  "Failed to update order status"};
    }


    return {ok: true, order: data};
}


//-------------------------Cart----------------------

export function getCartItemUnitPrice (item: CartItem): number {
    const price = item.pricingType === "piece"
            ? item.productVariant.piecePrice
            : item.productVariant.cartonPrice

    return price ? parseFloat(price) : 0

}


export function getCartTotal(cart: Cart | null): number{
    if(!cart) return 0;
    return cart.items.reduce(
        (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
        0
    );
}


export function getCartItemCount(cart: Cart | null) : number{
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}



export async function getCart(accessToken: string): Promise<Cart> {
    const res = await fetch(`${API_URL}/cart`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
    });


    if(!res.ok){
        throw new Error(`Failed to fetch cart ${res.status}`);
    }

    return res.json();
}


export async function addCartItem(
    input: CartItemInput,
    accessToken: string
): Promise<{ok: true, cart: Cart} | {ok: false, error: string}> {
    const res = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(input)
    })

    const data = await res.json();


    if(!res.ok){
        return {ok: false, error: data?.error ?? "Failed to add item to cart"};
    }

    return {ok: true, cart: data};
}


export async function updateCartItemQuantity(
    itemId: string,
    quantity: number,
    accessToken: string
): Promise<{ok: true, cart: Cart} | {ok: false, error: string}>{
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({quantity})
    });

    const data = await res.json();


    if(!res.ok){
        return {ok: false, error: data?.error ?? "Failed to update cart item"}
    }

    return {ok: true, cart: data};
}




export async function removeCartItem(
    itemId: string,
    accessToken: string
): Promise<{ok: true, cart: Cart} | {ok: false, error: string}> {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });


    const data = await res.json()

    if(!res.ok){
        return {ok: false, error: data?.error ?? "Failed to remove cart item"}
    }

    return {ok: true, cart: data}
}



export async function clearCart(
    accessToken: string
): Promise<{ok: true} | {ok: false, error: string}>{
    const res = await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })


    if(!res.ok){
        const data = await res.json().catch(() => null);
        return {ok: false, error: data?.error ?? "Failed to clear cart"}
    }

    return {ok: true};
}