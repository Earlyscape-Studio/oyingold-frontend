import { isNigerianState } from "@/lib/nigeria-states";
import type { CheckoutMode, CreateOrderInput, PaymentMethod } from "@/lib/checkout-api";

// Same rules as the API, so most mistakes are caught before a request is made.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;

export type CheckoutFormValues = {
    firstName: string;
    lastName: string;
    companyName: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    email: string;
    phone: string;

    shipToDifferent: boolean;
    shipFullName: string;
    shipPhone: string;
    shipStreet: string;
    shipState: string;
    shipCity: string;
    shipZipCode: string;

    notes: string;
    saveAddress: boolean;
    paymentMethod: PaymentMethod;
}

export type FieldErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export const EMPTY_FORM: CheckoutFormValues = {
    firstName: "",
    lastName: "",
    companyName: "",
    address: "",
    country: "Nigeria",
    state: "",
    city: "",
    zipCode: "",
    email: "",
    phone: "",

    shipToDifferent: false,
    shipFullName: "",
    shipPhone: "",
    shipStreet: "",
    shipState: "",
    shipCity: "",
    shipZipCode: "",

    notes: "",
    saveAddress: false,
    paymentMethod: "COD"
};

// Visual order of the form, so submit can focus the first invalid field a person would see.
const FIELD_ORDER: (keyof CheckoutFormValues)[] = [
    "firstName", "lastName", "companyName", "address", "state", "city", "zipCode",
    "email", "phone",
    "shipFullName", "shipPhone", "shipStreet", "shipState", "shipCity", "shipZipCode",
    "notes"
];

export function firstInvalidField(errors: FieldErrors): keyof CheckoutFormValues | null {
    return FIELD_ORDER.find((key) => errors[key]) ?? null;
}

export function splitFullName(fullName: string | null | undefined): {firstName: string; lastName: string} {
    const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return {firstName: "", lastName: ""};
    return {firstName: parts[0], lastName: parts.slice(1).join(" ")};
}

// The state that decides shipping: the delivery address, not the billing one.
export function getDeliveryState(values: CheckoutFormValues): string {
    return values.shipToDifferent ? values.shipState : values.state;
}

export function validateCheckoutForm(values: CheckoutFormValues): FieldErrors {
    const errors: FieldErrors = {};

    const required = (key: keyof CheckoutFormValues, label: string, max = 200) => {
        const value = String(values[key]).trim();
        if (!value) errors[key] = `${label} is required`;
        else if (value.length > max) errors[key] = `${label} is too long`;
    };

    required("firstName", "First name", 100);
    required("lastName", "Last name", 100);

    const email = values.email.trim();
    if (!email) errors.email = "Email is required";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address";

    const phone = values.phone.trim();
    if (!phone) errors.phone = "Phone number is required";
    else if (!PHONE_RE.test(phone)) errors.phone = "Enter a valid phone number";

    if (values.companyName.trim().length > 200) errors.companyName = "Company name is too long";
    if (values.notes.trim().length > 1000) errors.notes = "Notes can be at most 1000 characters";

    if (values.shipToDifferent) {
        required("shipFullName", "Full name", 200);
        required("shipStreet", "Address", 300);
        required("shipCity", "City", 100);

        const shipPhone = values.shipPhone.trim();
        if (!shipPhone) errors.shipPhone = "Phone number is required";
        else if (!PHONE_RE.test(shipPhone)) errors.shipPhone = "Enter a valid phone number";

        if (!values.shipState) errors.shipState = "Select a state";
        else if (!isNigerianState(values.shipState)) errors.shipState = "Select a valid state";

        if (values.shipZipCode.trim().length > 20) errors.shipZipCode = "Zip code is too long";
    } else {
        // Billing address fields double as the delivery address.
        required("address", "Address", 300);
        required("city", "City", 100);

        if (!values.state) errors.state = "Select a state";
        else if (!isNigerianState(values.state)) errors.state = "Select a valid state";

        if (values.zipCode.trim().length > 20) errors.zipCode = "Zip code is too long";
    }

    return errors;
}

// Builds the API body. Only call this after validateCheckoutForm passes.
export function buildCheckoutPayload(
    values: CheckoutFormValues,
    checkoutMode?: CheckoutMode
): CreateOrderInput {
    const optional = (value: string) => value.trim() || undefined;

    const shippingAddress: CreateOrderInput["shippingAddress"] = values.shipToDifferent
        ? {
            fullName: values.shipFullName.trim(),
            phone: values.shipPhone.trim(),
            street: values.shipStreet.trim(),
            city: values.shipCity.trim(),
            state: values.shipState,
            country: values.country,
            zipCode: optional(values.shipZipCode)
        }
        : {
            fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
            phone: values.phone.trim(),
            street: values.address.trim(),
            city: values.city.trim(),
            state: values.state,
            country: values.country,
            zipCode: optional(values.zipCode)
        };

    return {
        paymentMethod: values.paymentMethod,
        ...(values.paymentMethod === "CARD" && checkoutMode ? {checkoutMode} : {}),
        contact: {
            email: values.email.trim(),
            phone: values.phone.trim(),
            companyName: optional(values.companyName)
        },
        shippingAddress,
        notes: optional(values.notes),
        saveAddress: values.saveAddress
    };
}