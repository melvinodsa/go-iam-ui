import { API_SERVER } from "@/config/config"
import { hookstate, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"

export interface Setup {
    client_added: boolean
    client_id: string
}


export interface User {
    name: string
    email: string
    id: string
    profile_pic: string
    created_at: string
    updated_at: string
    created_by: string
    updated_by: string
    enabled: boolean
    expiry: string
    resources: { [key: string]: { id: string, key: string, name: string } }
    roles: { [key: string]: { id: string, name: string } }
}

interface SetupMeResponse {
    success: boolean
    message: string
    data: {
        setup: Setup
        user: User
    }
}


interface VerifyResponse {
    success: boolean
    message: string
    data: {
        access_token: string
    }
}

interface AuthState {
    clientAvailable: boolean
    user?: User
    loadingAuth: boolean
    verifying: boolean
    client_id: string
    token?: string
    err: string
    redirect: boolean
    loadedState: boolean
    verified: boolean // This is used to check if the user has verified their account
    localStoreUpdatedAt: string // This is used to check if the local storage has been updated
}

const state = hookstate<AuthState>({
    clientAvailable: false,
    verifying: false,
    client_id: localStorage.getItem("client_id") || "",
    token: localStorage.getItem("access_token") || "",
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "null") : null,
    loadingAuth: false,
    err: "",
    redirect: false,
    loadedState: false,
    verified: false, // This is used to check if the user has verified their account
    localStoreUpdatedAt: localStorage.getItem("localStoreUpdatedAt") || "", // This is used to check if the local storage has been updated
})

export interface AuthWrapState {
    fetchMe: (dontUpdateTime?: boolean) => void
    verify: (code: string) => void
    fetch: (url: string, init?: RequestInit) => Promise<Response>
    logout: () => void
    err: string
    loadedState: boolean
    clientAvailable: boolean
    clientId: string
    loadingAuth: boolean
    verifying: boolean
    user?: User
    verified: boolean // This is used to check if the user has verified their account
}

const wrapState = (state: State<AuthState>): AuthWrapState => ({
    fetchMe: (dontUpdateTime?: boolean) => {
        const lastUpdatedAt = new Date(state.localStoreUpdatedAt.value);
        const now = new Date();
        console.debug("Last updated at:", lastUpdatedAt, "Now:", now);
        if (!dontUpdateTime && now.getTime() - lastUpdatedAt.getTime() < 5 * 60 * 1000) {
            state.clientAvailable.set(state.client_id.value ? true : false);
            state.loadedState.set(true)
            console.debug("Skipping fetchMe as local store was updated recently");
            return;
        }
        if (state.loadingAuth.value) {
            console.debug("Already loading, ignoring new me request");
            return;
        }
        state.loadingAuth.set(true);
        const url = `${API_SERVER}/me/v1/dashboard`;

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (state.token.value && state.token.value.length > 0) {
            headers["Authorization"] = `Bearer ${state.token.value}`;
        }

        //normal fetch
        const loadingResolve = fetch(url, {
            headers,
        })
            .then((response) => {
                if (!response.ok && response.status !== 401) {
                    throw new Error("Network response was not ok");
                }

                if (response.status === 401 && window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
                return response.json();
            })
            .then((data: SetupMeResponse) => {
                // local caching variables
                if (!dontUpdateTime) {
                    const date = new Date().toISOString()
                    state.localStoreUpdatedAt.set(date);
                    localStorage.setItem("localStoreUpdatedAt", date);
                }
                state.client_id.set(data.data?.setup.client_id);
                localStorage.setItem("client_id", data.data?.setup.client_id || "");
                state.user.set(data.data?.user);
                localStorage.setItem("user", JSON.stringify(data.data?.user || null));
                console.debug("Fetched user:", data.data?.user);

                state.clientAvailable.set(data.data?.setup.client_id ? true : false);
                state.loadedState.set(true)

                state.loadingAuth.set(false);
            })
            .catch((error) => {
                state.clientAvailable.set(false);
                state.loadingAuth.set(false);
                throw new Error(`Failed to fetch auth info: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading auth info...",
            success: "Auth info loaded successfully",
            error: err => err.message || "Failed to load auth info",
        });
    },
    verify: (code: string) => {
        if (state.verifying.value) {
            console.debug("Already loading, ignoring new verify request");
            return;
        }
        state.verifying.set(true);
        const url = `${API_SERVER}/auth/v1/verify?code=${encodeURIComponent(code)}`;
        //normal fetch
        const loadingResolve = fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                return response.json();
            })
            .then((data: VerifyResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to verify the code");
                }
                state.token.set(data.data.access_token);
                localStorage.setItem("access_token", data.data.access_token);
                state.verified.set(true)
                state.verifying.set(false);
            })
            .catch((error) => {
                state.verifying.set(false);
                throw new Error(`Failed to verify the code: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Verifying auth...",
            success: "Auth info verified successfully",
            error: err => err.message || "Failed to verify auth info",
        });
    },
    fetch: (url: string, init?: RequestInit) => {
        if (state.token.value && state.token.value.length > 0) {
            if (!init) {
                init = {};
            }
            const headers: Record<string, string> = (init.headers as Record<string, string>) || {};
            headers["Authorization"] = `Bearer ${state.token.value}`;
            init.headers = headers;
        }
        return fetch(url, {
            ...init,
        }).then((response) => {
            if (response.status === 401) {
                localStorage.setItem("loadedState", "false");
                window.location.href = "/login";
            }
            return response;
        });
    },
    logout: () => {
        // locally cached variables
        const now = new Date();
        const updated = now.setMinutes(now.getMinutes() - 5);
        state.localStoreUpdatedAt.set(new Date(updated).toISOString());
        localStorage.setItem("localStoreUpdatedAt", new Date(updated).toISOString());
        state.client_id.set("");
        localStorage.removeItem("client_id");
        state.token.set("");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        state.user.set(undefined);

        // reset normal state
        state.clientAvailable.set(false);
        state.user.set(undefined);
        state.loadedState.set(false);
        state.verified.set(false);
        window.location.href = "/login";
    },
    err: state.err.value,
    loadedState: state.loadedState.value,
    clientAvailable: state.clientAvailable.value,
    clientId: state.client_id.value,
    loadingAuth: state.loadingAuth.value,
    verifying: state.verifying.value,
    user: state.user.value,
    verified: state.verified.value,
})


export const useAuthState = () => wrapState(useHookstate(state))