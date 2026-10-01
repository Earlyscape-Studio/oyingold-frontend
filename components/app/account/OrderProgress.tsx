import { cn } from "@/lib/utils";
import { ORDER_STEPS } from "@/lib/order-status";

export function OrderProgress({ step }: { step: number }) {
    return (
        <ol aria-label="Order progress" className="flex w-full">
            {ORDER_STEPS.map((label, index) => {
                const stepNumber = index + 1;
                const reached = stepNumber <= step;
                const isCurrent = stepNumber === step;

                return (
                    <li
                        key={label}
                        aria-current={isCurrent ? "step" : undefined}
                        className="relative flex flex-1 flex-col items-center gap-2"
                    >
                        {index > 0 && (
                            <span
                                aria-hidden
                                className={cn(
                                    "absolute top-4 right-1/2 left-[-50%] h-0.5 -translate-y-1/2",
                                    reached ? "bg-blue-950" : "bg-gray-300"
                                )}
                            />
                        )}

                        <span
                            className={cn(
                                "relative z-10 flex size-8 items-center justify-center rounded-full border text-xs font-medium",
                                reached
                                    ? "border-blue-950 bg-blue-950 text-white"
                                    : "border-gray-300 bg-white text-gray-500",
                                isCurrent && "ring-4 ring-blue-950/15"
                            )}
                        >
                            {stepNumber}
                        </span>

                        <span
                            className={cn(
                                "px-0.5 text-center text-[11px] leading-tight sm:text-xs",
                                reached ? "text-blue-950" : "text-muted-foreground"
                            )}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}