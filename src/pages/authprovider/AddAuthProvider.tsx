


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
import { useCallback, useEffect, useState } from "react"
import { useAuthProviderState, type Params } from "@/hooks/authproviders"
import { useProjectState } from "@/hooks/projects"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


const AddAuthProvider = () => {
    const state = useAuthProviderState();
    const projectState = useProjectState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [provider, setProvider] = useState("GOOGLE");
    const [params, setParams] = useState<Params[]>(GoogleParamsList);


    const handleSubmit = useCallback(() => {
        const authprovider = {
            id: "",
            name: name,
            params: params,
            project_id: projectState.project?.id || "",
            provider: provider,
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.createAuthProvider(authprovider)
    }, [name, params, projectState.project?.id, provider]);
    useEffect(() => {
        if (state.createdAuthProvider) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetCreatedAuthProvider(); // Reset the created auth provider state
            state.fetchAuthProviders(); // Fetch auth providers after creation
        }
    }, [state.createdAuthProvider]);

    const paramsValid = params.reduce<boolean>((acc, param) => {
        return acc && param.value && param.value.length > 0 ? true : false
    }, true);
    const disabled = state.creatingAuthProvider || !name || !paramsValid;
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
                        <p>Add Auth Provider</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Auth Provider</DialogTitle>
                    <DialogDescription>
                        Add an auth provider in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="Dashboard google auth" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <Select value={provider} onValueChange={(value) => setProvider(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Providers</SelectLabel>
                                <SelectItem value="GOOGLE">Google</SelectItem>
                                <SelectItem value="MICROSOFT">Microsoft</SelectItem>
                                <SelectItem value="GITHUB">GitHub</SelectItem>
                                <SelectItem value="OIDC">OpenID Connect</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {
                        provider === "GOOGLE" && (
                            <GoogleParams
                                params={params}
                                onChange={(newParams) => {
                                    setParams(newParams);
                                }}
                            />
                        )
                    }

                    {
                        provider === "MICROSOFT" && (
                            <MicrosoftParams
                                params={params}
                                onChange={(newParams) => {
                                    setParams(newParams);
                                }}
                            />
                        )
                    }
                    {
                        provider === "GITHUB" && (
                            <GitHubParams
                                params={params}
                                onChange={(newParams) => {
                                    setParams(newParams);
                                }}
                            />
                        )
                    }
                    {
                        provider === "OIDC" && (
                            <OIDCParams
                                params={params}
                                onChange={(newParams) => {
                                    setParams(newParams);
                                }}
                            />
                        )
                    }
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={disabled}>
                        {state.creatingAuthProvider ? (
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

export default AddAuthProvider;

const GoogleParamsList = [
    { label: "Client ID", value: "", key: "@GOOGLE/CLIENT_ID", is_secret: false },
    { label: "Client Secret", value: "", key: "@GOOGLE/CLIENT_SECRET", is_secret: true },
    { label: "Redirect URL", value: "", key: "@GOOGLE/REDIRECT_URL", is_secret: false },
]


interface ParamUpdateProps {
    onChange: (params: Params[]) => void;
    params: Params[];
}

const GoogleParams = (props: ParamUpdateProps) => {
    const [params, setParams] = useState<Params[]>(GoogleParamsList);

    const handleChange = (key: string, value: string) => {
        const newParams = params.map((param) =>
            param.key === key ? { ...param, value } : param
        )
        setParams(newParams);
        props.onChange(newParams);
    };

    return (
        <div>
            {params.map((param) => (
                <div key={param.key} className="flex items-center gap-2 mb-2">
                    <Input
                        placeholder={param.label}
                        value={param.value}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}

const MicrosoftParamsList = [
    { label: "Client ID", value: "", key: "@MICROSOFT/CLIENT_ID", is_secret: false },
    { label: "Client Secret", value: "", key: "@MICROSOFT/CLIENT_SECRET", is_secret: true },
    { label: "Redirect URL", value: "", key: "@MICROSOFT/REDIRECT_URL", is_secret: false },
]


const MicrosoftParams = (props: ParamUpdateProps) => {
    const [params, setParams] = useState<Params[]>(MicrosoftParamsList);

    const handleChange = (key: string, value: string) => {
        const newParams = params.map((param) =>
            param.key === key ? { ...param, value } : param
        )
        setParams(newParams);
        props.onChange(newParams);
    };

    return (
        <div>
            {params.map((param) => (
                <div key={param.key} className="flex items-center gap-2 mb-2">
                    <Input
                        placeholder={param.label}
                        value={param.value}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}

const GitHubParamsList = [
    { label: "Client ID", value: "", key: "@GITHUB/CLIENT_ID", is_secret: false },
    { label: "Client Secret", value: "", key: "@GITHUB/CLIENT_SECRET", is_secret: true },
    { label: "Redirect URL", value: "", key: "@GITHUB/REDIRECT_URL", is_secret: false },
]


const GitHubParams = (props: ParamUpdateProps) => {
    const [params, setParams] = useState<Params[]>(GitHubParamsList);

    const handleChange = (key: string, value: string) => {
        const newParams = params.map((param) =>
            param.key === key ? { ...param, value } : param
        )
        setParams(newParams);
        props.onChange(newParams);
    };

    return (
        <div>
            {params.map((param) => (
                <div key={param.key} className="flex items-center gap-2 mb-2">
                    <Input
                        placeholder={param.label}
                        value={param.value}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}

const OIDCParamsList = [
    { label: "Client ID", value: "", key: "@OIDC/CLIENT_ID", is_secret: false },
    { label: "Client Secret", value: "", key: "@OIDC/CLIENT_SECRET", is_secret: true },
    { label: "Redirect URL", value: "", key: "@OIDC/REDIRECT_URL", is_secret: false },
    { label: "Token URL", value: "", key: "@OIDC/TOKEN_URL", is_secret: false },
    { label: "Authorization URL", value: "", key: "@OIDC/AUTHORIZATION_URL", is_secret: false },
    { label: "User Info URL", value: "", key: "@OIDC/USERINFO_URL", is_secret: false },
]


const OIDCParams = (props: ParamUpdateProps) => {
    const [params, setParams] = useState<Params[]>(OIDCParamsList);

    const handleChange = (key: string, value: string) => {
        const newParams = params.map((param) =>
            param.key === key ? { ...param, value } : param
        )
        setParams(newParams);
        props.onChange(newParams);
    };

    return (
        <div>
            {params.map((param) => (
                <div key={param.key} className="flex items-center gap-2 mb-2">
                    <Input
                        placeholder={param.label}
                        value={param.value}
                        onChange={(e) => handleChange(param.key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}