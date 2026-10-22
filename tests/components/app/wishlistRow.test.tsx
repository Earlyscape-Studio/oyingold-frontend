import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WishlistRow } from "@/components/app/wishlist/WishlistRow";
import type { Product, ProductVariant } from "@/lib/api";

const addItem = vi.fn();

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock("@/lib/cart-context", () => ({
    useCart: () => ({ addItem }),
}));

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
    return {
        id: "v1",
        productId: "p1",
        sku: "SKU1",
        unitLabel: "1L",
        unitsPerCarton: 12,
        cartonPrice: "37000",
        piecePrice: "3200",
        stockLevel: 10,
        lowStockThreshold: 2,
        ...overrides,
    };
}

function product(variants: ProductVariant[]): Product {
    return {
        id: "p1",
        name: "Dano Full Cream Milk",
        description: null,
        images: [],
        isFeatured: false,
        createdAt: new Date().toISOString(),
        category: { id: "c1", name: "Dairy", slug: "dairy" },
        brand: { id: "b1", name: "Arla", slug: "arla" },
        variants,
    };
}

beforeEach(() => vi.clearAllMocks());

describe("WishlistRow", () => {
    it("adds the only buyable variant straight to the cart", async () => {
        addItem.mockResolvedValueOnce({ ok: true });
        render(<WishlistRow product={product([variant()])} removing={false} onRemove={vi.fn()} />);

        expect(screen.getByText("In stock")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

        expect(addItem).toHaveBeenCalledWith({
            productVariantId: "v1",
            pricingType: "piece",
            quantity: 1,
        });
    });

    it("sends people to the product page when there are several options", () => {
        render(
            <WishlistRow
                product={product([variant(), variant({ id: "v2", sku: "SKU2", unitLabel: "5L" })])}
                removing={false}
                onRemove={vi.fn()}
            />
        );

        expect(screen.getByRole("link", { name: /select options/i })).toHaveAttribute(
            "href",
            "/products/p1"
        );
    });

    it("disables add to cart when nothing is in stock", () => {
        render(
            <WishlistRow
                product={product([variant({ stockLevel: 0 })])}
                removing={false}
                onRemove={vi.fn()}
            />
        );

        expect(screen.getByText("Out of stock")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /add to cart/i })).toBeDisabled();
    });

    it("calls onRemove from the remove button", async () => {
        const onRemove = vi.fn();
        render(<WishlistRow product={product([variant()])} removing={false} onRemove={onRemove} />);

        await userEvent.click(screen.getByRole("button", { name: /remove dano full cream milk/i }));

        expect(onRemove).toHaveBeenCalledOnce();
    });
});