"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase-client";
import {getMe} from "@/lib/api";




export function RequireAdminSession ({
    children
} : {children: React.ReactNode}) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function check(){
            const {data} = await supabase.auth.getSession();

            if(!data.session){
                router.replace("/admin/login");
                return;
            }
            const me = await getMe(data.session.access_token);

            if(cancelled) return;

            if(!me || me.role !== "ADMIN"){
                await supabase.auth.signOut();
                router.replace("/admin/login");
                return;
            }

            setChecked(true);
        }

        check();
        
        return () => {
            cancelled = true;
        }

        // supabase.auth.getSession().then(({data}) => {
        //     if (!data.session){
        //         router.replace("/admin/login");
        //     }else{
        //         setChecked(true);
        //     }
        // });
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
