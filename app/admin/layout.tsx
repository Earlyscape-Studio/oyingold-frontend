"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
    DashboardSpeed01Icon,
    Package01Icon,
    ShoppingCart01Icon,
    Tag01Icon,
    Store01Icon,
    Logout03Icon
 } from "@hugeicons/core-free-icons";
 import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
 } from "@/components/ui/sidebar";
import { RequireAdminSession } from "@/components/app/RequireAdminSession";


const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard", icon: DashboardSpeed01Icon },
    { href: "/admin/products", label: "Products", icon: Package01Icon },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart01Icon },
    { href: "/admin/categories", label: "Categories", icon: Tag01Icon },
    { href: "/admin/brands", label: "Brands", icon: Store01Icon },
]


export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();
    const router = useRouter();


    if (pathname === "/admin/login") {
        return <>{children}</>
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace("/admin/login");
    }


    return (
        <RequireAdminSession>
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SidebarHeader className="px-3 py-3">
                        <span className="text-sm font-semibold">Oyingold Admin</span>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Manage</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {NAV_ITEMS.map((item) => {
                                        const isActive =
                                            item.href === "/admin"
                                                ? pathname === "/admin"
                                                : pathname.startsWith(item.href);

                                        return (
                                            <SidebarMenuItem key={item.href}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.label}
                                                >
                                                    <Link href={item.href}>
                                                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
                                    <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
                                    <span>Sign out</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset>
                    <header className="flex items-center gap-2 border-b px-4 py-3">
                        <SidebarTrigger />
                    </header>
                    <div className="flex-1 p-6">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </RequireAdminSession>
    )
}