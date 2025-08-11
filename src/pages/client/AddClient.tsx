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
import { useCallback, useEffect, useMemo, useState } from "react"
import { useProjectState } from "@/hooks/projects"
import { useClientState } from "@/hooks/clients"
import { useAuthProviderState } from "@/hooks/authproviders"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthState } from "@/hooks/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import {AuthProviderTypeGoIAMClient} from "@/hooks/authproviders"


const AddClient = () => {
    const state = useClientState();
    const authState = useAuthState();
    const projectState = useProjectState();
    const authProviderState = useAuthProviderState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [redirectUrls, setRedirectUrls] = useState("");
    const [defaultAuthProviderId, setDefaultAuthProviderId] = useState("");
    const [goIamClient, setGoIamClient] = useState(false);
    const [linkedUserEmail, setLinkedUserEmail] = useState("");

    // Check if selected auth provider is GOIAM/CLIENT
    const selectedProvider = authProviderState.authproviders.find(
        p => p.id === defaultAuthProviderId
    );
    const isServiceAccountProvider = selectedProvider?.provider === AuthProviderTypeGoIAMClient;

    const client = useMemo(() => {
        const clientData: any = {
            id: "",
            name: name,
            description: description,
            secret: "",
            tags: tags.split(",").map(tag => tag.trim()),
            redirect_urls: redirectUrls.split(",").map(url => url.trim()),
            project_id: projectState.project?.id || "",
            default_auth_provider_id: defaultAuthProviderId,
            enabled: true,
            go_iam_client: goIamClient,
            created_at: new Date().toISOString(),
            created_by: "system",
            updated_at: new Date().toISOString(),
            updated_by: "system",
        };
        
        // Add linked_user_email for service account clients
        if (isServiceAccountProvider && linkedUserEmail) {
            clientData.linked_user_email = linkedUserEmail;
        }
        
        return clientData;
    }, [name, description, tags, redirectUrls, defaultAuthProviderId, projectState.project?.id, goIamClient, isServiceAccountProvider, linkedUserEmail]);

    useEffect(() => {
        if (state.createdClient) {
            setDialogOpen(false);
            state.resetCreatedClient();
            state.fetchClients();
            if (client.go_iam_client && !authState.clientAvailable) {
                authState.logout();
                authState.fetchMe(true);
            }
        }
    }, [state.createdClient, client.go_iam_client, authState.clientAvailable, authState.fetchMe]);

    const handleSubmit = useCallback(() => {
        state.createClient(client)
    }, [state.createClient, client]);

    const handleGoIamClientChange = useCallback((value: boolean | 'indeterminate') => {
        const isGoIamClient = value === true || value === 'indeterminate'
        setGoIamClient(isGoIamClient);
        if (!authState.clientAvailable && isGoIamClient) {
            if (redirectUrls.trim() === "") {
                setRedirectUrls(`${window.location.origin}/verify`);
            } else if (!redirectUrls.includes(`${window.location.origin}/verify`)) {
                setRedirectUrls(`${redirectUrls}, ${window.location.origin}/verify`);
            }
        }
    }, [authState.clientAvailable, redirectUrls]);

    useEffect(() => {
        if (!isServiceAccountProvider) {
            setLinkedUserEmail("");
        }
    }, [isServiceAccountProvider]);

    const disabled = state.creatingClient || !name || !description || !redirectUrls || !defaultAuthProviderId || 
                    (isServiceAccountProvider && !linkedUserEmail);
                    
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CirclePlus className="mr-2 h-4 w-4" />Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                    <DialogDescription>
                        Add a client in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My cool project client" value={name} onChange={(e) => setName(e.target.value)} />
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
                        <Label>Auth Provider</Label>
                        <Select value={defaultAuthProviderId} onValueChange={(value) => setDefaultAuthProviderId(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Auth Providers</SelectLabel>
                                    {authProviderState.authproviders.map((provider) => (
                                        <SelectItem key={provider.id} value={provider.id}>
                                            {provider.name} {provider.provider === AuthProviderTypeGoIAMClient && "(Service Account)"}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {isServiceAccountProvider && (
                        <>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Service account clients require a linked user. The client will inherit the permissions of this user.
                                </AlertDescription>
                            </Alert>
                            <div className="grid gap-3">
                                <Label htmlFor="linked-user-email">Linked User Email *</Label>
                                <Input 
                                    id="linked-user-email" 
                                    name="linked-user-email" 
                                    type="email"
                                    placeholder="user@example.com" 
                                    value={linkedUserEmail} 
                                    onChange={(e) => setLinkedUserEmail(e.target.value)} 
                                />
                                <p className="text-sm text-muted-foreground">
                                    Enter the email of an existing user in your project
                                </p>
                            </div>
                        </>
                    )}
                    
                    {!authState.clientAvailable && !isServiceAccountProvider && (
                        <div className="flex items-center gap-3">
                            <Checkbox id="terms" checked={goIamClient} disabled={authState.clientAvailable} onCheckedChange={handleGoIamClientChange} />
                            <Label htmlFor="terms">Set as Go IAM Client</Label>
                        </div>
                    )}
                    
                    <div className="grid gap-3">
                        <Label htmlFor="redirect-urls-1">Redirect URLs</Label>
                        <Textarea id="redirect-urls-1" name="redirect-urls" placeholder="Comma separated redirect urls" value={redirectUrls} onChange={(e) => setRedirectUrls(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={disabled}>
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