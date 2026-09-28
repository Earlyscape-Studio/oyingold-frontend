"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/lib/use-admin-session";




export function RequireAdminSession ({
    children
} : {children: React.ReactNode}) {
    const router = useRouter();
    const status = useAdminSession();

    useEffect(() => {
        if (status === "unauthed") {
            router.replace("/admin/login");
        }
    }, [status, router]);


    if (status !== "authed") {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8 text-sm text-gray-500">
                Checking session…
            </div>
        );
    }

    return <>{children}</>
}