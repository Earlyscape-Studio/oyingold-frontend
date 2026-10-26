import {
    createPaymentAttempt,
    initializePayment
} from "@/lib/checkout-api";
import { loadInlineScript, openInlineCheckout } from "@/lib/fcmb-inline";

export type StartPaymentResult = { ok: true } | { ok: false; error: string };

/**
 * Takes the customer to pay for a card payment attempt.
 *
 * Inline checkout opens FCMB's popup on our page. If the popup can't load (script
 * blocked, offline), it falls back to standard checkout by starting a fresh attempt
 * and sending the customer to FCMB's hosted page. Standard checkout redirects straight away.
 *
 * `onFinished` receives the reference of the attempt actually used, once the popup has
 * completed or been closed. It does not mean the payment worked: the caller should send
 * the customer to the result page, which asks the server.
 */
export async function startCardPayment(input: {
    reference: string;
    orderId: string;
    accessToken: string;
    onFinished: (reference: string) => void;
}): Promise<StartPaymentResult> {
    const { reference, orderId, accessToken, onFinished } = input;

    const init = await initializePayment(reference, accessToken);
    if (!init.ok) return { ok: false, error: init.error };

    if (init.mode === "STANDARD") {
        window.location.assign(init.redirectLink);
        return { ok: true };
    }

    try {
        await loadInlineScript();
    } catch {
        return redirectToStandardCheckout(orderId, accessToken);
    }

    // The popup can report both a result and a close; only the first counts.
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        onFinished(init.config.reference);
    };

    try {
        openInlineCheckout(init.config, { onComplete: finish, onClose: finish });
    } catch {
        return redirectToStandardCheckout(orderId, accessToken);
    }

    return { ok: true };
}

async function redirectToStandardCheckout(
    orderId: string,
    accessToken: string
): Promise<StartPaymentResult> {
    const attempt = await createPaymentAttempt(orderId, "STANDARD", accessToken);
    if (!attempt.ok) return { ok: false, error: attempt.error };

    const init = await initializePayment(attempt.payment.reference, accessToken);
    if (!init.ok) return { ok: false, error: init.error };
    if (init.mode !== "STANDARD") {
        return { ok: false, error: "We couldn't start your payment. Please try again." };
    }

    window.location.assign(init.redirectLink);
    return { ok: true };
}