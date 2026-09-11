import { Suspense } from "react";
import { HeroCarousel } from "@/components/app/HeroCarousel";
import { CategoryGrid } from "@/components/app/CategoryGrid";
import { PromoBanner } from "@/components/app/PromoBanner";
import { FeaturedProductsSection } from "@/components/app/FeaturedProductsSection";
import { NewProductsSection } from "@/components/app/NewProductsSection";
import { ProductCardSkeleton } from "@/components/app/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";


function ProductGridSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-6 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}


function CategoryGridSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-6 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}


export default function HomePage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <HeroCarousel />
      </div>

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>

      <PromoBanner
        title="80% Off Great Deals For You"
        ctaLabel="Shop Now"
        ctaHref="/products"
        variant="dark"
        image="/images/product-basket.png"
        imageAlt="Shopping basket full of groceries"
      />

      <Suspense fallback={<ProductGridSkeleton />}>
        <FeaturedProductsSection />
      </Suspense>

      <PromoBanner
        title="We bring the Market to your doorstep"
        ctaLabel="Shop Now"
        ctaHref="/products"
        variant="light"
        image="/images/product-basket.png"
        imageAlt="Shopping basket full of groceries"
        imagePosition="left"
      />

      <Suspense fallback={<ProductGridSkeleton />}>
        <NewProductsSection />
      </Suspense>
    </div>
  )
}