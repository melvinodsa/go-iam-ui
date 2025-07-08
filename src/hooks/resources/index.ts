import { API_SERVER } from "@/config/config"
import { hookstate, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"

export interface Resource {
    id: string
    name: string
    description: string
    key: string
    enabled: boolean
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}


interface ResourcesResponse {
    success: boolean
    message: string
    data: {
        resources: Resource[]
        total: number
        skip: number
        limit: number
    }
}

interface ResourceResponse {
    success: boolean
    message: string
    data: Resource
}

interface ResourceState {
    resources: Resource[]
    loadingResources: boolean
    updatingResource: boolean
    registeringResource: boolean
    resource: Resource | null
    err: string
    total: number
    pages: number[]
    currentPage: number
    createdResource: boolean
    updatedResource: boolean
}

const state = hookstate<ResourceState>({
    resources: [],
    loadingResources: false,
    updatingResource: false,
    registeringResource: false,
    createdResource: false,
    updatedResource: false,
    resource: null,
    err: "",
    total: 0,
    pages: [],
    currentPage: 1,
})

const wrapState = (state: State<ResourceState>) => ({
    fetchResources: (search: string, page: number, limit: number) => {
        if (state.loadingResources.value) {
            console.warn("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingResources.set(true);
        const sanirisedSearch = encodeURIComponent(search.trim());
        const url = `${API_SERVER}/resource/v1/search?name=${sanirisedSearch}&description=${sanirisedSearch}&key=${sanirisedSearch}&skip=${(page - 1) * limit}&limit=${limit}`;
        //mormal fetch
        const loadingResolve = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ResourcesResponse) => {
                state.resources.set(data.data.resources);
                state.total.set(data.data.total);
                state.pages.set(Array.from({ length: Math.ceil(data.data.total / limit) }, (_, i) => i + 1));
                state.currentPage.set(page);
                state.loadingResources.set(false);
            })
            .catch((error) => {
                state.loadingResources.set(false);
                throw new Error(`Failed to fetch resources: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading resources...",
            success: "Resources loaded successfully",
            error: err => err.message || "Failed to load resources",
        });
    },
    registerResource: (resource: Resource) => {
        if (state.registeringResource.value) {
            console.warn("Already registering, ignoring new create request");
            return;
        }
        state.registeringResource.set(true);
        const url = `${API_SERVER}/resource/v1/`;
        //mormal fetch
        const loadingResolve = fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(resource),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ResourceResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to register resource");
                }
                state.createdResource.set(true);
                state.registeringResource.set(false);
            })
            .catch((error) => {
                state.registeringResource.set(false);
                throw new Error(`Failed to register resource: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Registering resources...",
            success: "Resource registered successfully",
            error: err => err.message || "Failed to register resource",
        });
    },
    updateResource: (resource: Resource) => {
        if (state.updatingResource.value) {
            console.warn("Already registering, ignoring new update request");
            return;
        }
        state.updatingResource.set(true);
        const url = `${API_SERVER}/resource/v1/${resource.id}`;
        //mormal fetch
        const loadingResolve = fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(resource),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ResourceResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update resource");
                }
                state.updatedResource.set(true);
                state.updatingResource.set(false);
            })
            .catch((error) => {
                state.updatingResource.set(false);
                throw new Error(`Failed to update resource: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating resources...",
            success: "Resource updated successfully",
            error: err => err.message || "Failed to update resource",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    resetCreatedResource: () => {
        state.createdResource.set(false);
    },
    resetUpdatedResource: () => {
        state.updatedResource.set(false);
    },
    updatedResource: state.updatedResource.value,
    createdResource: state.createdResource.value,
    loadingResources: state.loadingResources.value,
    updatingResource: state.updatingResource.value,
    registeringResource: state.registeringResource.value,
    err: state.err.value,
    resources: state.resources.value,
    resource: state.resource.value,
    pages: state.pages.value,
    total: state.total.value,
    currentPage: state.currentPage.value,
})


export const useResourceState = () => wrapState(useHookstate(state))