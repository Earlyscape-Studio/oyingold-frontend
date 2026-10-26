import { describe, it, expect } from "vitest";
import {
    EMPTY_FORM,
    buildCheckoutPayload,
    firstInvalidField,
    getDeliveryState,
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
            ["address", "city", "email", "firstName", "lastName", "phone", "state"].sort()
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

    it("validates the delivery address instead of the billing one when shipping elsewhere", () => {
        const errors = validateCheckoutForm(
            validForm({ shipToDifferent: true, address: "", state: "", city: "" })
        );
        expect(errors.address).toBeUndefined();
        expect(errors.state).toBeUndefined();
        expect(errors.shipFullName).toBeDefined();
        expect(errors.shipStreet).toBeDefined();
        expect(errors.shipState).toBeDefined();
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