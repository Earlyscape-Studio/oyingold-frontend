"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {useAuth} from "@/lib/auth-context";
import {addToWishlist, getWishlistIds, removeFromWishlist} from "@/lib/api";


type Result = {ok: true} | {ok: false; error: string};

type WishlistContextValue = {
    productIds: ReadonlySet<string>;
    count: number;
    loading: boolean;
    isWishlisted: (productId: string) => boolean;
    isPending: (productId: string) => boolean;
    toggle: (productId: string) => Promise<Result & {wishlisted?: boolean}>;
    remove: (productId: string) => Promise<Result>;
}


const WishlistContext = createContext<WishlistContextValue | null>(null);


export function WishlistProvider({children}: {children: React.ReactNode}){
    const {session, loading: authLoading} = useAuth();
    const accessToken = session?.access_token;

    const [productIds, setProductIds] = useState<ReadonlySet<string>>(new Set());
    const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Always read the latest ids inside callbacks without re-creating them.
    const idsRef = useRef(productIds);

    useEffect(() => {
        idsRef.current = productIds;
    }, [productIds]);


    useEffect(() => {
        if(authLoading) return;

        if(!accessToken){
            setProductIds(new Set());
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        getWishlistIds(accessToken)
            .then((ids) => {
                if(!cancelled) setProductIds(new Set(ids));
            })
            .catch(() => {
                // The hearts just stay empty; nothing else depends on this.
            })
            .finally(() => {
                if(!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading]);


    const setPendingFor = useCallback((productId: string, isPending: boolean) => {
        setPending((prev) => {
            const next = new Set(prev);
            if(isPending) next.add(productId);
            else next.delete(productId);
            return next;
        });
    }, []);


    const applyLocal = useCallback((productId: string, wishlisted: boolean) => {
        setProductIds((prev) => {
            const next = new Set(prev);
            if(wishlisted) next.add(productId);
            else next.delete(productId);
            return next;
        });
    }, []);


    // Optimistic: update the heart immediately, roll back if the request fails.
    const setWishlisted = useCallback(
        async (productId: string, wishlisted: boolean): Promise<Result> => {
            if(!accessToken){
                return {ok: false, error: "You need to be logged in to use your wishlist."};
            }

            applyLocal(productId, wishlisted);
            setPendingFor(productId, true);

            const result = wishlisted
                ? await addToWishlist(productId, accessToken)
                : await removeFromWishlist(productId, accessToken);

            setPendingFor(productId, false);

            if(!result.ok){
                applyLocal(productId, !wishlisted);
            }

            return result;
        },
        [accessToken, applyLocal, setPendingFor]
    );


    const toggle = useCallback<WishlistContextValue["toggle"]>(
        async (productId) => {
            const next = !idsRef.current.has(productId);
            const result = await setWishlisted(productId, next);
            return result.ok ? {ok: true, wishlisted: next} : result;
        },
        [setWishlisted]
    );


    const remove = useCallback<WishlistContextValue["remove"]>(
        (productId) => setWishlisted(productId, false),
        [setWishlisted]
    );


    const value = useMemo<WishlistContextValue>(
        () => ({
            productIds,
            count: productIds.size,
            loading,
            isWishlisted: (productId) => productIds.has(productId),
            isPending: (productId) => pending.has(productId),
            toggle,
            remove
        }),
        [productIds, pending, loading, toggle, remove]
    );


    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}


export function useWishlist(): WishlistContextValue{
    const ctx = useContext(WishlistContext);

    if(!ctx){
        throw new Error("useWishlist must be used within a WishlistProvider");
    }

    return ctx;
}