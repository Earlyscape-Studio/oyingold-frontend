import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import AdminLayout from "@/app/admin/layout";
import { TooltipProvider } from "@/components/ui/tooltip";

let pathname = "/admin/dashboard";

vi.mock("next/navigation", () => ({
    usePathname: () => pathname,
    useRouter: () => ({ replace: vi.fn(), push: vi.fn() })
}));

vi.mock("@/lib/supabase-client", () => ({
    supabase: { auth: { signOut: vi.fn() } }
}));

// The session guard is covered on its own; here it just lets the layout through.
vi.mock("@/components/app/RequireAdminSession", () => ({
    RequireAdminSession: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// The real app supplies the tooltip provider in the root layout.
function renderLayout(children: React.ReactNode) {
    return render(
        <TooltipProvider>
            <AdminLayout>{children}</AdminLayout>
        </TooltipProvider>
    );
}

beforeAll(() => {
    // The sidebar checks the viewport size; jsdom doesn't provide matchMedia.
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null
    }));
});

describe("AdminLayout theme", () => {
    it("applies the admin theme on the wrapper and on <html>, and removes it on exit", () => {
        pathname = "/admin/dashboard";
        const { container, unmount } = renderLayout(<p>page</p>);

        expect(container.querySelector(".admin-theme")).not.toBeNull();
        expect(document.documentElement.classList.contains("admin-theme")).toBe(true);

        unmount();
        expect(document.documentElement.classList.contains("admin-theme")).toBe(false);
    });

    it("themes the login screen too, without the sidebar", () => {
        pathname = "/admin/login";
        const { container, getByText } = renderLayout(<p>login form</p>);

        expect(getByText("login form")).toBeTruthy();
        expect(container.querySelector(".admin-theme")).not.toBeNull();
        expect(container.querySelector('[data-sidebar="sidebar"]')).toBeNull();
    });

    it("marks the current page in the navigation", () => {
        pathname = "/admin/orders/abc";
        const { container } = renderLayout(<p>page</p>);

        const active = container.querySelector('[data-sidebar="menu-button"][data-active="true"]');
        expect(active?.textContent).toBe("Orders");
    });
});