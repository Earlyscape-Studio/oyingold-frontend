import type { InlineConfig } from "@/lib/checkout-api";

// FCMB's inline checkout script. It adds a global SeerBit() function that opens
// the payment popup on our own page.
const SCRIPT_URL = "https://checkout.seerbitapi.com/api/v2/seerbit.js";
const LOAD_TIMEOUT_MS = 10_000;

declare global {
    interface Window {
        SeerBit?: (
            config: Record<string, unknown>,
            onComplete: (response: unknown, close: () => void) => void,
            onClose: (close?: unknown) => void
        ) => void;
    }
}

let loading: Promise<void> | null = null;

/** Loads FCMB's script once. Rejects if it can't load (blocked, offline, slow). */
export function loadInlineScript(): Promise<void> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Not in a browser"));
    }
    if (typeof window.SeerBit === "function") return Promise.resolve();
    if (loading) return loading;

    loading = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.async = true;

        const fail = (message: string) => {
            script.remove();
            loading = null; // allow another attempt
            reject(new Error(message));
        };

        const timer = window.setTimeout(
            () => fail("Timed out loading the payment popup"),
            LOAD_TIMEOUT_MS
        );

        script.onload = () => {
            window.clearTimeout(timer);
            if (typeof window.SeerBit === "function") resolve();
            else fail("The payment popup did not initialise");
        };
        script.onerror = () => {
            window.clearTimeout(timer);
            fail("Could not load the payment popup");
        };

        document.head.appendChild(script);
    });

    return loading;
}

/**
 * Opens the popup. `onComplete` fires when FCMB reports a result and `onClose`
 * when the customer closes the popup. Neither says whether the payment worked:
 * the server asks FCMB for that.
 */
export function openInlineCheckout(
    config: InlineConfig,
    handlers: { onComplete: () => void; onClose: () => void }
) {
    if (typeof window.SeerBit !== "function") {
        throw new Error("The payment popup is not loaded");
    }

    window.SeerBit(
        {
            tranref: config.reference,
            currency: config.currency,
            country: config.country,
            description: config.description,
            amount: config.amount,
            email: config.email,
            ...(config.fullName ? { full_name: config.fullName } : {}),
            callbackurl: config.callbackUrl,
            public_key: config.publicKey,
            // The amount is ours; the customer must not be able to change it.
            setAmountByCustomer: false,
            close_on_success: true
        },
        (_response, close) => {
            handlers.onComplete();
            try {
                close();
            } catch {
                // The popup may already be closing.
            }
        },
        () => handlers.onClose()
    );
}