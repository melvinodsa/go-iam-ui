


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
import { useCallback, useEffect, useState } from "react"
import { useProjectState } from "@/hooks/projects"


const AddProject = () => {
    const state = useProjectState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [tags, setTags] = useState("");
    const [description, setDescription] = useState("");


    const handleSubmit = useCallback(() => {
        const project = {
            id: "",
            name: name,
            tags: tags.split(",").map(tag => tag.trim()), // Split tags by comma and trim whitespace
            description: description,
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.createProject(project)
    }, [name, description, tags]);
    useEffect(() => {
        if (state.createdProject) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetCreatedProject(); // Reset the created project state
            state.fetchProjects(""); // Fetch projects after creation
        }
    }, [state.createdProject]);

    const isValid = name.trim() !== "" && name.trim() !== "Default Project"
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CirclePlus className="mr-2 h-4 w-4" />Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                    <DialogDescription>
                        Add a project in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My superhero project" value={name} onChange={(e) => setName(e.target.value)} />
                        {name.trim() === "Default Project" && (
                            <p className="text-red-500 text-sm">Project name cannot be "Default Project"</p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="tags-1">Tags</Label>
                        <Textarea id="tags-1" name="tags" placeholder="Comma separated tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description-1">Description</Label>
                        <Textarea id="description-1" name="description" placeholder="Description about the project" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={state.creatingProject || !isValid}>
                        {state.creatingProject ? (
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

export default AddProject;