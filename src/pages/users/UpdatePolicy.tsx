


import { FileText, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import React, { useCallback, useEffect, useState } from "react"
import { useUserState, type PolicyItem, type PolicyMappingValue, type User } from "@/hooks/users"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Separator } from "@/components/ui/separator"
import { DataType, usePolicyState, type Policy } from "@/hooks/policies"
import type { Immutable, ImmutableObject } from "@hookstate/core"
import SingleSearchSelector from "@/components/ui/single-search-selector"
import { useRoleState } from "@/hooks/roles"

interface UpdatePolicyProps {
    data: User
}

const UpdatePolicy = (props: UpdatePolicyProps) => {
    const state = useUserState();
    const policyState = usePolicyState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [policy, setPolicy] = useState<ImmutableObject<Policy> | null>(null);
    const [policies, setPolicies] = useState<{ [key: string]: PolicyItem | Immutable<PolicyItem> }>(props.data.policies);


    const handleSubmit = useCallback(() => {
        const policyUpdatePayload = Object.keys(policies).reduce<{ to_be_added: { [key: string]: PolicyItem }, to_be_removed: string[] }>((acc, id) => {
            const policy = props.data.policies[id];
            if (!policy) {
                acc.to_be_added[id] = JSON.parse(JSON.stringify(policies[id]));
            }
            return acc;
        }, { to_be_added: {}, to_be_removed: [] });
        policyUpdatePayload.to_be_removed = Object.keys(props.data.policies).reduce<string[]>((acc, id) => {
            if (!policies[id]) {
                acc.push(id);
            }
            return acc;
        }, []);
        state.updatePolicy(props.data.id, policyUpdatePayload)
    }, [policies, props.data.id, props.data.roles, state.updatePolicy]);


    const searchPolicies = useCallback((query: string) => {
        policyState.fetchPolicies(query, 1, 100);
    }, [policyState.policies, policyState.fetchPolicies]);

    useEffect(() => {
        if (state.updatedUser) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetUpdatedUser(); // Reset the created resource state
            state.fetchUsers("", 1, 10); // Fetch resources after creation
        }
    }, [state.updateUser]);

    useEffect(() => {
        if (policy?.definition.arguments.length === 0) {
            setPolicies(prev => ({ ...prev, [policy.id]: { name: policy.name, mapping: { arguments: {} } } }))
        }
    }, [policy]);
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>

                <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Policy</DialogTitle>
                    <DialogDescription>
                        Update policies for the user in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <SingleSearchSelector
                        onSelect={(selected: string) => {
                            if (policies[selected]) {
                                setPolicy(null);
                            } else {
                                setPolicy(policyState.policyMap[selected] || null);
                            }
                        }}
                        options={policyState.policies.map(res => ({
                            label: res.name,
                            value: res.id,
                        }))}
                        loadOptions={searchPolicies}
                        title="Choose Policy"
                    />
                </div>

                <PolicySetup policy={policy} setPolicy={setPolicy} policySetup={(id, item) => {
                    setPolicies(prev => ({
                        ...prev,
                        [id]: {
                            name: item.name,
                            mapping: item.mapping
                        }
                    }));
                    setPolicy(null);
                }} />

                <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                        <h4 className="mb-4 text-sm leading-none font-medium">Policies</h4>
                        {Object.keys(policies).map((policy) => (
                            <React.Fragment key={policy}>
                                <div className="text-sm">{policies[policy]?.name}</div>
                                <Separator className="my-2" />
                            </React.Fragment>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={state.updatingUser}>
                        {state.updatingUser ? (
                            <><Loader2Icon className="animate-spin" /> Saving changes...</>
                        ) : (
                            "Save changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface PolicySetupProps {
    policy: ImmutableObject<Policy> | null
    setPolicy: (policy: ImmutableObject<Policy> | null) => void
    policySetup: (id: string, policy: PolicyItem) => void
}

const PolicySetup = (props: PolicySetupProps) => {
    const [policyArgs, setPolicyArgs] = useState<{ [key: string]: string }>({});

    return (
        <Dialog open={props.policy !== null} onOpenChange={() => props.setPolicy(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Map Policy</DialogTitle>
                    <DialogDescription>
                        Map values of the policy
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    {props.policy?.definition.arguments.map((arg) => (
                        <div key={arg.name} className="grid gap-3">
                            <label htmlFor={`policy-arg-${arg.name}`} className="text-sm font-medium">{arg.description}</label>
                            <DataSelector
                                onSelect={(selected) => {
                                    const existingValue = policyArgs;
                                    existingValue[arg.name] = selected.value;
                                    setPolicyArgs({ ...existingValue });
                                    if ((props.policy?.definition.arguments.length || 0) === Object.keys(existingValue).length) {
                                        props.policySetup(props.policy?.id || "", {
                                            name: props.policy?.name,
                                            mapping: {
                                                arguments: Object.keys(existingValue).reduce<{ [key: string]: PolicyMappingValue }>((acc, key) => {
                                                    acc[key] = { static: existingValue[key] };
                                                    return acc;
                                                }, {})
                                            }
                                        } as PolicyItem);
                                    }
                                }}
                                dataType={arg.data_type}
                            />
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface DataSelectorProps {
    onSelect: (selected: { label: string, value: string }) => void
    dataType: DataType
}

const DataSelector = (props: DataSelectorProps) => {
    const userState = useUserState();
    const roleState = useRoleState();
    let options: { label: string, value: string }[] = [];
    if (props.dataType === DataType.User) {
        options = userState.users.map(user => ({
            label: user.name,
            value: user.id
        }));
    } else if (props.dataType === DataType.Role) {
        options = roleState.roles.map(role => ({
            label: role.name,
            value: role.id
        }));
    }
    const searchOptions = useCallback((search: string) => {
        if (props.dataType === DataType.User) {
            userState.fetchUsers(search, 1, 10);
        } else if (props.dataType === DataType.Role) {
            roleState.fetchRoles(search, 1, 10);
        }
    }, [roleState.fetchRoles, userState.fetchUsers, props.dataType]);
    return (
        <div className="grid gap-4">
            <SingleSearchSelector
                onSelect={(selected: string) => {
                    const selectedOption = options.find(opt => opt.value === selected);
                    if (selectedOption) {
                        props.onSelect(selectedOption);
                    }
                }}
                options={options}
                loadOptions={searchOptions}
                title={`Choose ${props.dataType}`}
            />
        </div>
    )
}

export default UpdatePolicy;