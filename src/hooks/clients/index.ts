import { API_SERVER } from "@/config/config"
import { hookstate, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"
import { useProjectState, type ProjectWrapState } from "../projects"
import { useAuthState, type AuthWrapState } from "../auth"

export interface Client {
    id: string
    name: string
    description: string
    secret: string
    tags: string[]
    redirect_urls: string[]
    project_id: string
    default_auth_provider_id: string
    go_iam_client: boolean
    enabled: boolean
    linked_user_id?: string
    service_account_email?: string
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}


interface ClientsResponse {
    success: boolean
    message: string
    data: Client[]
}

interface ClientResponse {
    success: boolean
    message: string
    data: Client
}

interface ClientsState {
    clients: Client[]
    loadingClients: boolean
    updatingClient: boolean
    creatingClient: boolean
    createdClientData: Client | null
    regeneratingSecret: boolean
    updatedClientData: Client | null
    err: string
    createdClient: boolean
    updatedClient: boolean
}

const state = hookstate<ClientsState>({
    clients: [],
    loadingClients: false,
    updatingClient: false,
    creatingClient: false,
    createdClient: false,
    updatedClient: false,
    regeneratingSecret: false,
    updatedClientData: null,
    createdClientData: null,
    err: "",
})

const wrapState = (state: State<ClientsState>, project: ProjectWrapState, auth: AuthWrapState) => ({
    fetchClients: () => {
        if (state.loadingClients.value) {
            console.debug("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingClients.set(true);
        const url = `${API_SERVER}/client/v1`;
        //normal fetch
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
            .then((data: ClientsResponse) => {
                state.clients.set(data.data);
                state.loadingClients.set(false);
            })
            .catch((error) => {
                state.loadingClients.set(false);
                throw new Error(`Failed to fetch clients: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading clients...",
            success: "Clients loaded successfully",
            error: err => err.message || "Failed to load clients",
        });
    },
    createClient: (client: Client) => {
        if (state.creatingClient.value) {
            console.debug("Already creating, ignoring new create request");
            return;
        }
        state.creatingClient.set(true);
        const url = `${API_SERVER}/client/v1/`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(client),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ClientResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to create client");
                }
                state.createdClient.set(true);
                state.creatingClient.set(false);
                state.createdClientData.set(data.data);
            })
            .catch((error) => {
                state.creatingClient.set(false);
                throw new Error(`Failed to create client: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Creating client...",
            success: "Client created successfully",
            error: err => err.message || "Failed to create client",
        });
    },
    updateClient: (client: Client) => {
        if (state.updatingClient.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingClient.set(true);
        const url = `${API_SERVER}/client/v1/${client.id}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(client),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ClientResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update client");
                }
                state.updatedClient.set(true);
                state.updatingClient.set(false);
            })
            .catch((error) => {
                state.updatingClient.set(false);
                throw new Error(`Failed to update client: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating client...",
            success: "Client updated successfully",
            error: err => err.message || "Failed to update client",
        });
    },
    regenerateClientSecret: (id: string) => {
        if (state.regeneratingSecret.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.regeneratingSecret.set(true);
        const url = `${API_SERVER}/client/v1/${id}/regenerate-secret`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
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
            .then((data: ClientResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to regenerate client");
                }
                state.updatedClientData.set(data.data);
                state.regeneratingSecret.set(false);
            })
            .catch((error) => {
                state.regeneratingSecret.set(false);
                throw new Error(`Failed to update client: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Regenerating the client secret...",
            success: "Client secret regenerated successfully",
            error: err => err.message || "Failed to regenerate client secret",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    resetCreatedClient: () => {
        state.createdClient.set(false);
        state.createdClientData.set(null);
    },
    resetUpdatedClient: () => {
        state.updatedClient.set(false);
    },
    updatedClient: state.updatedClient.value,
    createdClient: state.createdClient.value,
    loadingClients: state.loadingClients.value,
    updatingClient: state.updatingClient.value,
    creatingClient: state.creatingClient.value,
    createdClientData: state.createdClientData.value,
    regeneratingSecret: state.regeneratingSecret.value,
    updatedClientData: state.updatedClientData.value,
    err: state.err.value,
    clients: state.clients.value,
})


export const useClientState = () => wrapState(useHookstate(state), useProjectState(), useAuthState())