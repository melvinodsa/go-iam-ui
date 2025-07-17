


import { Loader2Icon, UserSearch } from "lucide-react"
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
import { useRoleState } from "@/hooks/roles"
import MultiSearchSelector from "@/components/ui/multi-search-selector"
import { useUserState, type RoleItem, type User } from "@/hooks/users"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Separator } from "@/components/ui/separator"

interface UpdateRoleProps {
    data: User
}

const UpdateRole = (props: UpdateRoleProps) => {
    const state = useUserState();
    const roleState = useRoleState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roles, setRoles] = useState<{ [key: string]: RoleItem }>(props.data.roles);


    const handleSubmit = useCallback(() => {
        const roleUpdatePayload = Object.keys(roles).reduce<{ to_be_added: string[], to_be_removed: string[] }>((acc, id) => {
            const role = props.data.roles[id];
            if (!role) {
                acc.to_be_added.push(roles[id].id);
            }
            return acc;
        }, { to_be_added: [], to_be_removed: [] });
        roleUpdatePayload.to_be_removed = Object.keys(props.data.roles).reduce<string[]>((acc, id) => {
            if (!roles[id]) {
                acc.push(id);
            }
            return acc;
        }, []);
        state.updateRole(props.data.id, roleUpdatePayload)
    }, [roles, props.data.id, props.data.roles, state.updateRole]);


    const searchRoles = useCallback((search: string) => {
        roleState.fetchRoles(search, 1, 10);
    }, [roleState.roles, roleState.fetchRoles]);

    useEffect(() => {
        if (state.updatedUser) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetUpdatedUser(); // Reset the created resource state
            state.fetchUsers("", 1, 10); // Fetch resources after creation
        }
    }, [state.updateUser]);
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>

                <Button variant="ghost" size="icon">
                    <UserSearch className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Role</DialogTitle>
                    <DialogDescription>
                        Update roles for the user in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <MultiSearchSelector
                        selected={Object.keys(roles)}
                        onChange={(selected: string[]) => {
                            setRoles(selected.reduce<{ [key: string]: RoleItem }>((acc, id) => {
                                const role = roleState.roleMap[id];
                                if (role) {
                                    acc[id] = {
                                        id: role.id,
                                        name: role.name,
                                    }
                                } else if (roles[id]) {
                                    acc[id] = roles[id];
                                }
                                return acc;
                            }, {}));
                        }}
                        options={roleState.roles.map(res => ({
                            label: res.name,
                            value: res.id,
                        }))}
                        loadOptions={searchRoles}
                        title="Choose Roles"
                        placeholder="Update roles for the user"
                    />
                </div>

                <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                        <h4 className="mb-4 text-sm leading-none font-medium">Roles</h4>
                        {Object.keys(roles).map((role) => (
                            <React.Fragment key={role}>
                                <div className="text-sm">{roles[role].name}</div>
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

export default UpdateRole;