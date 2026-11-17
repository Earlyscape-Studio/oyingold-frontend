"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { NIGERIAN_STATES, getLgas } from "@/lib/nigeria-locations";
import type { CheckoutFormValues, FieldErrors } from "@/lib/checkout-form";
import { Field } from "./Field";

type Props = {
    values: CheckoutFormValues;
    errors: FieldErrors;
    disabled: boolean;
    onChange: (patch: Partial<CheckoutFormValues>) => void;
};

function OptionSelect({
    name,
    value,
    options,
    placeholder = "Select...",
    error,
    disabled,
    onChange
}: {
    name: string;
    value: string;
    options: readonly string[];
    placeholder?: string;
    error?: string;
    disabled: boolean;
    onChange: (value: string) => void;
}) {
    return (
        // Radix also reports a blank value while the options of a freshly filled select are
        // still mounting. There is no blank choice a person can pick, so blanks are ignored
        // rather than allowed to wipe a value that a saved address just filled in.
        <Select
            value={value}
            onValueChange={(next) => {
                if (next) onChange(next);
            }}
            disabled={disabled}
        >
            <SelectTrigger
                id={`field-${name}`}
                className="h-11 w-full"
                aria-invalid={!!error}
                aria-describedby={error ? `field-${name}-error` : undefined}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function BillingFields({ values, errors, disabled, onChange }: Props) {
    // Wires an input to the form state and its error message.
    const input = (key: keyof CheckoutFormValues) => ({
        id: `field-${key}`,
        value: values[key] as string,
        disabled,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ [key]: e.target.value }),
        "aria-invalid": !!errors[key],
        "aria-describedby": errors[key] ? `field-${key}-error` : undefined,
        className: "h-11"
    });

    // When delivering elsewhere, the billing address isn't used, so only the
    // contact fields stay required.
    const billingAddressUsed = !values.shipToDifferent;

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
                <Field name="firstName" label="First name" error={errors.firstName}>
                    <Input {...input("firstName")} placeholder="First name" autoComplete="given-name" />
                </Field>
                <Field name="lastName" label="Last name" error={errors.lastName}>
                    <Input {...input("lastName")} placeholder="Last name" autoComplete="family-name" />
                </Field>
                <Field name="companyName" label="Company Name " optional error={errors.companyName}>
                    <Input {...input("companyName")} autoComplete="organization" />
                </Field>
            </div>

            <Field name="address" label="Address" error={errors.address}>
                <Input
                    {...input("address")}
                    disabled={disabled || !billingAddressUsed}
                    autoComplete="street-address"
                />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
                <Field name="country" label="Country">
                    <Input {...input("country")} readOnly disabled />
                </Field>
                <Field name="state" label="Region/State" error={errors.state}>
                    <OptionSelect
                        name="state"
                        value={values.state}
                        options={NIGERIAN_STATES}
                        error={errors.state}
                        disabled={disabled || !billingAddressUsed}
                        // The form clears an LGA that doesn't belong to the new state.
                        onChange={(state) => onChange({ state })}
                    />
                </Field>
                <Field name="lga" label="Local Government" error={errors.lga}>
                    <OptionSelect
                        name="lga"
                        value={values.lga}
                        options={getLgas(values.state)}
                        placeholder={values.state ? "Select..." : "Select a state first"}
                        error={errors.lga}
                        disabled={disabled || !billingAddressUsed || !values.state}
                        onChange={(lga) => onChange({ lga })}
                    />
                </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Field name="city" label="City" error={errors.city}>
                    <Input
                        {...input("city")}
                        disabled={disabled || !billingAddressUsed}
                        autoComplete="address-level2"
                    />
                </Field>
                <Field name="zipCode" label="Zip Code" optional error={errors.zipCode}>
                    <Input
                        {...input("zipCode")}
                        disabled={disabled || !billingAddressUsed}
                        autoComplete="postal-code"
                    />
                </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Field name="email" label="Email" error={errors.email}>
                    <Input {...input("email")} type="email" autoComplete="email" />
                </Field>
                <Field name="phone" label="Phone Number" error={errors.phone}>
                    <Input {...input("phone")} type="tel" autoComplete="tel" />
                </Field>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                    type="checkbox"
                    className="size-4 accent-red-600"
                    checked={values.shipToDifferent}
                    disabled={disabled}
                    onChange={(e) => onChange({ shipToDifferent: e.target.checked })}
                />
                Ship to a different address
            </label>

            {values.shipToDifferent && (
                <div className="space-y-5 rounded-lg border p-4">
                    <h3 className="text-sm font-semibold text-blue-950">Delivery address</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field name="shipFullName" label="Full name" error={errors.shipFullName}>
                            <Input {...input("shipFullName")} autoComplete="shipping name" />
                        </Field>
                        <Field name="shipPhone" label="Phone Number" error={errors.shipPhone}>
                            <Input {...input("shipPhone")} type="tel" autoComplete="shipping tel" />
                        </Field>
                    </div>

                    <Field name="shipStreet" label="Address" error={errors.shipStreet}>
                        <Input {...input("shipStreet")} autoComplete="shipping street-address" />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field name="shipState" label="Region/State" error={errors.shipState}>
                            <OptionSelect
                                name="shipState"
                                value={values.shipState}
                                options={NIGERIAN_STATES}
                                error={errors.shipState}
                                disabled={disabled}
                                onChange={(shipState) => onChange({ shipState })}
                            />
                        </Field>
                        <Field name="shipLga" label="Local Government" error={errors.shipLga}>
                            <OptionSelect
                                name="shipLga"
                                value={values.shipLga}
                                options={getLgas(values.shipState)}
                                placeholder={values.shipState ? "Select..." : "Select a state first"}
                                error={errors.shipLga}
                                disabled={disabled || !values.shipState}
                                onChange={(shipLga) => onChange({ shipLga })}
                            />
                        </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field name="shipCity" label="City" error={errors.shipCity}>
                            <Input {...input("shipCity")} autoComplete="shipping address-level2" />
                        </Field>
                        <Field name="shipZipCode" label="Zip Code" optional error={errors.shipZipCode}>
                            <Input {...input("shipZipCode")} autoComplete="shipping postal-code" />
                        </Field>
                    </div>
                </div>
            )}
        </div>
    );
}