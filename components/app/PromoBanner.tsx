import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

type PromoBannerProps = {
  /** Main heading, e.g. "80% Off" */
  title: string
  /** Optional smaller line under the heading, e.g. "Great Deals For You" */
  subtitle?: string
  ctaLabel: string
  ctaHref: string
  variant?: "light" | "dark"
  image: string
  imageAlt?: string
  /** Only applies to the "light" variant */
  imagePosition?: "left" | "right"
}

export function PromoBanner({
  variant = "light",
  imagePosition = "left",
  ...props
}: PromoBannerProps) {
  return variant === "dark" ? (
    <DarkBanner {...props} />
  ) : (
    <LightBanner imagePosition={imagePosition} {...props} />
  )
}

/** Navy, inset + rounded banner: big heading on the left, basket on a curved white panel on the right. */
function DarkBanner({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
}: Omit<PromoBannerProps, "variant" | "imagePosition">) {
  return (
    <section className="mx-auto my-8 max-w-6xl px-4 sm:my-12">
      <div className="relative isolate overflow-hidden rounded-xl bg-brand-navy">
        {/* Curved panel: bottom half on mobile, right 55% from sm up */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-1/2 rounded-tl-[50%] rounded-tr-[50%] bg-neutral-100 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[55%] sm:rounded-tr-none sm:rounded-tl-[50%] sm:rounded-bl-[50%]"
        />

        <div className="grid items-center gap-4 px-8 pt-10 sm:grid-cols-2 sm:gap-6 sm:px-12 sm:py-10 lg:min-h-[400px] lg:pl-16">
          <div className="flex flex-col items-start gap-6">
            <div>
              <h2 className="text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-3 text-2xl font-bold text-white sm:text-4xl">
                  {subtitle}
                </p>
              )}
            </div>
            <Link
              href={ctaHref}
              className="rounded-md bg-promo-red px-10 py-3 text-base font-semibold text-white transition hover:bg-brand-red"
            >
              {ctaLabel}
            </Link>
          </div>

          <div className="relative h-56 sm:h-80 lg:h-[360px]">
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 90vw, 45vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Full-bleed red banner: basket in a white rounded card, heading + navy CTA beside it. */
function LightBanner({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
  imagePosition,
}: Omit<PromoBannerProps, "variant"> & {
  imagePosition: "left" | "right"
}) {
  const imageOnLeft = imagePosition === "left"

  return (
    <section className="my-8 bg-promo-red py-8 sm:my-12 sm:py-10">
      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-12",
          imageOnLeft
            ? "sm:grid-cols-[minmax(0,28rem)_1fr]"
            : "sm:grid-cols-[1fr_minmax(0,28rem)]"
        )}
      >
        <div
          className={cn(
            "relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-white",
            !imageOnLeft && "sm:order-2"
          )}
        >
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 90vw, 448px"
          />
        </div>

        <div
          className={cn(
            "flex flex-col items-start gap-6",
            !imageOnLeft && "sm:order-1"
          )}
        >
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={ctaHref}
            className="rounded-md bg-brand-navy px-10 py-3 text-base font-semibold text-white transition hover:bg-blue-900"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}