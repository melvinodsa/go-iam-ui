import { API_SERVER } from "@/config/config"
import { hookstate, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"
import { useProjectState, type ProjectWrapState } from "../projects"
import { useAuthState, type AuthWrapState } from "../auth"


export interface ResourceItem {
    id: string
    name: string
    key: string
}

export interface Role {
    id: string
    name: string
    description: string
    project_id: string
    resources: { [key: string]: ResourceItem }
    enabled: boolean
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}


interface RolesResponse {
    success: boolean
    message: string
    data: {
        roles: Role[]
        total: number
        skip: number
        limit: number
    }
}

interface RoleResponse {
    success: boolean
    message: string
    data: Role
}

interface RoleState {
    roles: Role[]
    loadingRoles: boolean
    updatingRole: boolean
    registeringRole: boolean
    err: string
    total: number
    pages: number[]
    currentPage: number
    createdRole: boolean
    updatedRole: boolean
}

const state = hookstate<RoleState>({
    roles: [],
    loadingRoles: false,
    updatingRole: false,
    registeringRole: false,
    createdRole: false,
    updatedRole: false,
    err: "",
    total: 0,
    pages: [],
    currentPage: 1,
})

const wrapState = (state: State<RoleState>, project: ProjectWrapState, auth: AuthWrapState) => ({
    fetchRoles: (search: string, page: number, limit: number) => {
        if (state.loadingRoles.value) {
            console.debug("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingRoles.set(true);
        const sanirisedSearch = encodeURIComponent(search.trim());
        const url = `${API_SERVER}/role/v1/?query=${sanirisedSearch}&skip=${(page - 1) * limit}&limit=${limit}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "GET",
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
            .then((data: RolesResponse) => {
                state.roles.set(data.data.roles);
                state.total.set(data.data.total);
                state.pages.set(Array.from({ length: Math.ceil(data.data.total / limit) }, (_, i) => i + 1));
                state.currentPage.set(page);
                state.loadingRoles.set(false);
            })
            .catch((error) => {
                state.loadingRoles.set(false);
                throw new Error(`Failed to fetch roles: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading roles...",
            success: "Roles loaded successfully",
            error: err => err.message || "Failed to load roles",
        });
    },
    registerRole: (role: Role) => {
        if (state.registeringRole.value) {
            console.debug("Already registering, ignoring new create request");
            return;
        }
        state.registeringRole.set(true);
        const url = `${API_SERVER}/role/v1/`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(role),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: RoleResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to register role");
                }
                state.createdRole.set(true);
                state.registeringRole.set(false);
            })
            .catch((error) => {
                state.registeringRole.set(false);
                throw new Error(`Failed to register role: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Registering roles...",
            success: "Role registered successfully",
            error: err => err.message || "Failed to register role",
        });
    },
    updateRole: (role: Role) => {
        if (state.updatingRole.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingRole.set(true);
        const url = `${API_SERVER}/role/v1/${role.id}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(role),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: RoleResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update role");
                }
                state.updatedRole.set(true);
                state.updatingRole.set(false);
            })
            .catch((error) => {
                state.updatingRole.set(false);
                throw new Error(`Failed to update role: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating roles...",
            success: "Role updated successfully",
            error: err => err.message || "Failed to update role",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    resetCreatedRole: () => {
        state.createdRole.set(false);
    },
    resetUpdatedRole: () => {
        state.updatedRole.set(false);
    },
    updatedRole: state.updatedRole.value,
    createdRole: state.createdRole.value,
    loadingRoles: state.loadingRoles.value,
    updatingRole: state.updatingRole.value,
    registeringRole: state.registeringRole.value,
    err: state.err.value,
    roles: state.roles.value,
    pages: state.pages.value,
    total: state.total.value,
    currentPage: state.currentPage.value,
    roleMap: state.roles.value.reduce<{ [key: string]: Role }>((acc, role) => {
        acc[role.id] = role;
        return acc;
    }, {} as Record<string, Role>),
})


export const useRoleState = () => wrapState(useHookstate(state), useProjectState(), useAuthState())