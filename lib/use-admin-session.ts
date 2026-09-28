"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { getMe } from "@/lib/api";

export type AdminSessionStatus = "checking" | "authed" | "unauthed";

export function useAdminSession(): AdminSessionStatus {
    const [status, setStatus] = useState<AdminSessionStatus>("checking");

    useEffect(() => {
        let cancelled = false;

        async function check() {
            const { data } = await supabase.auth.getSession();

            if (!data.session) {
                if (!cancelled) setStatus("unauthed");
                return;
            }

            const me = await getMe(data.session.access_token);

            if (cancelled) return;

            if (!me || me.role !== "ADMIN") {
                await supabase.auth.signOut();
                if (!cancelled) setStatus("unauthed");
                return;
            }

            setStatus("authed");
        }

        check();

        return () => {
            cancelled = true;
        };
    }, []);

    return status;
}