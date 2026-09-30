"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import { getMe } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const OTP_LENGTH = 8;
const RESEND_COOLDOWN_SECONDS = 45;

type Step = "email" | "code";

export default function AdminLoginPage() {
    const router = useRouter();
    const sessionStatus = useAdminSession();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (sessionStatus === "authed") {
            router.replace("/admin/dashboard");
        }
    }, [sessionStatus, router]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    async function sendCode() {
        setError(null);
        setSubmitting(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
            },
        });

        setSubmitting(false);

        if (error) {
            setError(error.message);
            return false;
        }

        setStep("code");
        setCode("");
        setCooldown(RESEND_COOLDOWN_SECONDS);

        return true;
    }

    async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await sendCode();
    }

    async function handleResend() {
        if (cooldown > 0 || submitting) return;
        await sendCode();
    }

    function handleChangeEmail() {
        setStep("email");
        setCode("");
        setError(null);
        setCooldown(0);
    }

    async function handleCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (code.length !== OTP_LENGTH) return;

        setError(null);
        setSubmitting(true);

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "email",
        });

        if (error || !data.session) {
            setSubmitting(false);
            setError(error?.message ?? "That code is invalid or has expired.");
            return;
        }

        const me = await getMe(data.session.access_token);

        if (!me || me.role !== "ADMIN") {
            await supabase.auth.signOut();
            setSubmitting(false);
            setError("This account doesn't have admin access.");
            return;
        }

        setSubmitting(false);

        router.push("/admin/dashboard");
        router.refresh();
    }

    if (sessionStatus !== "unauthed") {
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <p className="text-sm text-muted-foreground">
                    Checking session…
                </p>
            </main>
        );
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
            {/* Background decoration */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
            >
                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <div className="relative mx-auto mb-5 h-12 w-32">
                        <Image
                            src="/images/Logo-combo.svg"
                            alt="Oyingold"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>

                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                        Oyingold
                    </p>

                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                        Admin Portal
                    </h1>
                </div>

                <Card className="border-border/70 bg-background/95 shadow-xl shadow-black/5 backdrop-blur">
                    <CardHeader className="space-y-2 pb-6">
                        <CardTitle className="text-xl">
                            {step === "email"
                                ? "Sign in to your account"
                                : "Enter your verification code"}
                        </CardTitle>

                        <CardDescription>
                            {step === "email"
                                ? "Enter your admin email address to receive a secure verification code."
                                : "Enter the 8-digit code we sent to your email address."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                            >
                                {error}
                            </div>
                        )}

                        {step === "email" ? (
                            <form
                                onSubmit={handleEmailSubmit}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        required
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        disabled={submitting}
                                        className="h-11"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting || !email.trim()}
                                    className="h-11 w-full"
                                >
                                    {submitting
                                        ? "Sending code…"
                                        : "Continue"}
                                </Button>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleCodeSubmit}
                                className="space-y-6"
                            >
                                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
                                    <p className="text-muted-foreground">
                                        Verification code sent to
                                    </p>

                                    <p className="mt-1 font-medium text-foreground break-all">
                                        {email}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="code">
                                        Verification code
                                    </Label>

                                    <InputOTP
                                        id="code"
                                        maxLength={OTP_LENGTH}
                                        value={code}
                                        onChange={setCode}
                                        autoFocus
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
                                        disabled={submitting}
                                        containerClassName="w-full justify-center"
                                    >
                                        <InputOTPGroup className="gap-1.5 sm:gap-2">
                                            <InputOTPSlot
                                                index={0}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={1}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={2}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={3}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                        </InputOTPGroup>

                                        <InputOTPSeparator />

                                        <InputOTPGroup className="gap-1.5 sm:gap-2">
                                            <InputOTPSlot
                                                index={4}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={5}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={6}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                            <InputOTPSlot
                                                index={7}
                                                className="h-12 w-9 text-lg sm:h-14 sm:w-11 sm:text-xl"
                                            />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        code.length !== OTP_LENGTH
                                    }
                                    className="h-11 w-full"
                                >
                                    {submitting
                                        ? "Verifying…"
                                        : "Verify and sign in"}
                                </Button>

                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <button
                                        type="button"
                                        onClick={handleChangeEmail}
                                        disabled={submitting}
                                        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        Change email
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={
                                            cooldown > 0 || submitting
                                        }
                                        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
                                    >
                                        {cooldown > 0
                                            ? `Resend in ${cooldown}s`
                                            : "Resend code"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Authorized Oyingold administrators only.
                </p>
            </div>
        </main>
    );
}
