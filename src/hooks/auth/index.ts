import { API_SERVER } from "@/config/config"
import { useGoIam, type User } from "@goiam/react"
import { toast } from "sonner"

export interface Setup {
    client_added: boolean
    client_id: string
}




export interface AuthWrapState {
    fetchMe: (dontUpdateTime?: boolean) => void
    verify: (codeChallenge: string, code: string) => void
    fetch: (url: string, init?: RequestInit) => Promise<Response>
    login: () => void
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

const wrapState = (state: ReturnType<typeof useGoIam>): AuthWrapState => ({
    fetchMe: (dontUpdateTime?: boolean) => {
        const result = state.dashboardMe(dontUpdateTime)
        toast.promise(result, {
            loading: "Loading auth info...",
            success: "Auth info loaded successfully",
            error: err => err.message || "Failed to load auth info",
        });
    },
    verify: (codeChallenge: string, code: string) => {
        const result = state.verify(codeChallenge, code)
        toast.promise(result, {
            loading: "Verifying...",
            success: "Verified successfully",
            error: err => err.message || "Failed to verify",
        });
    },
    login: state.login,
    fetch: state.fetch,
    logout: state.logout,
    err: state.err,
    loadedState: state.loadedState,
    clientAvailable: state.clientAvailable,
    clientId: state.clientId,
    loadingAuth: state.loadingMe,
    verifying: state.verifying,
    user: state.user,
    verified: state.verified,
})


export const useAuthState = () => {
    const state = useGoIam()
    state.setBaseUrl(API_SERVER)
    return wrapState(state)
}