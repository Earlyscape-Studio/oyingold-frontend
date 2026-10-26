import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Label + control + error message. The control must use id `field-${name}` so
// the form can focus the first invalid field on submit.
export function Field({
    name,
    label,
    optional,
    error,
    className,
    children
}: {
    name: string;
    label: string;
    optional?: boolean;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={`field-${name}`} className="text-sm text-blue-950">
                {label}
                {optional && <span className="font-normal text-muted-foreground">(Optional)</span>}
            </Label>
            {children}
            {error && (
                <p id={`field-${name}-error`} className="text-xs text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}