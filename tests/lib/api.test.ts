import {describe, it, expect} from "vitest";
import {getStartingPrice, type Product} from "@/lib/api"


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
})