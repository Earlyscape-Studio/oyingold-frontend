"use client";


import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";




type View = "sign-in" | "sign-up" | "sign-up-sent" | "forgot-password" | "forgot-password-sent"


export function AccountMenu() {
    const { isLoggedIn, user, session, signOut, authMenuOpen, setAuthMenuOpen } = useAuth();
    


    return (
        <Popover open={authMenuOpen} onOpenChange={setAuthMenuOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-1.5 text-blue-950"
                    aria-label={isLoggedIn ? "Account" : "Login or Register"}
                >
                    <HugeiconsIcon icon={UserIcon} size={20} className="fill-blue-600" />
                    <span className="hidden sm:inline">
                        {isLoggedIn ? (session?.user.email ?? "Account") : "Login or Register"}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-[340px]">
                {isLoggedIn ? (
                    <SignedInPanel
                        email={session?.user.email ?? null}
                        role={user?.role ?? null}
                        onSignOut={async () => {
                            await signOut()
                            setAuthMenuOpen(false)
                        }}
                    />
                ) : (
                    <AuthPanel onDone={() => setAuthMenuOpen(false)} />
                )}
            </PopoverContent>
        </Popover>
    );
}


function SignedInPanel({
    email,
    role,
    onSignOut
}: {
    email: string | null;
    role: string | null;
    onSignOut: () => void;
}) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-medium text-foreground">{email}</p>
                {role && (
                    <p className="text-xs text-muted-foreground">{role.toLowerCase()}</p>
                )}
            </div>
            <Button variant="outline" className="w-full" onClick={onSignOut}>
                Sign out
            </Button>
        </div>
    )
}



function AuthPanel({ onDone }: { onDone: () => void }) {
    const [view, setView] = useState<View>("sign-in");

    if (view === "sign-in") {
        return (
            <SignInView
                onSuccess={onDone}
                onCreateAccount={() => setView("sign-up")}
                onForgotPassword={() => setView("forgot-password")}
            />
        );
    }

    if (view === "sign-up") {
        return (
            <SignUpView
                onSent={() => setView("sign-up-sent")}
                onBackToSignIn={() => setView("sign-in")}
            />
        );
    }

    if (view === "sign-up-sent") {
        return <SignUpSentView onBackToSignIn={() => setView("sign-in")} />;
    }

    if (view === "forgot-password") {
        return (
            <ForgotPasswordView
                onSent={() => setView("forgot-password-sent")}
                onBackToSignIn={() => setView("sign-in")}
            />
        );
    }


    return <ForgotPasswordSentView onBackToSignIn={() => setView("sign-in")} />;
}

function SignInView({
    onSuccess,
    onCreateAccount,
    onForgotPassword
}: {
    onSuccess: () => void;
    onCreateAccount: () => void;
    onForgotPassword: () => void;
}) {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);



    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);


        const result = await signIn(email, password);

        setSubmitting(false);

        if (!result.ok) {
            if (result.code === "email_not_confirmed") {
                setError("Please confirm your email before signing in - check your inbox for the link.");
            } else {
                setError(result.error);
            }
            return;
        }

        onSuccess();
    }


    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Sign in to your account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <Input
                        id="signin-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-xs font-medium text-blue-700 hover:underline"
                        >
                            Forget Password
                        </button>
                    </div>
                    <Input
                        id="signin-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Signing in…" : "Login"}
                </Button>
            </form>

            <div className="relative text-center text-xs text-muted-foreground">
                <span className="relative bg-popover px-2">Don&apos;t have account</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 border-t" />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={onCreateAccount}>
                Create Account
            </Button>
        </div>
    );
}


function SignUpView({
    onSent,
    onBackToSignIn,
}: {
    onSent: () => void;
    onBackToSignIn: () => void;
}) {
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);



    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);


        if (password !== confirmPassword) {
            setError("Passwords don't match.")
            return;
        }


        setSubmitting(true);
        const result = await signUp(email, password);
        setSubmitting(false);

        if (!result.ok) {
            setError(result.error)
            return;
        }

        onSent();
    }

    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Create your account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                        id="signup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                        id="signup-confirm-password"
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Creating account…" : "Create Account"}
                </Button>
            </form>

            <button
                type="button"
                onClick={onBackToSignIn}
                className="w-full text-center text-xs font-medium text-blue-700 hover:underline"
            >
                Already have an account? Sign in
            </button>
        </div>
    );
}


function SignUpSentView({ onBackToSignIn }: { onBackToSignIn: () => void }) {
    return (
        <div className="space-y-4 text-center">
            <h2 className="text-base font-semibold text-foreground">Check your inbox</h2>
            <p className="text-sm text-muted-foreground">
                We&apos;ve sent a confirmation link to your email. Click it to activate your
                account, then sign in below.
            </p>
            <Button type="button" variant="outline" className="w-full" onClick={onBackToSignIn}>
                Back to sign in
            </Button>
        </div>
    );
}


function ForgotPasswordView({
    onSent,
    onBackToSignIn,
}: {
    onSent: () => void;
    onBackToSignIn: () => void;
}) {
    const { sendPasswordReset } = useAuth();

    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const result = await sendPasswordReset(email);

        setSubmitting(false);


        if (!result.ok) {
            setError(result.error);
            return;
        }

        onSent();
    }

    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Reset your password</h2>
            <p className="text-sm text-muted-foreground">
                Enter the email on your account and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <Input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Sending…" : "Send Reset Link"}
                </Button>
            </form>

            <button
                type="button"
                onClick={onBackToSignIn}
                className="w-full text-center text-xs font-medium text-blue-700 hover:underline"
            >
                Back to sign in
            </button>
        </div>
    );
}

function ForgotPasswordSentView({ onBackToSignIn }: { onBackToSignIn: () => void }) {
    return (
        <div className="space-y-4 text-center">
            <h2 className="text-base font-semibold text-foreground">Check your inbox</h2>
            <p className="text-sm text-muted-foreground">
                If an account exists for that email, we&apos;ve sent a link to reset your
                password.
            </p>
            <Button type="button" variant="outline" className="w-full" onClick={onBackToSignIn}>
                Back to sign in
            </Button>
        </div>
    );
}