import type { CustomerOrder } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Card payments are switched on per environment with
// NEXT_PUBLIC_CARD_PAYMENTS_ENABLED=true (for example on staging while testing
// FCMB, and on production once the live merchant account is approved). While off,
// the card option is shown as "Coming soon" and can't be selected, so no
// unpayable PENDING_PAYMENT orders get created.
export const CARD_PAYMENTS_ENABLED =
    process.env.NEXT_PUBLIC_CARD_PAYMENTS_ENABLED === "true";

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


// ----------------------------- Card payments -----------------------------

// Settings the browser needs to open FCMB's inline popup. The secret key never appears here.
export type InlineConfig = {
    publicKey: string;
    reference: string;
    amount: string; // naira with two decimals, e.g. "22950.00"
    currency: string;
    country: string;
    description: string;
    email: string;
    fullName: string | null;
    callbackUrl: string;
}

export type InitializedPayment =
    | {mode: "STANDARD"; redirectLink: string}
    | {mode: "INLINE"; config: InlineConfig};

export type PaymentVerification = {
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    message?: string;
    order: {id: string; reference: string; status: string} | null;
}

type ApiFailure = {ok: false; error: string; notFound?: boolean};

async function postPayment(
    path: string,
    accessToken: string,
    body?: unknown
): Promise<{ok: true; data: unknown} | ApiFailure> {
    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method: "POST",
            headers: {
                ...(body !== undefined ? {"Content-Type": "application/json"} : {}),
                Authorization: `Bearer ${accessToken}`
            },
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        return {ok: false, error: NETWORK_ERROR};
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return {
            ok: false,
            error: data?.error ?? "Something went wrong with the payment. Please try again.",
            notFound: res.status === 404
        };
    }

    return {ok: true, data};
}


// Starts a payment: a hosted link for standard checkout, or the popup settings for inline.
export async function initializePayment(
    reference: string,
    accessToken: string
): Promise<({ok: true} & InitializedPayment) | ApiFailure> {
    const result = await postPayment(
        `/payments/${encodeURIComponent(reference)}/initialize`,
        accessToken
    );
    if (!result.ok) return result;

    const data = result.data as {
        mode?: string;
        redirectLink?: unknown;
        config?: InlineConfig;
    } | null;

    if (data?.mode === "STANDARD" && typeof data.redirectLink === "string") {
        return {ok: true, mode: "STANDARD", redirectLink: data.redirectLink};
    }
    if (data?.mode === "INLINE" && data.config) {
        return {ok: true, mode: "INLINE", config: data.config};
    }

    return {ok: false, error: "We couldn't start your payment. Please try again."};
}


// A fresh attempt for an unpaid card order: a retry, or a switch between inline and standard.
export async function createPaymentAttempt(
    orderId: string,
    checkoutMode: CheckoutMode,
    accessToken: string
): Promise<{ok: true; payment: PaymentInit} | ApiFailure> {
    const result = await postPayment("/payments", accessToken, {orderId, checkoutMode});
    if (!result.ok) return result;

    const data = result.data as {payment?: PaymentInit} | null;

    if (!data?.payment?.reference) {
        return {ok: false, error: "We couldn't start a new payment. Please try again."};
    }

    return {ok: true, payment: data.payment};
}


// Asks the server what happened to a payment (the server asks FCMB). Safe to repeat.
export async function verifyPayment(
    reference: string,
    accessToken: string
): Promise<{ok: true; result: PaymentVerification} | ApiFailure> {
    const result = await postPayment(
        `/payments/${encodeURIComponent(reference)}/verify`,
        accessToken
    );
    if (!result.ok) return result;

    const data = result.data as PaymentVerification | null;

    if (!data?.paymentStatus) {
        return {ok: false, error: "We couldn't read the payment status. Please check again."};
    }

    return {ok: true, result: data};
}