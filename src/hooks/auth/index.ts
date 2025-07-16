import { API_SERVER } from "@/config/config"
import { hookstate, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"

export interface Setup {
    client_added: boolean
    client_id: string
}


interface SetupMeResponse {
    success: boolean
    message: string
    data: {
        setup: Setup
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
    loadingAuth: boolean
    verifying: boolean
    client_id: string
    token?: string
    err: string
    redirect: boolean
    loadedState: boolean
    verified: boolean // This is used to check if the user has verified their account
}

const state = hookstate<AuthState>({
    clientAvailable: false,
    verifying: false,
    client_id: "",
    token: localStorage.getItem("access_token") || "",
    loadingAuth: false,
    err: "",
    redirect: false,
    loadedState: false,
    verified: false, // This is used to check if the user has verified their account
})

export interface AuthWrapState {
    fetchMe: () => void
    verify: (code: string) => void
    fetch: (url: string, init?: RequestInit) => Promise<Response>
    err: string
    loadedState: boolean
    clientAvailable: boolean
    clientId: string
    loadingAuth: boolean
    verifing: boolean
    verified: boolean // This is used to check if the user has verified their account
}

const wrapState = (state: State<AuthState>): AuthWrapState => ({
    fetchMe: () => {
        if (state.loadingAuth.value) {
            console.warn("Already loading, ignoring new me request");
            return;
        }
        state.loadingAuth.set(true);
        const url = `${API_SERVER}/me/v1/dashboard`;
        //mormal fetch
        const loadingResolve = fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token.value}`,
            },
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
                state.clientAvailable.set(data.data.setup.client_added);
                state.client_id.set(data.data.setup.client_id);
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
            console.warn("Already loading, ignoring new verify request");
            return;
        }
        state.verifying.set(true);
        const url = `${API_SERVER}/auth/v1/verify?code=${encodeURIComponent(code)}`;
        //mormal fetch
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
        return fetch(url, {
            ...init,
            headers: {
                ...(init?.headers || {}),
                "Authorization": `Bearer ${state.token.value}`,
            },
        }).then((response) => {
            if (response.status === 401) {
                window.location.href = "/login";
            }
            return response;
        });
    },
    err: state.err.value,
    loadedState: state.loadedState.value,
    clientAvailable: state.clientAvailable.value,
    clientId: state.client_id.value,
    loadingAuth: state.loadingAuth.value,
    verifing: state.verifying.value,
    verified: state.verified.value,
})


export const useAuthState = () => wrapState(useHookstate(state))