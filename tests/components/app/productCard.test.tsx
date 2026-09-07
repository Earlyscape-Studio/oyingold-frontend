import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {ProductCard} from "@/components/app/ProductCard";
import type {Product} from "@/lib/api";



const product: Product = {
    id: "1",
    name: "Gold Wealth Edible Oil",
    description: null,
    images: [],
    isFeatured: false,
    createdAt: new Date().toISOString(),
    category: {id: "c1", name: "Vegetable Oil", slug: "vegetable-oil"},
    brand: {id: "b1", name: "Goldwealth", slug: "goldwealth"},
    variants: [
        {
            id: "v1",
            productId: "1",
            sku: "SKU1",
            unitLabel: "1L",
            unitsPerCarton: 12,
            cartonPrice: "37000",
            piecePrice: "3200",
            stockLevel: 10,
            lowStockThreshold: 2
        }
    ]
}



describe("ProductCard", () => {
    it("renders the product name and price", () => {
        render(<ProductCard product={product} />)
        expect(screen.getByText("Gold Wealth Edible Oil")).toBeInTheDocument()
        expect(screen.getByText(/3,200/)).toBeInTheDocument()
    })


    it("shows the category name", () => {
        render(<ProductCard product={product}/>)
        expect(screen.getByText("Vegetable Oil")).toBeInTheDocument()
    })
})