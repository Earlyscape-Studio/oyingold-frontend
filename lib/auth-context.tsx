"use client";


import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import type {Session} from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase-client";
import {getMe, type Me} from "@/lib/api";



type ActionResult =
    | {ok: true}
    | {ok: false; error: string; code?: string};
    
    
type SignUpResult =
    | {ok: true; needsEmailConfirmation: boolean}
    | {ok: false; error: string; code?: string};


type AuthContextValue = {
    session: Session | null;
    user: Me | null;
    loading: boolean;
    isLoggedIn: boolean;
    signIn: (email: string, password: string) => Promise<ActionResult>;
    signUp: (email: string, password: string) => Promise<SignUpResult>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<ActionResult>;
    refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({children} : {children: React.ReactNode}){
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<Me | null>(null);
    const [loading, setLoading] = useState(true);



    const loadUser = useCallback(async (accessToken: string) => {
        const me = await getMe(accessToken);

        setUser(me);
    }, []);


    useEffect(() => {
        let cancelled = false;


        supabase.auth.getSession().then(({data}) => {
            if (cancelled) return;

            setSession(data.session);

            if(data.session){
                loadUser(data.session.access_token).finally(() => {
                    if (!cancelled) setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        const {data: listener} = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);

                if(newSession){
                    loadUser(newSession.access_token);
                }else{
                    setUser(null);
                }
            }
        );


        return () => {
            cancelled = true;
            listener.subscription.unsubscribe();
        }
    }, [loadUser]);


    const signIn = useCallback<AuthContextValue["signIn"]>(
        async (email, password) => {
            const {error} = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if(error){
                return {ok: false, error: error.message, code: error.code};
            }

            return {ok: true};
        },
        []
    );


    const signUp = useCallback<AuthContextValue["signUp"]>(
        async (email, password) => {
            const {data, error} = await supabase.auth.signUp({
                email,
                password
            });


            if(error){
                return {ok: false, error: error.message, code: error.code};
            }


            const needsEmailConfirmation = !data.session;


            return {ok: true, needsEmailConfirmation};
        },
        []
    );

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []);



    const sendPasswordReset = useCallback<AuthContextValue["sendPasswordReset"]>(
        async (email) => {
            const {error} = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if(error){
                return {ok: false, error: error.message, code: error.code};
            }

            return {ok: true};
        },
        []
    )


    const refreshUser = useCallback(async () => {
        if (!session) return;

        await loadUser(session.access_token);
    }, [session, loadUser]);


    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user,
            loading,
            isLoggedIn: !!session,
            signIn,
            signUp,
            signOut,
            sendPasswordReset,
            refreshUser
        }),
        [session, user, loading, signIn, signUp, signOut, sendPasswordReset, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



export function useAuth(): AuthContextValue{
    const ctx = useContext(AuthContext);


    if(!ctx){
        throw new Error("useAuth must be used within an AuthProvider")
    }


    return ctx;
}
