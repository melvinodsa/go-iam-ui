import { API_SERVER } from "@/config/config"
import { hookstate, type Immutable, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"
import { useProjectState, type ProjectWrapState } from "../projects"
import { useAuthState, type AuthWrapState } from "../auth"


export interface ResourceItem {
    id: string
    name: string
    key: string
}

export interface RoleItem {
    id: string
    name: string
}


export interface PolicyItem {
    name: string
    mapping: PolicyMapping
}

export interface PolicyMapping {
    arguments: { [key: string]: PolicyMappingValue }
}

export interface PolicyMappingValue {
    static: string
}

export interface User {
    id: string
    name: string
    project_id: string
    email: string
    phone: string
    expiry: string | null
    resources: { [key: string]: ResourceItem | Immutable<ResourceItem> }
    roles: { [key: string]: RoleItem | Immutable<RoleItem> }
    policies: { [key: string]: PolicyItem | Immutable<PolicyItem> }
    enabled: boolean
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}


interface UsersResponse {
    success: boolean
    message: string
    data: {
        users: User[]
        total: number
        skip: number
        limit: number
    }
}

interface UserResponse {
    success: boolean
    message: string
    data: User
}

interface UserState {
    usersForWidgets: User[]
    users: User[]
    loadingUsers: boolean
    updatingUser: boolean
    registeringUser: boolean
    err: string
    total: number
    pages: number[]
    currentPage: number
    createdUser: boolean
    updatedUser: boolean
}

const state = hookstate<UserState>({
    usersForWidgets: [],
    users: [],
    loadingUsers: false,
    updatingUser: false,
    registeringUser: false,
    createdUser: false,
    updatedUser: false,
    err: "",
    total: 0,
    pages: [],
    currentPage: 1,
})

const wrapState = (state: State<UserState>, project: ProjectWrapState, auth: AuthWrapState) => ({
    fetchUsers: (search: string, page: number, limit: number) => {
        if (state.loadingUsers.value) {
            console.debug("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingUsers.set(true);
        const sanirisedSearch = encodeURIComponent(search.trim());
        const url = `${API_SERVER}/user/v1/?query=${sanirisedSearch}&skip=${(page - 1) * limit}&limit=${limit}`;
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
            .then((data: UsersResponse) => {
                state.users.set(data.data.users);
                state.total.set(data.data.total);
                state.pages.set(Array.from({ length: Math.ceil(data.data.total / limit) }, (_, i) => i + 1));
                state.currentPage.set(page);
                state.loadingUsers.set(false);
            })
            .catch((error) => {
                state.loadingUsers.set(false);
                throw new Error(`Failed to fetch users: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading users...",
            success: "Users loaded successfully",
            error: err => err.message || "Failed to load users",
        });
    },
    fetchUsersForWidgets: (search: string, page: number, limit: number) => {
        if (state.loadingUsers.value) {
            console.debug("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingUsers.set(true);
        const sanirisedSearch = encodeURIComponent(search.trim());
        const url = `${API_SERVER}/user/v1/?query=${sanirisedSearch}&skip=${(page - 1) * limit}&limit=${limit}`;
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
            .then((data: UsersResponse) => {
                state.usersForWidgets.set(data.data.users);
                state.loadingUsers.set(false);
            })
            .catch((error) => {
                state.loadingUsers.set(false);
                throw new Error(`Failed to fetch users: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading users...",
            success: "Users loaded successfully",
            error: err => err.message || "Failed to load users",
        });
    },
    registerUser: (user: User) => {
        if (state.registeringUser.value) {
            console.debug("Already registering, ignoring new create request");
            return;
        }
        state.registeringUser.set(true);
        const url = `${API_SERVER}/user/v1/`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(user),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: UserResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to register user");
                }
                state.createdUser.set(true);
                state.registeringUser.set(false);
            })
            .catch((error) => {
                state.registeringUser.set(false);
                throw new Error(`Failed to register user: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Registering users...",
            success: "User registered successfully",
            error: err => err.message || "Failed to register user",
        });
    },
    updateUser: (user: User) => {
        if (state.updatingUser.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingUser.set(true);
        const url = `${API_SERVER}/user/v1/${user.id}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(user),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: UserResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update user");
                }
                state.updatedUser.set(true);
                state.updatingUser.set(false);
            })
            .catch((error) => {
                state.updatingUser.set(false);
                throw new Error(`Failed to update user: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating users...",
            success: "User updated successfully",
            error: err => err.message || "Failed to update user",
        });
    },
    updateRole: (id: string, roles: { to_be_added: string[], to_be_removed: string[] }) => {
        if (state.updatingUser.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingUser.set(true);
        const url = `${API_SERVER}/user/v1/${id}/roles`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            },
            body: JSON.stringify(roles),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: UserResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update user roles");
                }
                state.updatedUser.set(true);
                state.updatingUser.set(false);
            })
            .catch((error) => {
                state.updatingUser.set(false);
                throw new Error(`Failed to update user roles: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating user roles...",
            success: "User roles updated successfully",
            error: err => err.message || "Failed to update user roles",
        });
    },
    updatePolicy: (id: string, policies: { to_be_added: { [key: string]: PolicyItem }, to_be_removed: string[] }) => {
        if (state.updatingUser.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingUser.set(true);
        const url = `${API_SERVER}/user/v1/${id}/policies`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(policies),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: UserResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update user policies");
                }
                state.updatedUser.set(true);
                state.updatingUser.set(false);
            })
            .catch((error) => {
                state.updatingUser.set(false);
                throw new Error(`Failed to update user policies: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating user policies...",
            success: "User policies updated successfully",
            error: err => err.message || "Failed to update user policies",
        });
    },
    transferOwnership: (oldId: string, newOwnerId: string) => {
        if (state.updatingUser.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingUser.set(true);
        const url = `${API_SERVER}/user/v1/${oldId}/transfer-ownership/${newOwnerId}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: UserResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to transfer ownership");
                }
                state.updatedUser.set(true);
                state.updatingUser.set(false);
            })
            .catch((error) => {
                state.updatingUser.set(false);
                throw new Error(`Failed to transfer ownership: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Transferring ownership...",
            success: "Ownership transferred successfully",
            error: err => err.message || "Failed to transfer ownership",
        });
    },
    copyResources: (sourceUserId: string, targetUserId: string) => {
        if (state.updatingUser.value) {
            console.debug("Already updating, ignoring new update request");
            return;
        }
        state.updatingUser.set(true);
        const url = `${API_SERVER}/user/v1/${sourceUserId}/copy-resources/${targetUserId}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Project-Ids": project.project?.id || "",
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: UserResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to copy resources");
                }
                state.updatedUser.set(true);
                state.updatingUser.set(false);
            })
            .catch((error) => {
                state.updatingUser.set(false);
                throw new Error(`Failed to copy resources: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Copying resources...",
            success: "Resources copied successfully",
            error: err => err.message || "Failed to copy resources",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    resetCreatedUser: () => {
        state.createdUser.set(false);
    },
    resetUpdatedUser: () => {
        state.updatedUser.set(false);
    },
    updatedUser: state.updatedUser.value,
    createdUser: state.createdUser.value,
    loadingUsers: state.loadingUsers.value,
    updatingUser: state.updatingUser.value,
    registeringUser: state.registeringUser.value,
    err: state.err.value,
    users: state.users.value,
    pages: state.pages.value,
    total: state.total.value,
    currentPage: state.currentPage.value,
})


export const useUserState = () => wrapState(useHookstate(state), useProjectState(), useAuthState())