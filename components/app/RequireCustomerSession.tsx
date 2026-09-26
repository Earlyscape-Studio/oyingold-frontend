"use client";


import {useEffect} from "react";
import {useAuth} from "@/lib/auth-context";
import {Button} from "@/components/ui/button";

export function RequireCustomerSession({children}:{children: React.ReactNode}){
    const {loading, isLoggedIn, setAuthMenuOpen} = useAuth();

    useEffect(() => {
        if(!loading && !isLoggedIn){
            setAuthMenuOpen(true);
        }
    }, [loading, ,isLoggedIn, setAuthMenuOpen]);


    if(loading){
        return(
            <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">
                Checking session…
            </div>
        );
    }

    if(!isLoggedIn){
        return(
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                    You need to sign in to continue.
                </p>
                <Button className="mt-4" onClick={() => setAuthMenuOpen(true)}>
                    Sign in
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}