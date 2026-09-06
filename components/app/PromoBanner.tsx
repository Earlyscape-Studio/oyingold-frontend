import Link from "next/link";
import { cn } from "@/lib/utils";


export function PromoBanner({
    title,
    ctaLabel,
    ctaHref,
    variant = "light"
}: {
    title: string
    ctaLabel: string
    ctaHref: string
    variant?: "light" | "dark"
}) {
    return (
        <section className="mx-auto max-w-6xl px-4">
            <div
                className={cn(
                    "flex flex-col items-start justify-center gap-4 rounded-xl px-8 py-12 sm:px-16",
                    variant === "dark" ? "bg-blue-950 text-white" : "bg-red-600 text-white"
                )}
            >
                <h2 className="text-3xl font-bold">{title}</h2>
                <Link
                    href={ctaHref}
                    className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-950 hover:bg-blue-50"
                >
                    {ctaLabel}
                </Link>
            </div>
        </section>
    )
}