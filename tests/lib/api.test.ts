import {describe, it, expect} from "vitest";
import {getStartingPrice, isVariantPurchasable, hasValidPrice, type Product} from "@/lib/api"


function makeProduct(overrides: Partial<Product> = {}): Product{
    return{
        id: "1",
        name: "Test Product",
        description: null,
        images: [],
        isFeatured: false,
        createdAt: new Date().toISOString(),
        category: {id: "c1", name: "Test Category", slug: "test"},
        brand: {id: "b1", name: "Test Brand", slug: "test"},
        variants: [],
        ...overrides,
    }
}


describe("getStartingPrice", () => {
    it("returns null when there are no variants", () => {
        expect(getStartingPrice(makeProduct())).toBeNull()
    })

    it("prefers piece price over carton price", () => {
        const product = makeProduct({
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
        });
        expect(getStartingPrice(product)).toEqual({amount: "3200", unit: "piece"});
    })

    it("picks the cheapest variant across multiple options", () => {
        const product = makeProduct({
          variants: [
            {
              id: "v1",
              productId: "1",
              sku: "A",
              unitLabel: "1L",
              unitsPerCarton: 12,
              cartonPrice: "37000",
              piecePrice: "3200",
              stockLevel: 10,
              lowStockThreshold: 2,
            },
            {
              id: "v2",
              productId: "1",
              sku: "B",
              unitLabel: "5L",
              unitsPerCarton: 4,
              cartonPrice: "57000",
              piecePrice: "14500",
              stockLevel: 10,
              lowStockThreshold: 2,
            },
          ],
        });
        expect(getStartingPrice(product)?.amount).toBe("3200");
    })

    it("skips a variant with a zero/placeholder carton price", () => {
        // Mirrors the DK-VO-750ML-12 seed placeholder that shipped with ₦0
        // pricing and no stock.
        const product = makeProduct({
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
              lowStockThreshold: 2,
            },
          ],
        });
        expect(getStartingPrice(product)).toBeNull();
    })

    it("skips an out-of-stock variant even with a valid price", () => {
        const product = makeProduct({
          variants: [
            {
              id: "v1",
              productId: "1",
              sku: "A",
              unitLabel: "1L",
              unitsPerCarton: 12,
              cartonPrice: "37000",
              piecePrice: "3200",
              stockLevel: 0,
              lowStockThreshold: 2,
            },
          ],
        });
        expect(getStartingPrice(product)).toBeNull();
    })

    it("falls back to an in-stock, validly priced variant over an unavailable one", () => {
        const product = makeProduct({
          variants: [
            {
              id: "v1",
              productId: "1",
              sku: "A",
              unitLabel: "750 ml",
              unitsPerCarton: 12,
              cartonPrice: "0",
              piecePrice: null,
              stockLevel: 0,
              lowStockThreshold: 2,
            },
            {
              id: "v2",
              productId: "1",
              sku: "B",
              unitLabel: "1L",
              unitsPerCarton: 12,
              cartonPrice: "37000",
              piecePrice: "3200",
              stockLevel: 10,
              lowStockThreshold: 2,
            },
          ],
        });
        expect(getStartingPrice(product)).toEqual({amount: "3200", unit: "piece"});
    })
})


describe("hasValidPrice", () => {
    it("treats null, empty, and zero prices as invalid", () => {
        expect(hasValidPrice(null)).toBe(false);
        expect(hasValidPrice(undefined)).toBe(false);
        expect(hasValidPrice("")).toBe(false);
        expect(hasValidPrice("0")).toBe(false);
        expect(hasValidPrice("0.00")).toBe(false);
    })

    it("treats a positive price as valid", () => {
        expect(hasValidPrice("3200")).toBe(true);
    })
})


describe("isVariantPurchasable", () => {
    const base = {
        id: "v1",
        productId: "1",
        sku: "A",
        unitLabel: "1L",
        unitsPerCarton: 12,
        piecePrice: null,
        lowStockThreshold: 2,
    };

    it("is false when stock is zero", () => {
        expect(isVariantPurchasable({...base, cartonPrice: "37000", stockLevel: 0})).toBe(false);
    })

    it("is false when the carton price is zero", () => {
        expect(isVariantPurchasable({...base, cartonPrice: "0", stockLevel: 10})).toBe(false);
    })

    it("is true when both stock and carton price are valid", () => {
        expect(isVariantPurchasable({...base, cartonPrice: "37000", stockLevel: 10})).toBe(true);
    })
})