"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { getMe } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const RESEND_COOLDOWN_SECONDS = 45;

type Step = "email" | "code";

export default function AdminLoginPage() {
    const router = useRouter()
    const sessionStatus = useAdminSession()

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (sessionStatus === "authed") {
            router.replace("/admin/dashboard")
        }
    }, [sessionStatus, router]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((c) => Math.max(0, c - 1))
        }, 1000);

        return () => clearInterval(timer)
    }, [cooldown]);

    async function requestCode() {
        setError(null);
        setSubmitting(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
        });

        setSubmitting(false);

        if (error) {
            setError(error.message);
            return;
        }

        setStep("code");
        setCooldown(RESEND_COOLDOWN_SECONDS);
    }

    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        await requestCode();
    }

    async function handleResend() {
        if (cooldown > 0 || submitting) return;
        await requestCode();
    }

    function handleChangeEmail() {
        setStep("email");
        setCode("");
        setError(null);
        setCooldown(0);
    }

    async function handleCodeSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "email",
        })

        if (error || !data.session) {
            setSubmitting(false);
            setError(error?.message ?? "That code is invalid or has expired.");
            return;
        }

        const me = await getMe(data.session.access_token)

        setSubmitting(false);

        if (!me || me.role !== "ADMIN") {
            await supabase.auth.signOut();
            setError("This account doesn't have admin access.");
            return;
        }

        router.push("/admin/dashboard");
        router.refresh();
    }

    if (sessionStatus !== "unauthed") {
        return (
            <div className="mx-auto max-w-sm px-4 py-16 text-sm text-muted-foreground">
                Checking session…
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-sm px-4 py-16">
            <Card>
                <CardHeader>
                    <CardTitle>Admin login</CardTitle>
                </CardHeader>

                <CardContent>
                    {error && (
                        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    {step === "email" ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full"
                            >
                                {submitting ? "Sending code…" : "Send code"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                We sent a 6-digit code to{" "}
                                <span className="font-medium text-foreground">
                                    {email}
                                </span>
                                .
                            </p>

                            <div className="space-y-1.5">
                                <Label htmlFor="code">Code</Label>

                                <InputOTP
                                    id="code"
                                    maxLength={6}
                                    value={code}
                                    onChange={setCode}
                                    autoFocus
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    disabled={submitting}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="h-14 w-12 text-xl"/>
                                        <InputOTPSlot index={1} className="h-14 w-12 text-xl"/>
                                        <InputOTPSlot index={2} className="h-14 w-12 text-xl"/>
                                        <InputOTPSlot index={3} className="h-14 w-12 text-xl"/>
                                        <InputOTPSlot index={4} className="h-14 w-12 text-xl"/>
                                        <InputOTPSlot index={5} className="h-14 w-12 text-xl"/>
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || code.length !== 6}
                                className="w-full"
                            >
                                {submitting
                                    ? "Verifying…"
                                    : "Verify and sign in"}
                            </Button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={handleChangeEmail}
                                    className="text-muted-foreground underline-offset-2 hover:underline"
                                >
                                    Change email
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={cooldown > 0 || submitting}
                                    className="text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    {cooldown > 0
                                        ? `Resend code (${cooldown}s)`
                                        : "Resend code"}
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
