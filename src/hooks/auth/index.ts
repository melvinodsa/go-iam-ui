import { API_SERVER } from "@/config/config"
import { hookstate, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"

export interface Setup {
    client_added: boolean
}


interface SetupMeResponse {
    success: boolean
    message: string
    data: {
        setup: Setup
    }
}

interface AuthState {
    clientAvailable: boolean
    loadingAuth: boolean
    err: string
    loadedState: boolean
}

const state = hookstate<AuthState>({
    clientAvailable: false,
    loadingAuth: false,
    err: "",
    loadedState: false
})

const wrapState = (state: State<AuthState>) => ({
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
            },
        })
            .then((response) => {
                if (!response.ok && response.status !== 401) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: SetupMeResponse) => {
                state.clientAvailable.set(data.data.setup.client_added);
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
    err: state.err.value,
    loadedState: state.loadedState.value,
    clientAvailable: state.clientAvailable.value,
})


export const useAuthState = () => wrapState(useHookstate(state))