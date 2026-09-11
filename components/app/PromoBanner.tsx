import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function PromoBanner({
  title,
  ctaLabel,
  ctaHref,
  variant = "light",
  image,
  imageAlt,
  imagePosition = "right",
}: {
  title: string
  ctaLabel: string
  ctaHref: string
  variant?: "light" | "dark"
  image?: string
  imageAlt?: string
  imagePosition?: "left" | "right"
}) {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div
        className={cn(
          "grid items-center gap-6 overflow-hidden rounded-xl px-8 py-12 sm:px-16",
          image ? "sm:grid-cols-2" : "grid-cols-1",
          variant === "dark" ? "bg-blue-950 text-white" : "bg-red-600 text-white"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-start gap-4",
            image && imagePosition === "left" && "sm:order-2"
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

        {image && (
          <div className="relative hidden aspect-[4/3] sm:block">
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 0px, 50vw"
            />
          </div>
        )}
      </div>
    </section>
  )
}