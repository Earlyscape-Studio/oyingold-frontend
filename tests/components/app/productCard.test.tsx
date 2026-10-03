import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {ProductCard} from "@/components/app/ProductCard";
import type {Product} from "@/lib/api";



vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}))


vi.mock("@/lib/auth-context", () => ({
    useAuth: () => ({
        setAuthMenuOpen: vi.fn()
    })
}))


vi.mock("@/lib/cart-context", () => ({
    useCart: () => ({
        addItem: vi.fn()
    })
}))


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

    it("disables Add to cart and shows an unavailable message for a zero-priced, out-of-stock variant", () => {
        const unavailableProduct: Product = {
            ...product,
            variants: [
                {
                    id: "v1",
                    productId: "1",
                    sku: "DK-VO-750ML-12",
                    unitLabel: "750 ml",
                    unitsPerCarton: 12,
                    cartonPrice: "0",
                    piecePrice: null,
                    stockLevel: 0,
                    lowStockThreshold: 2
                }
            ]
        };

        render(<ProductCard product={unavailableProduct} />)

        expect(screen.getByText("Currently unavailable")).toBeInTheDocument()
        expect(screen.getByText("ADD TO CART").closest("button")).toBeDisabled()
    })
})