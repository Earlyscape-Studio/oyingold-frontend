"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {supabase} from "@/lib/supabase-client"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}  from "@/components/ui/card" 



export default function AdminLoginPage () {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);


    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        });

        setSubmitting(false);

        if(error){
            setError(error.message);
            return;
        }

        router.push("/admin/products/new");
        router.refresh();
    }

    return (
        <div className="mx-auto max-w-sm px-4 py-16">
            <Card>
                <CardHeader>
                    <CardTitle>Admin login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? "Signing in…" : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}