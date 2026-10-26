"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cash01Icon, CreditCardIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { CARD_PAYMENTS_ENABLED, type PaymentMethod } from "@/lib/checkout-api";

const OPTIONS: {
    value: PaymentMethod;
    label: string;
    icon: typeof CreditCardIcon;
    description: string;
}[] = [
    {
        value: "CARD",
        label: "Debit/Credit Card",
        icon: CreditCardIcon,
        description:
            "You'll enter your card details securely with our payment partner, FCMB. We never see or store your card number."
    },
    {
        value: "COD",
        label: "Cash on Delivery",
        icon: Cash01Icon,
        description: "Pay in cash when your order arrives."
    }
];

export function PaymentOptions({
    value,
    disabled,
    onChange
}: {
    value: PaymentMethod;
    disabled: boolean;
    onChange: (method: PaymentMethod) => void;
}) {
    const selected = OPTIONS.find((o) => o.value === value);

    return (
        <div className="rounded-lg border">
            <div role="radiogroup" aria-label="Payment option" className="grid grid-cols-2 divide-x">
                {OPTIONS.map((option) => {
                    const unavailable = option.value === "CARD" && !CARD_PAYMENTS_ENABLED;
                    const isSelected = value === option.value;

                    return (
                        <label
                            key={option.value}
                            className={cn(
                                "flex cursor-pointer flex-col items-center gap-3 px-4 py-5 text-sm",
                                (disabled || unavailable) && "cursor-not-allowed opacity-60",
                                isSelected && "bg-red-50"
                            )}
                        >
                            <HugeiconsIcon icon={option.icon} size={28} className="text-orange-500" />
                            <span className="text-center text-blue-950">{option.label}</span>
                            {unavailable && (
                                <span className="text-xs text-muted-foreground">Coming soon</span>
                            )}
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={option.value}
                                checked={isSelected}
                                disabled={disabled || unavailable}
                                onChange={() => onChange(option.value)}
                                className="size-4 accent-red-600"
                            />
                        </label>
                    );
                })}
            </div>

            {selected && (
                <p className="border-t px-5 py-4 text-sm text-muted-foreground">
                    {selected.description}
                </p>
            )}
        </div>
    );
}