


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
import { useAuthProviderState, type AuthProvider, type Params } from "@/hooks/authproviders"
import { useProjectState } from "@/hooks/projects"

interface UpdateAuthProviderProps {
    data: AuthProvider
}

const UpdateAuthProvider = (props: UpdateAuthProviderProps) => {
    const state = useAuthProviderState();
    const projectState = useProjectState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState(props.data.name || "");
    const [provider, setProvider] = useState(props.data.provider || "");
    const [params, setParams] = useState<Params[]>(props.data.params || []);


    const handleSubmit = useCallback(() => {
        const authProvider = {
            id: props.data.id,
            name: name,
            provider: provider,
            enabled: true,
            params: params,
            project_id: projectState.project?.id || "",
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.updateAuthProvider(authProvider)
    }, [name, provider]);
    useEffect(() => {
        if (state.updatedAuthProvider) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetUpdatedAuthProvider(); // Reset the created project state
            state.fetchAuthProviders(); // Fetch projects after creation
        }
    }, [state.updatedAuthProvider]);



    const paramsValid = params.reduce<boolean>((acc, param) => acc && param.value && param.value.length > 0 ? true : false, true);
    const disabled = state.updatingAuthProvider || !name || !paramsValid;
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>

                <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Auth Provider</DialogTitle>
                    <DialogDescription>
                        Update the existing auth provider in the system
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
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={disabled}>
                        {state.updatingAuthProvider ? (
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

export default UpdateAuthProvider;

interface ParamUpdateProps {
    onChange: (params: Params[]) => void;
    params: Params[];
}

const GoogleParams = (props: ParamUpdateProps) => {
    const [params, setParams] = useState<Params[]>(props.params);

    const handleChange = (key: string, value: string) => {
        const newParams = params.map((param) =>
            param.key === key ? { ...param, value } : param
        )
        setParams(newParams);
        props.onChange(newParams);
    };

    return (
        <div>
            {props.params.map((param) => (
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