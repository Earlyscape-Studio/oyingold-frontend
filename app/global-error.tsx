"use client";

import * as Sentry from "@sentry/nextjs"; 
import Error from "next/error"
import { useEffect } from "react";
import {Button} from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & {digest?: string};
    reset: () => void;
}) {

    useEffect(() => {
        Sentry.captureException(error);
        console.error("[global error]", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
                    <h1 className="text-xl font-semibold">Unexpected error</h1>
                    <p className="text-sm text-muted-foreground">
                        The app hit a problem loading. Try refreshing.
                    </p>
                    <Button onClick={reset}>Reload</Button>
                </div>
            </body>
        </html>
    )
}