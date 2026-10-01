"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";


export function NewsletterForm() {
    const [email, setEmail] = useState("");

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // TODO: send `email` to the newsletter endpoint once it exists.
        toast.success("Thanks for subscribing!");
        setEmail("");
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
            <div className="relative">
                <HugeiconsIcon
                    icon={Mail01Icon}
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email address"
                    className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                />
            </div>
            <button
                type="submit"
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
            >
                Subscribe to Newsletter
            </button>
        </form>
    );
}