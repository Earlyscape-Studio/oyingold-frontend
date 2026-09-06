"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ProductCard } from "./ProductCard";
import { getStartingPrice, type Product } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import {
    Select,
    SelectItem,
    SelectContent,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"



const PAGE_SIZE = 12;

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

function priceOf(product: Product): number {
    const price = getStartingPrice(product)
    return price ? parseFloat(price.amount) : 0;
}


function getPageItems(current: number, total: number): (number | "ellipsis")[] {
    const siblingCount = 1;
    const totalVisible = siblingCount * 2 + 5;

    if (total <= totalVisible) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const leftSibling = Math.max(current - siblingCount, 1)
    const rightSibling = Math.min(current + siblingCount, total)

    const showLeftEllipsis = leftSibling > 2
    const showRightEllipsis = rightSibling < total - 1

    const items: (number | "ellipsis")[] = [1]

    if (showLeftEllipsis) {
        items.push("ellipsis")
    } else {
        for (let p = 2; p < leftSibling; p++) items.push(p)
    }

    for (let p = leftSibling; p <= rightSibling; p++) {
        if (p !== 1 && p !== total) items.push(p)
    }

    if (showRightEllipsis) {
        items.push("ellipsis")
    } else {
        for (let p = rightSibling + 1; p < total; p++) items.push(p)
    }

    items.push(total)

    return items
}


export function ShopControls({
    products,
    categorySidebar,
}: {
    products: Product[]
    categorySidebar: ReactNode
}) {

    const bounds = useMemo(() => {
        const prices = products.map(priceOf).filter((p) => p > 0);
        return {
            min: prices.length ? Math.min(...prices) : 0,
            max: prices.length ? Math.max(...prices) : 0
        }
    }, [products]);




    const [range, setRange] = useState<[number, number]>([bounds.min, bounds.max]);
    const [sort, setSort] = useState<SortOption>("featured");
    const [page, setPage] = useState(1);



    const filtered = useMemo(() => {
        let list = products.filter((p) => {
            const price = priceOf(p);
            return price >= range[0] && price <= range[1];
        })


        switch (sort){
            case "price-asc":
                list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
                break;
            case "price-desc":
                list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
                break;
            case "newest":
                list = [...list].sort(
                    (a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            default:
                list = [...list].sort(
                    (a,b) => Number(b.isFeatured) - Number(a.isFeatured)
                )
        }

        return list
    }, [products, range, sort]);


    const pageCount = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const pageItems = useMemo(() => getPageItems(page, pageCount), [page, pageCount]);


    return (
         <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-6">
        {categorySidebar}

        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold text-blue-950">Filter by price</p>
          <Slider
            className="mt-6"
            min={bounds.min}
            max={bounds.max || 1}
            step={100}
            value={range}
            onValueChange={(value) => {
              setRange(value as [number, number])
              setPage(1)
            }}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Price: {formatNaira(range[0])} - {formatNaira(range[1])}
          </p>
        </div>
      </aside>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
          </p>

          <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paged.length === 0 ? (
          <p className="mt-10 text-muted-foreground">No products found.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paged.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>

              {pageItems.map((item, i) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={page === item}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(item)
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.min(pageCount, p + 1))
                  }}
                  className={page === pageCount ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
    )
}
