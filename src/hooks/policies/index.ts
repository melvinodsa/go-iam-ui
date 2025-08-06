import { API_SERVER } from "@/config/config"
import { hookstate, type ImmutableObject, type State, useHookstate } from "@hookstate/core"
import { toast } from "sonner"
import { useAuthState, type AuthWrapState } from "../auth"


export const DataType = {
    User: "user",
    Role: "role",
} as const;

export type DataType = typeof DataType[keyof typeof DataType];

export interface PolicyArgument {
    name: string
    description: string
    data_type: DataType
}

export interface PolicyDefinition {
    arguments: PolicyArgument[]
}

export interface Policy {
    id: string
    name: string
    description: string
    definition: PolicyDefinition
}


interface PoliciesResponse {
    success: boolean
    message: string
    data: {
        policies: Policy[]
        total: number
        skip: number
        limit: number
    }
}

interface PolicyState {
    policies: Policy[]
    loadingPolicies: boolean
    err: string
    total: number
    pages: number[]
    currentPage: number
}

const state = hookstate<PolicyState>({
    policies: [],
    loadingPolicies: false,
    err: "",
    total: 0,
    pages: [],
    currentPage: 1,
})

const wrapState = (state: State<PolicyState>, auth: AuthWrapState) => ({
    fetchPolicies: (page: number, limit: number) => {
        if (state.loadingPolicies.value) {
            console.debug("Already loading, ignoring new fetch request");
            return;
        }
        state.loadingPolicies.set(true);
        const url = `${API_SERVER}/policy/v1/?skip=${(page - 1) * limit}&limit=${limit}`;
        //normal fetch
        const loadingResolve = auth.fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data: PoliciesResponse) => {
                state.policies.set(data.data.policies);
                state.total.set(data.data.total);
                state.pages.set(Array.from({ length: Math.ceil(data.data.total / limit) }, (_, i) => i + 1));
                state.currentPage.set(page);
                state.loadingPolicies.set(false);
            })
            .catch((error) => {
                state.loadingPolicies.set(false);
                throw new Error(`Failed to fetch policies: ${error.message}`);
            });
        toast.promise(loadingResolve, {
            loading: "Loading policies...",
            success: "Policies loaded successfully",
            error: err => err.message || "Failed to load policies",
        });
    },
    resetError: () => {
        state.err.set("");
    },
    loadingPolicies: state.loadingPolicies.value,
    err: state.err.value,
    policies: state.policies.value,
    pages: state.pages.value,
    total: state.total.value,
    currentPage: state.currentPage.value,
    policyMap: state.policies.value.reduce<{ [key: string]: ImmutableObject<Policy> }>((acc, policy) => {
        acc[policy.id] = policy;
        return acc;
    }, {} as Record<string, ImmutableObject<Policy>>),
})


export const usePolicyState = () => wrapState(useHookstate(state), useAuthState())