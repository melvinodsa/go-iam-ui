import { API_SERVER } from "@/config/config"
import { hookstate, type ImmutableArray, type ImmutableObject, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"
import { useAuthState, type AuthWrapState } from "../auth"

export interface Project {
    id: string
    name: string
    description: string
    tags: string[]
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string
}


interface ProjectsResponse {
    success: boolean
    message: string
    data: Project[]
}

interface ProjectResponse {
    success: boolean
    message: string
    data: Project
}

interface ProjectState {
    projects: Project[]
    project: Project | null
    loadingProjects: boolean
    updatingProject: boolean
    creatingProject: boolean
    err: string
    loadedProjects: boolean
    createdProject: boolean
    updatedProject: boolean
}

const state = hookstate<ProjectState>({
    projects: [],
    project: JSON.parse(localStorage.getItem("selectedProject") || "null") as Project | null,
    loadingProjects: false,
    updatingProject: false,
    creatingProject: false,
    createdProject: false,
    updatedProject: false,
    loadedProjects: false,
    err: "",
})

export interface ProjectWrapState {
    fetchProjects: (search: string) => void
    createProject: (project: Project) => void
    updateProject: (project: Project) => void
    resetError: () => void
    resetCreatedProject: () => void
    resetUpdatedProject: () => void
    setProject: (id: string) => void
    updatedProject: boolean
    createdProject: boolean
    loadingProjects: boolean
    updatingProject: boolean
    creatingProject: boolean
    loadedProjects: boolean
    err: string
    projects: ImmutableArray<Project>
    project: ImmutableObject<Project | null>
}

const wrapState = (state: State<ProjectState>, authState: AuthWrapState): ProjectWrapState => ({
    fetchProjects: (search: string) => {
        if (state.loadingProjects.value) {
            console.warn("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingProjects.set(true);
        const sanirisedSearch = encodeURIComponent(search.trim());
        const url = `${API_SERVER}/project/v1?name=${sanirisedSearch}&description=${sanirisedSearch}`;
        //mormal fetch
        const loadingResolve = authState.fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ProjectsResponse) => {
                state.projects.set(data.data);
                if (!state.project.value) {
                    (state.project as State<Project | null>).set(data.data[0] || null);
                }
                state.loadingProjects.set(false);
                state.loadedProjects.set(true);
            })
            .catch((error) => {
                state.loadingProjects.set(false);
                throw new Error(`Failed to fetch projects: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading projects...",
            success: "Projects loaded successfully",
            error: err => err.message || "Failed to load projects",
        });
    },
    createProject: (project: Project) => {
        if (state.creatingProject.value) {
            console.warn("Already creating, ignoring new create request");
            return;
        }
        state.creatingProject.set(true);
        const url = `${API_SERVER}/project/v1/`;
        //mormal fetch
        const loadingResolve = authState.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(project),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ProjectResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to create project");
                }
                state.createdProject.set(true);
                state.creatingProject.set(false);
            })
            .catch((error) => {
                state.creatingProject.set(false);
                throw new Error(`Failed to create project: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Creating project...",
            success: "Project created successfully",
            error: err => err.message || "Failed to create project",
        });
    },
    updateProject: (project: Project) => {
        if (state.updatingProject.value) {
            console.warn("Already updating, ignoring new update request");
            return;
        }
        state.updatingProject.set(true);
        const url = `${API_SERVER}/project/v1/${project.id}`;
        //mormal fetch
        const loadingResolve = authState.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(project),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: ProjectResponse) => {
                if (!data.success) {
                    throw new Error(data.message || "Failed to update project");
                }
                state.updatedProject.set(true);
                state.updatingProject.set(false);
            })
            .catch((error) => {
                state.updatingProject.set(false);
                throw new Error(`Failed to update project: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Updating project...",
            success: "Project updated successfully",
            error: err => err.message || "Failed to update project",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    resetCreatedProject: () => {
        state.createdProject.set(false);
    },
    resetUpdatedProject: () => {
        state.updatedProject.set(false);
    },
    setProject: (id: string) => {
        const project = state.projects.value.find(p => p.id === id);
        if (project) {
            state.project.set(JSON.parse(JSON.stringify(project)));
            localStorage.setItem("selectedProject", JSON.stringify(project));
            window.location.reload(); // Reload to apply the new project context
        } else {
            console.warn(`Project with id ${id} not found`);
        }
    },
    updatedProject: state.updatedProject.value,
    createdProject: state.createdProject.value,
    loadingProjects: state.loadingProjects.value,
    updatingProject: state.updatingProject.value,
    creatingProject: state.creatingProject.value,
    loadedProjects: state.loadedProjects.value,
    err: state.err.value,
    projects: state.projects.value,
    project: state.project.value,
})


export const useProjectState = () => wrapState(useHookstate(state), useAuthState())