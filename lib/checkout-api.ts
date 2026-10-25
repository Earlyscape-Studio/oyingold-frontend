import type { CustomerOrder } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Flip to true once the FCMB payment step is wired up. Until then the card
// option is shown but can't be selected, so no unpayable PENDING_PAYMENT
// orders get created.
export const CARD_PAYMENTS_ENABLED = false;

export type PaymentMethod = "CARD" | "COD";
export type CheckoutMode = "INLINE" | "STANDARD";

export type Totals = {
    subtotal: number;
    shippingFee: number;
    paymentFee: number;
    discount: number;
    total: number;
}

export type CheckoutQuotes = Record<PaymentMethod, Totals>;

export type CreateOrderInput = {
    paymentMethod: PaymentMethod;
    checkoutMode?: CheckoutMode;
    contact: {
        email: string;
        phone: string;
        companyName?: string;
    };
    shippingAddress: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode?: string;
    };
    notes?: string;
    saveAddress?: boolean;
}

// CustomerOrder plus the checkout fields the API now returns.
export type PlacedOrder = CustomerOrder & {
    subtotal: number;
    shippingFee: number;
    paymentFee: number;
    discount: number;
    paymentMethod: PaymentMethod;
}

export type PaymentInit = {
    reference: string;
    amount: number;
    checkoutMode: CheckoutMode;
}

export type StockShortage = {
    name: string;
    requested?: number;
    available?: number;
}

const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again.";


export async function getCheckoutQuote(
    state: string,
    accessToken: string
): Promise<{ok: true; quotes: CheckoutQuotes} | {ok: false; error: string}> {
    const url = new URL(`${API_URL}/checkout/quote`);
    if (state) url.searchParams.set("state", state);

    let res: Response;
    try {
        res = await fetch(url.toString(), {
            headers: {Authorization: `Bearer ${accessToken}`},
            cache: "no-store"
        });
    } catch {
        return {ok: false, error: NETWORK_ERROR};
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.quotes) {
        return {ok: false, error: data?.error ?? "Couldn't calculate your totals."};
    }

    return {ok: true, quotes: data.quotes};
}


export async function createOrder(
    input: CreateOrderInput,
    accessToken: string
): Promise<
    | {ok: true; order: PlacedOrder; payment?: PaymentInit}
    | {ok: false; error: string; shortages?: StockShortage[]}
> {
    let res: Response;
    try {
        res = await fetch(`${API_URL}/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(input)
        });
    } catch {
        return {ok: false, error: NETWORK_ERROR};
    }

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.order) {
        return {
            ok: false,
            error: data?.error ?? "We couldn't place your order. Please try again.",
            shortages: data?.shortages ?? undefined
        };
    }

    return {ok: true, order: data.order, payment: data.payment};
}