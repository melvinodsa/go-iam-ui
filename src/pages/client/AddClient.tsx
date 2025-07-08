


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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCallback, useEffect, useState } from "react"
import { useProjectState } from "@/hooks/projects"
import { useClientState } from "@/hooks/clients"
import { useAuthProviderState } from "@/hooks/authproviders"

const AddClient = () => {
    const state = useClientState();
    const projectState = useProjectState();
    const authProviderState = useAuthProviderState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [redirectUrls, setRedirectUrls] = useState("");
    const [defaultAuthProviderId, setDefaultAuthProviderId] = useState("");


    const handleSubmit = useCallback(() => {
        const client = {
            id: "",
            name: name,
            description: description,
            secret: "",
            tags: tags.split(",").map(tag => tag.trim()), // Split tags by comma and trim whitespace
            redirect_urls: redirectUrls.split(",").map(url => url.trim()), // Split redirect URLs by comma and trim whitespace
            project_id: projectState.project?.id || "",
            default_auth_provider_id: defaultAuthProviderId,
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.createClient(client)
    }, [name, description, tags, redirectUrls, defaultAuthProviderId, projectState.project?.id]);
    useEffect(() => {
        if (state.createdClient) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetCreatedClient(); // Reset the created client state
            state.fetchClients(); // Fetch clients after creation
        }
    }, [state.createdClient]);
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CirclePlus className="mr-2 h-4 w-4" />Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                    <DialogDescription>
                        Add a client in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My superhero project" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description-1">Description</Label>
                        <Textarea id="description-1" name="description" placeholder="Description about the project" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="tags-1">Tags</Label>
                        <Textarea id="tags-1" name="tags" placeholder="Comma separated tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="redirect-urls-1">Redirected Urls</Label>
                        <Textarea id="redirect-urls-1" name="redirect-urls" placeholder="Comma separated redirected urls" value={redirectUrls} onChange={(e) => setRedirectUrls(e.target.value)} />
                    </div>
                    <Select value={defaultAuthProviderId} onValueChange={(value) => setDefaultAuthProviderId(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Auth Providers</SelectLabel>
                                {authProviderState.authproviders.map((provider) => (
                                    <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={state.creatingClient}>
                        {state.creatingClient ? (
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

export default AddClient;