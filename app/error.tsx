"use client";


import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon} from "@hugeicons/core-free-icons"


export default function Error({
    error,
    reset
}: {
    error: Error & {digest?: string};
    reset: () => void;
}) {

    useEffect(() => {
        console.error("[route error]", error);
    }, [error]);


    return(
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} size={40} className="text-destructive"/>
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                    {error.digest
                        ? `Reference: ${error.digest}`
                        : "Please try again, or come back in a moment."}
                </p>
            </div>
            <Button onClick={reset} variant="outline">
                Try again
            </Button>
        </div>
    )
}


