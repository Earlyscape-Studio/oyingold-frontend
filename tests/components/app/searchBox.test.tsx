import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "@/components/app/layout/SearchBox";
import type { Product } from "@/lib/api";

const push = vi.fn();
const getProducts = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

vi.mock("@/lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/api")>();
    return { ...actual, getProducts: (...args: unknown[]) => getProducts(...args) };
});

function makeProduct(id: string, name: string): Product {
    return {
        id,
        name,
        description: null,
        images: [],
        isFeatured: false,
        createdAt: new Date().toISOString(),
        category: { id: "c1", name: "Dairy", slug: "dairy" },
        brand: { id: "b1", name: "Arla", slug: "arla" },
        variants: [
            {
                id: `${id}-v`,
                productId: id,
                sku: id,
                unitLabel: "1kg",
                unitsPerCarton: 1,
                cartonPrice: "5000",
                piecePrice: null,
                stockLevel: 5,
                lowStockThreshold: 1,
            },
        ],
    };
}

async function typeAndWait(user: ReturnType<typeof userEvent.setup>, text: string) {
    await user.type(screen.getByRole("combobox"), text);
    await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
    });
}

describe("SearchBox", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does not search until there are at least two characters", async () => {
        render(<SearchBox />);

        await typeAndWait(user, "d");

        expect(getProducts).not.toHaveBeenCalled();
    });

    it("debounces typing into a single request and shows suggestions", async () => {
        getProducts.mockResolvedValue([makeProduct("p1", "Dano Full Cream Milk")]);
        render(<SearchBox />);

        await typeAndWait(user, "dano");

        expect(getProducts).toHaveBeenCalledTimes(1);
        expect(getProducts).toHaveBeenCalledWith(
            { q: "dano", limit: 6 },
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
        expect(await screen.findByRole("option", { name: /Dano Full Cream Milk/ })).toBeInTheDocument();
        expect(screen.getByText(/See all results for/)).toBeInTheDocument();
    });

    it("opens the highlighted suggestion with the keyboard", async () => {
        getProducts.mockResolvedValue([makeProduct("p1", "Dano Full Cream Milk")]);
        render(<SearchBox />);

        await typeAndWait(user, "dano");
        await screen.findByRole("option", { name: /Dano Full Cream Milk/ });

        await user.keyboard("{ArrowDown}{Enter}");

        expect(push).toHaveBeenCalledWith("/products/p1");
    });

    it("goes to the full results page when nothing is highlighted", async () => {
        getProducts.mockResolvedValue([makeProduct("p1", "Dano Full Cream Milk")]);
        render(<SearchBox />);

        await typeAndWait(user, "dano");
        await user.keyboard("{Enter}");

        expect(push).toHaveBeenCalledWith("/products?q=dano");
    });

    it("closes the suggestions on Escape", async () => {
        getProducts.mockResolvedValue([makeProduct("p1", "Dano Full Cream Milk")]);
        render(<SearchBox />);

        await typeAndWait(user, "dano");
        await screen.findByRole("listbox");

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("says so when nothing matches", async () => {
        getProducts.mockResolvedValue([]);
        render(<SearchBox />);

        await typeAndWait(user, "zzz");

        expect(await screen.findByText(/No products found for/)).toBeInTheDocument();
    });
});