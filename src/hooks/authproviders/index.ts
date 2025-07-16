import { API_SERVER } from "@/config/config"
import { hookstate, type ImmutableObject, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"
import { useProjectState, type ProjectWrapState } from "../projects"
import { useAuthState, type AuthWrapState } from "../auth"


export interface Params {
    label: string
    value: string
    key: string
    is_secret: boolean
}

export interface AuthProvider {
    id: string
    name: string
    provider: string
    project_id: string
    params: Params[]
    enabled: boolean
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}


interface AuthProvidersResponse {
    success: boolean
    message: string
    data: AuthProvider[]
}

interface AuthProviderResponse {
    success: boolean
    message: string
    data: AuthProvider
}

interface AuthProvidersState {
    authproviders: AuthProvider[]
    loadingAuthProviders: boolean
    updatingAuthProvider: boolean
    creatingAuthProvider: boolean
    err: string
    createdAuthProvider: boolean
    updatedAuthProvider: boolean
}

const state = hookstate<AuthProvidersState>({
    authproviders: [],
    loadingAuthProviders: false,
    updatingAuthProvider: false,
    creatingAuthProvider: false,
    createdAuthProvider: false,
    updatedAuthProvider: false,
    err: "",
})

const wrapState = (state: State<AuthProvidersState>, project: ProjectWrapState, auth: AuthWrapState) => ({
    fetchAuthProviders: () => {
        if (state.loadingAuthProviders.value) {
            console.warn("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingAuthProviders.set(true);
        const url = `${API_SERVER}/authprovider/v1`;
        //mormal fetch
        const loadingResolve = auth.fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: AuthProvidersResponse) => {
                state.authproviders.set(data.data);
                state.loadingAuthProviders.set(false);
            })
            .catch((error) => {
                state.loadingAuthProviders.set(false);
                throw new Error(`Failed to fetch auth providers: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading projects...",
            success: "Projects loaded successfully",
            error: err => err.message || "Failed to load projects",
        });
    },
    createAuthProvider: (authProvider: AuthProvider) => {
        if (state.creatingAuthProvider.value) {
            console.warn("Already creating, ignoring new create request");
            return;
        }
        state.creatingAuthProvider.set(true);
        const url = `${API_SERVER}/authprovider/v1/`;
        //mormal fetch
        const loadingResolve = auth.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(authProvider),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: AuthProviderResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to create auth provider");
                }
                state.createdAuthProvider.set(true);
                state.creatingAuthProvider.set(false);
            })
            .catch((error) => {
                state.creatingAuthProvider.set(false);
                throw new Error(`Failed to create auth provider: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Creating auth provider...",
            success: "Auth provider created successfully",
            error: err => err.message || "Failed to create auth provider",
        });
    },
    updateAuthProvider: (authProvider: AuthProvider) => {
        if (state.updatingAuthProvider.value) {
            console.warn("Already updating, ignoring new update request");
            return;
        }
        state.updatingAuthProvider.set(true);
        const url = `${API_SERVER}/authprovider/v1/${authProvider.id}`;
        //mormal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(authProvider),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: AuthProviderResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update auth provider");
                }
                state.updatedAuthProvider.set(true);
                state.updatingAuthProvider.set(false);
            })
            .catch((error) => {
                state.updatingAuthProvider.set(false);
                throw new Error(`Failed to update auth provider: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating auth provider...",
            success: "Auth provider updated successfully",
            error: err => err.message || "Failed to update auth provider",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    resetCreatedAuthProvider: () => {
        state.createdAuthProvider.set(false);
    },
    resetUpdatedAuthProvider: () => {
        state.updatedAuthProvider.set(false);
    },
    updatedAuthProvider: state.updatedAuthProvider.value,
    createdAuthProvider: state.createdAuthProvider.value,
    loadingAuthProviders: state.loadingAuthProviders.value,
    updatingAuthProvider: state.updatingAuthProvider.value,
    creatingAuthProvider: state.creatingAuthProvider.value,
    err: state.err.value,
    authproviders: state.authproviders.value,
    authprovidersMap: state.authproviders.value.reduce<{ [key: string]: ImmutableObject<AuthProvider> }>((acc, authProvider) => {
        acc[authProvider.id] = authProvider;
        return acc;
    }, {}),
})


export const useAuthProviderState = () => wrapState(useHookstate(state), useProjectState(), useAuthState())