"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

type Slide = {
  title: string
  subtitle?: string
  ctaLabel: string
  ctaHref: string
  className: string
  image?: string
  imageAlt?: string
}

const slides: Slide[] = [
  {
    title: "100% Authentic Palm & Vegetable Oils",
    subtitle: "Order yours today, we deliver.",
    ctaLabel: "Shop Now",
    ctaHref: "/products?category=vegetable-oil",
    className: "bg-gradient-to-br from-amber-50 to-white",
    image: "/images/Products.png",
    imageAlt: "Bottles and cartons of Goldwealth palm and vegetable oil",
  },
  {
    title: "80% Off Great Deals For You",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    className: "bg-gradient-to-br from-blue-950 to-blue-900 text-white",
  },
]

function useCarouselIndex(api: CarouselApi | undefined) {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (!api) return () => {}
      api.on("select", onStoreChange)
      api.on("reInit", onStoreChange)
      return () => {
        api.off("select", onStoreChange)
        api.off("reInit", onStoreChange)
      }
    },
    () => api?.selectedScrollSnap() ?? 0,
    () => 0
  )
}

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const current = useCarouselIndex(api)

  return (
    <div>
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
      >
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <div
                className={cn(
                  "grid items-center gap-6 overflow-hidden rounded-xl px-8 py-12 sm:px-16 sm:py-16",
                  slide.image ? "sm:grid-cols-2" : "grid-cols-1",
                  slide.className
                )}
              >
                <div className="max-w-md">
                  <h1 className="text-3xl font-bold sm:text-4xl">{slide.title}</h1>
                  {slide.subtitle && (
                    <p className="mt-3 text-sm opacity-80">{slide.subtitle}</p>
                  )}
                  <Link
                    href={slide.ctaHref}
                    className="mt-6 inline-block rounded-md bg-blue-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900"
                  >
                    {slide.ctaLabel}
                  </Link>
                </div>

                {slide.image && (
                  <div className="relative hidden aspect-[4/3] sm:block">
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt ?? ""}
                      fill
                      priority={i === 0}
                      className="object-contain"
                      sizes="(max-width: 640px) 0px, 50vw"
                    />
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-2 w-2 rounded-full transition",
              i === current ? "bg-blue-950" : "bg-blue-950/20"
            )}
          />
        ))}
      </div>
    </div>
  )
}