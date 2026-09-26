"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";



export default function ResetPasswordPage() {

    const router = useRouter();
    const { isLoggedIn, loading } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);


        if (password.length < 0) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setSubmitting(true);

        const { error } = await supabase.auth.updateUser({ password })
        setSubmitting(false);

        if (error) {
            setError(error.message);
            return;
        }


        setDone(true);

    }




    return (
        <div className="mx-auto max-w-sm px-4 py-16">
            <Card>
                <CardHeader>
                    <CardTitle>Reset your password</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Checking your link…</p>
                    ) : done ? (
                        <div className="space-y-4">
                            <p className="text-sm text-foreground">
                                Your password has been updated.
                            </p>
                            <Button className="w-full" onClick={() => router.push("/")}>
                                Continue shopping
                            </Button>
                        </div>
                    ) : !isLoggedIn ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                This link is invalid or has expired. Request a new one from the
                                &ldquo;Forget Password&rdquo; link when signing in.
                            </p>
                            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                                Back to home
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {error}
                                </p>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="new-password">New password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirm-password">Confirm new password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? "Updating…" : "Update password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}