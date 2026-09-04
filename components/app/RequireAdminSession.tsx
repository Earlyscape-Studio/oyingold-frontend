"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase-client";




export function RequireAdminSession ({
    children
} : {children: React.ReactNode}) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            if (!data.session){
                router.replace("/admin/login");
            }else{
                setChecked(true);
            }
        });
    }, [router]);


    if(!checked){
        return (
            <div className="mx-auto max-w-2xl px-4 py-8 text-sm text-gray-500">
                Checking session…
            </div>
        );
    }
    
    return <>{children}</>
}
