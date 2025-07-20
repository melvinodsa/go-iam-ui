


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
import { useResourceState, type Resource } from "@/hooks/resources"
import { useCallback, useEffect, useState } from "react"

interface UpdateResourceProps {
    data: Resource
}

const UpdateResource = (props: UpdateResourceProps) => {
    const state = useResourceState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState(props.data.name || "");
    const [key, setKey] = useState(props.data.key || "");
    const [description, setDescription] = useState(props.data.description || "");


    const handleSubmit = useCallback(() => {
        const resource = {
            id: props.data.id,
            name: name,
            key: key,
            description: description,
            project_id: props.data.project_id,
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.updateResource(resource)
    }, [name, description, key]);
    useEffect(() => {
        if (state.updatedResource) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetUpdatedResource(); // Reset the created resource state
            state.fetchResources("", 1, 10); // Fetch resources after creation
        }
    }, [state.updatedResource]);

    const isValid = name.trim() !== "" && key.trim() !== "";
    const disabled = state.updatingResource || !isValid;
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
                        <Label htmlFor="key-1">Key</Label>
                        <Input id="key-1" name="key" placeholder="@myapp/ui/delete-button" value={key} onChange={(e) => setKey(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description-1">Description</Label>
                        <Textarea id="description-1" name="description" placeholder="Description about the resource" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={disabled}>
                        {state.updatingResource ? (
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

export default UpdateResource;