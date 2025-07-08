


import { Edit, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCallback, useEffect, useState } from "react"
import { useRoleState, type ResourceItem, type Role } from "@/hooks/roles"
import ResourceSelector from "./ResourceSelector"
import { useResourceState } from "@/hooks/resources"

interface UpdateRoleProps {
    data: Role
}

const UpdateRole = (props: UpdateRoleProps) => {
    const state = useRoleState();
    const resourceState = useResourceState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState(props.data.name || "");
    const [description, setDescription] = useState(props.data.description || "");
    const [resources, setResources] = useState<{ [key: string]: ResourceItem }>(props.data.resources);


    const handleSubmit = useCallback(() => {
        const role = {
            id: props.data.id,
            name: name,
            description: description,
            resources: resources || [],
            project_id: props.data.project_id || "",
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.updateRole(role)
    }, [name, description, resources]);

    console.log(resources)




    const searchResources = useCallback((search: string) => {
        resourceState.fetchResources(search, 1, 10);
    }, [resourceState.resources, resourceState.fetchResources]);

    useEffect(() => {
        if (state.updatedRole) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetUpdatedRole(); // Reset the created resource state
            state.fetchRoles("", 1, 10); // Fetch resources after creation
        }
    }, [state.updatedRole]);
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>

                <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Resource</DialogTitle>
                    <DialogDescription>
                        Update the existing resource in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My Previleged Button" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description-1">Description</Label>
                        <Textarea id="description-1" name="description" placeholder="Description about the resource" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <ResourceSelector
                        selected={Object.keys(resources)}
                        onChange={(selected: string[]) => {
                            setResources(selected.reduce<{ [key: string]: ResourceItem }>((acc, id) => {
                                const resource = resourceState.resourceMap[id];
                                if (resource) {
                                    acc[id] = {
                                        id: resource.id,
                                        name: resource.name,
                                        key: resource.key,
                                    }
                                } else if (resources[id]) {
                                    acc[id] = resources[id];
                                }
                                return acc;
                            }, {}));
                        }}
                        options={resourceState.resources.map(res => ({
                            label: res.name,
                            value: res.key,
                        }))}
                        loadOptions={searchResources}
                        title="Choose Resources"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={state.updatingRole}>
                        {state.updatingRole ? (
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