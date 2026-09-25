"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import {useAuth} from "@/lib/auth-context";
import {
    addCartItem,
    clearCart as clearCartRequest,
    getCart,
    getCartItemCount,
    removeCartItem,
    updateCartItemQuantity,
    type Cart,
    type CartItemInput
} from "@/lib/api";




type CartContextValue = {
    cart: Cart | null;
    itemCount: number;
    loading: boolean;
    isLoggedIn: boolean;
    error: string | null;
    refreshCart: () => Promise<void>;
    addItem: (input: CartItemInput) => Promise<{ok:true} | {ok: false, error: string}>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<{ok:true} | {ok: false, error: string}>;
    removeItem: (itemId: string) => Promise<{ok:true} | {ok: false, error: string}>;
    clearCart: () => Promise<{ok:true} | {ok: false, error: string}>;
}



const CartContext = createContext<CartContextValue | null>(null);


export function CartProvider({children}:{children: React.ReactNode}){
    const {session, isLoggedIn, loading: authLoading} = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    const loadCart = useCallback(async (accessToken: string) => {
        setLoading(true);
        setError(null);

        try{
            const data = await getCart(accessToken);
            setCart(data);
        }catch{
            setError("Couldn't load your cart. please try again.")
        }finally{
            setLoading(false);
        }
    }, [])




    useEffect(() => {
        if (authLoading) return;

        if(session){
            loadCart(session.access_token);
        }else{
            setCart(null);
            setLoading(false);
        }
    }, [session, authLoading, loadCart]);





    const refreshCart = useCallback(async () => {
        if(!session) return;
        await loadCart(session.access_token);
    }, [session, loadCart])

    const addItem = useCallback<CartContextValue["addItem"]> (
        async(input) => {
            if(!session){
                return {ok: false, error: "You need to be logged in to add items to your cart."}
            }

            const result = await addCartItem(input, session.access_token);

            if(result.ok){
                setCart(result.cart)
                return {ok: true}
            }

            return {ok: false, error: result.error}
        },
        [session]
    )


    const updateItemQuantity = useCallback<CartContextValue["updateItemQuantity"]>(
        async(itemId, quantity) => {
            if(!session){
                return {ok: false, error: "You need to be logged in"}
            }

            const result = await updateCartItemQuantity(itemId, quantity, session.access_token);

            if(result.ok){
                setCart(result.cart);
                return {ok: true};
            }

            return {ok: false, error: result.error}
        },
        [session]
    )




    const removeItem = useCallback<CartContextValue["removeItem"]>(
        async (itemId) => {
            if(!session){
                return {ok: false, error: "You need to be logged in"}
            }

            const result = await removeCartItem(itemId, session.access_token);

            if(result.ok){
                setCart(result.cart);
                return {ok: true};
            }

            return {ok: false, error: result.error}
        },
        [session]
    )


    const clearCart = useCallback<CartContextValue["clearCart"]>(
        async () => {
            if(!session){
                return {ok: false, error: "You need to be logged in"}
            }

            const result = await clearCartRequest(session.access_token)

            if(result.ok){
                await loadCart(session.access_token);
                return {ok: true};
            }



            return {ok: false, error: result.error}
        },
        [session, loadCart]
    )


    const value = useMemo<CartContextValue>(
        () => ({
            cart,
            itemCount: getCartItemCount(cart),
            loading,
            isLoggedIn,
            error,
            refreshCart,
            addItem,
            updateItemQuantity,
            removeItem,
            clearCart
        }),
        [cart, loading, isLoggedIn, error, refreshCart, addItem, updateItemQuantity, removeItem, clearCart]
    );


    return <CartContext.Provider value={value}>{children}</CartContext.Provider> 
}




export function useCart(): CartContextValue{
    const ctx = useContext(CartContext);

    if(!ctx){
        throw new Error("useCart must be used within a CartProvider");
    }

    return ctx;
}


