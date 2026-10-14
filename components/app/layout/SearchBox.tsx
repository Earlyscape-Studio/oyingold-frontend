"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, Image01Icon } from "@hugeicons/core-free-icons";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { getProducts, getStartingPrice, type Product } from "@/lib/api";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 6;

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, query }: { text: string; query: string }) {
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "i"));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <strong key={i} className="font-semibold text-blue-950">
                        {part}
                    </strong>
                ) : (
                    // Plain text node (not a span) so spaces next to the bold match survive.
                    <Fragment key={i}>{part}</Fragment>
                )
            )}
        </>
    );
}

export function SearchBox() {
    const router = useRouter();
    const listId = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);
    // -1 means nothing highlighted; the last index is the "See all results" row.
    const [activeIndex, setActiveIndex] = useState(-1);

    const trimmed = query.trim();
    const canSearch = trimmed.length >= MIN_CHARS;

    useEffect(() => {
        if (!canSearch) return;

        const controller = new AbortController();

        const timer = setTimeout(async () => {
            setLoading(true);
            setFailed(false);

            try {
                const products = await getProducts(
                    { q: trimmed, limit: MAX_SUGGESTIONS },
                    { signal: controller.signal }
                );
                setResults(products);
                setActiveIndex(-1);
            } catch (error) {
                if ((error as Error).name === "AbortError") return;
                setResults([]);
                setFailed(true);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, DEBOUNCE_MS);

        // Typing again cancels the pending timer and any in-flight request.
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [trimmed, canSearch]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    const showPanel = open && canSearch;
    const seeAllIndex = results.length;
    const optionCount = results.length + 1;

    function optionId(index: number) {
        return `${listId}-option-${index}`;
    }

    function goToProduct(product: Product) {
        setOpen(false);
        setQuery("");
        router.push(`/products/${product.id}`);
    }

    function goToResults() {
        setOpen(false);
        router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
        }

        if (!showPanel) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((i) => (i + 1) % optionCount);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
        } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            if (activeIndex === seeAllIndex) goToResults();
            else goToProduct(results[activeIndex]);
        }
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!trimmed) return;
        goToResults();
    }

    return (
        <div ref={containerRef} className="relative flex-1">
            <form role="search" onSubmit={handleSubmit}>
                <InputGroup className="flex w-full items-center rounded-4xl">
                    <InputGroupInput
                        type="search"
                        name="q"
                        value={query}
                        autoComplete="off"
                        enterKeyHint="search"
                        placeholder="Search anything..."
                        className="w-full py-2 text-sm"
                        role="combobox"
                        aria-expanded={showPanel}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            showPanel && activeIndex >= 0 ? optionId(activeIndex) : undefined
                        }
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                            setActiveIndex(-1);
                            if (e.target.value.trim().length < MIN_CHARS) {
                                setResults([]);
                                setFailed(false);
                                setLoading(false);
                            }
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                    />
                    <InputGroupAddon align="inline-end" className="flex items-center justify-end">
                        <Button
                            type="submit"
                            variant="outline"
                            aria-label="Search"
                            className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-300"
                        >
                            <HugeiconsIcon icon={SearchIcon} size={18} />
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
            </form>

            {showPanel && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-white shadow-lg">
                    <ul id={listId} role="listbox" aria-label="Search suggestions">
                        {results.map((product, index) => {
                            const price = getStartingPrice(product);
                            const image = product.images[0];

                            return (
                                <li
                                    key={product.id}
                                    id={optionId(index)}
                                    role="option"
                                    aria-selected={activeIndex === index}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    // mousedown fires before the input blurs, so the click isn't lost
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => goToProduct(product)}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 px-3 py-2",
                                        activeIndex === index && "bg-muted"
                                    )}
                                >
                                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                                        {image ? (
                                            <Image
                                                src={image}
                                                alt=""
                                                fill
                                                sizes="40px"
                                                className="object-contain p-1"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                <HugeiconsIcon icon={Image01Icon} size={16} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-muted-foreground">
                                            <Highlight text={product.name} query={trimmed} />
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.category.name}
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-semibold text-red-600">
                                        {price ? (
                                            <>
                                                {product.variants.length > 1 && (
                                                    <span className="mr-1 text-xs font-normal text-muted-foreground">
                                                        From
                                                    </span>
                                                )}
                                                {formatNaira(price.amount)}
                                            </>
                                        ) : (
                                            <span className="text-xs font-normal text-muted-foreground">
                                                Unavailable
                                            </span>
                                        )}
                                    </p>
                                </li>
                            );
                        })}

                        <li
                            id={optionId(seeAllIndex)}
                            role="option"
                            aria-selected={activeIndex === seeAllIndex}
                            onMouseEnter={() => setActiveIndex(seeAllIndex)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={goToResults}
                            className={cn(
                                "cursor-pointer border-t px-3 py-3 text-sm font-medium text-blue-950",
                                activeIndex === seeAllIndex && "bg-muted"
                            )}
                        >
                            See all results for &ldquo;{trimmed}&rdquo;
                        </li>
                    </ul>

                    <p className="sr-only" role="status" aria-live="polite">
                        {loading ? "Searching" : `${results.length} suggestions`}
                    </p>

                    {loading && results.length === 0 && (
                        <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>
                    )}
                    {!loading && failed && (
                        <p className="px-3 py-3 text-sm text-destructive">
                            Couldn&apos;t load suggestions. Press Enter to search anyway.
                        </p>
                    )}
                    {!loading && !failed && results.length === 0 && (
                        <p className="px-3 py-3 text-sm text-muted-foreground">
                            No products found for &ldquo;{trimmed}&rdquo;.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}