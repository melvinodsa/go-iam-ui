


import { CirclePlus, Loader2Icon } from "lucide-react"
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
import { useResourceState } from "@/hooks/resources"
import { useCallback, useEffect, useState } from "react"
import { useRoleState, type ResourceItem } from "@/hooks/roles"
import { useProjectState } from "@/hooks/projects"
import MultiSearchSelector from "@/components/ui/multi-search-selector"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


const AddRole = () => {
    const state = useRoleState();
    const projectState = useProjectState();
    const resourceState = useResourceState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [resources, setResources] = useState<{ [key: string]: ResourceItem }>({});

    useEffect(() => {
        if (dialogOpen) {
            resourceState.fetchResources("", 1, 10); // Fetch resources when dialog opens
        }
    }, [dialogOpen]);
    useEffect(() => {
        if (state.createdRole) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetCreatedRole(); // Reset the created role state
            state.fetchRoles("", 1, 10); // Fetch roles after creation
        }
    }, [state.createdRole]);

    const searchResources = useCallback((search: string) => {
        resourceState.fetchResources(search, 1, 10);
    }, [resourceState.resources, resourceState.fetchResources]);


    const handleSubmit = useCallback(() => {
        const role = {
            id: "",
            name: name,
            description: description,
            project_id: projectState.project?.id || "",
            resources: resources,
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.registerRole(role)
    }, [name, description, resources, projectState.project?.id]);

    const isValid = name.trim() !== "";
    const disabled = state.registeringRole || !isValid;

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => setDialogOpen(true)}>
                            <CirclePlus className="mr-2 h-4 w-4" />Add
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Role</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register Resource</DialogTitle>
                    <DialogDescription>
                        Register a resource in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My Previleged Role" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description-1">Description</Label>
                        <Textarea id="description-1" name="description" placeholder="Description about the role" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <MultiSearchSelector
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
                        placeholder="Select resources for the role"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={disabled}>
                        {state.registeringRole ? (
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

export default AddRole;