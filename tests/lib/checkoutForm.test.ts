import { describe, it, expect } from "vitest";
import {
    EMPTY_FORM,
    buildCheckoutPayload,
    firstInvalidField,
    getDeliveryState,
    normalizeLocation,
    splitFullName,
    validateCheckoutForm,
    type CheckoutFormValues
} from "@/lib/checkout-form";

function validForm(overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues {
    return {
        ...EMPTY_FORM,
        firstName: "Ada",
        lastName: "Nwosu",
        address: "25 City Drive",
        state: "Lagos",
        lga: "Eti-Osa",
        city: "Victoria Island",
        email: "ada@example.com",
        phone: "+234 812 3456 789",
        ...overrides
    };
}

describe("validateCheckoutForm", () => {
    it("accepts a complete form", () => {
        expect(validateCheckoutForm(validForm())).toEqual({});
    });

    it("flags missing required fields", () => {
        const errors = validateCheckoutForm(EMPTY_FORM);
        expect(Object.keys(errors).sort()).toEqual(
            ["address", "city", "email", "firstName", "lastName", "lga", "phone", "state"].sort()
        );
    });

    it("rejects a bad email, phone and state", () => {
        const errors = validateCheckoutForm(
            validForm({ email: "not-an-email", phone: "abc", state: "Atlantis" })
        );
        expect(errors.email).toBeDefined();
        expect(errors.phone).toBeDefined();
        expect(errors.state).toBeDefined();
    });

    it("requires a local government that belongs to the chosen state", () => {
        expect(validateCheckoutForm(validForm({ lga: "" })).lga).toBeDefined();
        // Ikeja is in Lagos, not Oyo.
        expect(validateCheckoutForm(validForm({ state: "Oyo", lga: "Ikeja" })).lga).toBeDefined();
        expect(validateCheckoutForm(validForm({ state: "Oyo", lga: "Ibadan North" })).lga).toBeUndefined();
    });

    it("checks the delivery local government when shipping elsewhere", () => {
        const ship = { shipToDifferent: true, shipFullName: "Chidi Okafor", shipPhone: "08011112222", shipStreet: "4 Market Road", shipCity: "Ibadan", shipState: "Oyo" };

        expect(validateCheckoutForm(validForm({ ...ship, shipLga: "" })).shipLga).toBeDefined();
        expect(validateCheckoutForm(validForm({ ...ship, shipLga: "Ikeja" })).shipLga).toBeDefined();
        expect(validateCheckoutForm(validForm({ ...ship, shipLga: "Ibadan North" }))).toEqual({});
    });

    it("validates the delivery address instead of the billing one when shipping elsewhere", () => {
        const errors = validateCheckoutForm(
            validForm({ shipToDifferent: true, address: "", state: "", city: "" })
        );
        expect(errors.address).toBeUndefined();
        expect(errors.state).toBeUndefined();
        expect(errors.shipFullName).toBeDefined();
        expect(errors.shipStreet).toBeDefined();
        expect(errors.shipState).toBeDefined();
        expect(errors.shipLga).toBeDefined();
        expect(errors.lga).toBeUndefined();
        expect(errors.shipCity).toBeDefined();
        expect(errors.shipPhone).toBeDefined();
    });
});

describe("firstInvalidField", () => {
    it("returns the field a person would see first, not validation order", () => {
        expect(firstInvalidField({ email: "x", address: "y" })).toBe("address");
    });

    it("returns null when there are no errors", () => {
        expect(firstInvalidField({})).toBeNull();
    });
});

describe("getDeliveryState", () => {
    it("uses the billing state by default and the delivery state when shipping elsewhere", () => {
        expect(getDeliveryState(validForm())).toBe("Lagos");
        expect(getDeliveryState(validForm({ shipToDifferent: true, shipState: "Oyo" }))).toBe("Oyo");
    });
});

describe("splitFullName", () => {
    it("splits first and last names", () => {
        expect(splitFullName("Ada Nwosu")).toEqual({ firstName: "Ada", lastName: "Nwosu" });
        expect(splitFullName("Ada Ngozi Nwosu")).toEqual({ firstName: "Ada", lastName: "Ngozi Nwosu" });
        expect(splitFullName("Ada")).toEqual({ firstName: "Ada", lastName: "" });
        expect(splitFullName(null)).toEqual({ firstName: "", lastName: "" });
    });
});

describe("normalizeLocation", () => {
    it("keeps a local government that fits its state", () => {
        const values = validForm();
        expect(normalizeLocation(values)).toBe(values);
    });

    it("clears a local government when the state changes to one that doesn't contain it", () => {
        expect(normalizeLocation(validForm({ state: "Oyo" })).lga).toBe("");
        expect(
            normalizeLocation(validForm({ shipToDifferent: true, shipState: "Oyo", shipLga: "Ikeja" })).shipLga
        ).toBe("");
    });
});

describe("buildCheckoutPayload", () => {
    it("uses the billing details as the delivery address by default", () => {
        const payload = buildCheckoutPayload(validForm({ notes: "  Leave at gate  " }));
        expect(payload).toEqual({
            paymentMethod: "COD",
            contact: { email: "ada@example.com", phone: "+234 812 3456 789", companyName: undefined },
            shippingAddress: {
                fullName: "Ada Nwosu",
                phone: "+234 812 3456 789",
                street: "25 City Drive",
                city: "Victoria Island",
                state: "Lagos",
                lga: "Eti-Osa",
                country: "Nigeria",
                zipCode: undefined
            },
            notes: "Leave at gate",
            saveAddress: false
        });
    });

    it("uses the separate delivery address when shipping elsewhere", () => {
        const payload = buildCheckoutPayload(
            validForm({
                shipToDifferent: true,
                shipFullName: "Chidi Okafor",
                shipPhone: "08011112222",
                shipStreet: "4 Market Road",
                shipState: "Oyo",
                shipLga: "Ibadan North",
                shipCity: "Ibadan",
                shipZipCode: "200001"
            })
        );
        expect(payload.shippingAddress).toEqual({
            fullName: "Chidi Okafor",
            phone: "08011112222",
            street: "4 Market Road",
            city: "Ibadan",
            state: "Oyo",
            lga: "Ibadan North",
            country: "Nigeria",
            zipCode: "200001"
        });
        // Contact details stay the billing person's.
        expect(payload.contact.email).toBe("ada@example.com");
    });

    it("only sends a checkout mode for card payments", () => {
        expect(buildCheckoutPayload(validForm(), "INLINE").checkoutMode).toBeUndefined();
        expect(
            buildCheckoutPayload(validForm({ paymentMethod: "CARD" }), "INLINE").checkoutMode
        ).toBe("INLINE");
    });
});