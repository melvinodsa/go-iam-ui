import { Check, CirclePlus, Copy, Loader2Icon } from "lucide-react"
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
import { useClientState, type Client } from "@/hooks/clients"
import { useAuthProviderState } from "@/hooks/authproviders"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthState } from "@/hooks/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { AuthProviderTypeGoIAMClient } from "@/hooks/authproviders"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


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
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [hasServiceAccount, setHasServiceAccount] = useState(false);
    const [goIamClient, setGoIamClient] = useState(false);
    const [linkedUserEmail, setLinkedUserEmail] = useState("");

    const client = useMemo<Client>(() => {
        const clientData: any = {
            id: "",
            name: name,
            description: description,
            secret: "",
            tags: tags.split(",").map(tag => tag.trim()),
            redirect_urls: redirectUrls.split(",").map(url => url.trim()),
            project_id: projectState.project?.id || "",
            default_auth_provider_id: defaultAuthProviderId,
            service_account_email: linkedUserEmail,
            enabled: true,
            go_iam_client: goIamClient,
            created_at: new Date().toISOString(),
            created_by: "system",
            updated_at: new Date().toISOString(),
            updated_by: "system",
        };

        // Add service_account_email for service account clients
        if (hasServiceAccount && linkedUserEmail) {
            clientData.service_account_email = linkedUserEmail;
        }

        return clientData;
    }, [name, description, tags, redirectUrls, defaultAuthProviderId, projectState.project?.id, goIamClient, linkedUserEmail, hasServiceAccount]);


    useEffect(() => {
        if (!hasServiceAccount) {
            setLinkedUserEmail("");
        }
    }, [hasServiceAccount]);

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

    const handleServiceAccountChange = useCallback((value: boolean | 'indeterminate') => {
        const isServiceAccount = value === true || value === 'indeterminate'
        setHasServiceAccount(isServiceAccount);
        if (!isServiceAccount) {
            setLinkedUserEmail("");
        }
    }, []);

    const handleDialogClose = useCallback((open: boolean) => {
        if (state.createdClient) {
            setDialogOpen(open);
            state.resetCreatedClient();
            state.fetchClients();
            if (client.go_iam_client && !authState.clientAvailable) {
                authState.logout();
                authState.fetchMe(true);
            }
        } else {
            setDialogOpen(open);
        }
    }, []);

    const handleCopySecret = async () => {
        try {
            await navigator.clipboard.writeText(state.createdClientData?.secret || "")
            setCopiedSecret(true)
            setTimeout(() => setCopiedSecret(false), 1500)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(state.createdClientData?.id || "")
            setCopiedId(true)
            setTimeout(() => setCopiedId(false), 1500)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const disabled = state.creatingClient || !name || !description || (!hasServiceAccount && (!defaultAuthProviderId || !redirectUrls)) ||
        (hasServiceAccount && !linkedUserEmail);

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => setDialogOpen(true)}>
                            <CirclePlus className="mr-2 h-4 w-4" />Add
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Client</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{state.createdClientData ? 'Client Created' : 'Add Client'}</DialogTitle>
                    <DialogDescription>
                        {state.createdClientData ? 'Copy the credentials' : 'Add a client in the system'}
                    </DialogDescription>
                </DialogHeader>
                {
                    !state.createdClientData && (

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
                            <Separator />
                            <div className="grid gap-3">
                                <Label>Auth Provider</Label>
                                <Select value={defaultAuthProviderId} onValueChange={(value) => setDefaultAuthProviderId(value)} disabled={hasServiceAccount}>
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
                            <div className="flex items-center gap-3">
                                <div>Or</div>
                                <Checkbox id="terms" checked={hasServiceAccount} disabled={defaultAuthProviderId.length !== 0} onCheckedChange={handleServiceAccountChange} />
                                <Label htmlFor="terms">Set as service account</Label>
                            </div>

                            {hasServiceAccount && (
                                <>
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>
                                            Service account clients require a linked user. The client will inherit the permissions of this user.
                                        </AlertDescription>
                                    </Alert>
                                    <div className="grid gap-3 mb-5">
                                        <Label htmlFor="linked-user-email">Linked User Email *</Label>
                                        <Input
                                            id="linked-user-email"
                                            name="linked-user-email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={linkedUserEmail}
                                            onChange={(e) => setLinkedUserEmail(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {!hasServiceAccount && <>
                                {!authState.clientAvailable && (
                                    <div className="flex items-center gap-3">
                                        <Checkbox id="terms" checked={goIamClient} disabled={authState.clientAvailable} onCheckedChange={handleGoIamClientChange} />
                                        <Label htmlFor="terms">Set as Go IAM Client</Label>
                                    </div>
                                )}

                                <div className="grid gap-3">
                                    <Label htmlFor="redirect-urls-1">Redirect URLs</Label>
                                    <Textarea id="redirect-urls-1" name="redirect-urls" placeholder="Comma separated redirect urls" value={redirectUrls} onChange={(e) => setRedirectUrls(e.target.value)} />
                                </div>
                            </>}

                        </div>
                    )
                }
                {
                    state.createdClientData && (
                        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="grid gap-3">
                                <Label htmlFor="name-1">Client Id</Label>
                                <div className="flex space-between">
                                    <Input id="name-1" name="client-id" className="mr-5" value={state.createdClientData.id} readOnly={true} />
                                    <Button variant="outline" size="sm" onClick={handleCopyId}>
                                        {copiedId ? (
                                            <Check className="h-4 w-4 mr-2 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-2" />
                                        )}
                                        {copiedId ? "Copied!" : "Copy"}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="name-1">Client Secret</Label>
                                <div className="flex space-between">
                                    <Input id="name-1" name="client-secret" className="mr-5" value={state.createdClientData.secret} readOnly={true} />
                                    <Button variant="outline" size="sm" onClick={handleCopySecret}>
                                        {copiedSecret ? (
                                            <Check className="h-4 w-4 mr-2 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-2" />
                                        )}
                                        {copiedSecret ? "Copied!" : "Copy"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                }
                <DialogFooter>
                    {
                        state.createdClientData && (
                            <DialogClose asChild><Button>Close</Button></DialogClose>
                        )}
                    {
                        !state.createdClientData && (
                            <>
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
                            </>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddClient;