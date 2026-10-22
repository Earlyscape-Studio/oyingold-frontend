import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WishlistButton } from "@/components/app/WishlistButton";

const setAuthMenuOpen = vi.fn();
const toggle = vi.fn();
let isLoggedIn = true;
let wishlisted = false;

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock("@/lib/auth-context", () => ({
    useAuth: () => ({ isLoggedIn, setAuthMenuOpen }),
}));

vi.mock("@/lib/wishlist-context", () => ({
    useWishlist: () => ({
        isWishlisted: () => wishlisted,
        isPending: () => false,
        toggle,
    }),
}));

beforeEach(() => {
    vi.clearAllMocks();
    isLoggedIn = true;
    wishlisted = false;
});

describe("WishlistButton", () => {
    it("opens the sign-in menu instead of saving when logged out", async () => {
        isLoggedIn = false;
        render(<WishlistButton productId="p1" />);

        await userEvent.click(screen.getByRole("button", { name: "Add to wishlist" }));

        expect(setAuthMenuOpen).toHaveBeenCalledWith(true);
        expect(toggle).not.toHaveBeenCalled();
    });

    it("toggles the product when logged in", async () => {
        toggle.mockResolvedValueOnce({ ok: true, wishlisted: true });
        render(<WishlistButton productId="p1" />);

        await userEvent.click(screen.getByRole("button", { name: "Add to wishlist" }));

        expect(toggle).toHaveBeenCalledWith("p1");
    });

    it("reflects the saved state for assistive tech", () => {
        wishlisted = true;
        render(<WishlistButton productId="p1" />);

        expect(screen.getByRole("button", { name: "Remove from wishlist" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
    });
});