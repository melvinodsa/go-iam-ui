


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
import { useCallback, useEffect, useState } from "react"
import { useUserState, type User } from "@/hooks/users"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface UpdateUserProps {
    data: User
}

const UpdateUser = (props: UpdateUserProps) => {
    const state = useUserState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState(props.data.name || "");
    const [email, setEmail] = useState(props.data.email || "");
    const [phone, setPhone] = useState(props.data.phone || "");


    const handleSubmit = useCallback(() => {
        const user = {
            id: props.data.id,
            name: name,
            email: props.data.email || "",
            phone: props.data.phone || "",
            expiry: props.data.expiry || "",
            resources: props.data.resources || {},
            policies: props.data.policies || {},
            roles: props.data.roles || {},
            project_id: props.data.project_id || "",
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.updateUser(user)
    }, [name]);

    useEffect(() => {
        if (state.updatedUser) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetUpdatedUser(); // Reset the created resource state
            state.fetchUsers("", 1, 10); // Fetch resources after creation
        }
    }, [state.updatedUser]);

    const isValid = name.trim() !== "" && email.trim() !== "";
    const disabled = state.updatingUser || !isValid;
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit User</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                    <DialogDescription>
                        Update the existing user in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My Previleged Button" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="email-1">Email</Label>
                        <Input id="email-1" name="email" type="email" placeholder="Email of the user" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="phone-1">Phone</Label>
                        <Input id="phone-1" name="phone" type="tel" placeholder="Phone number of the user" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={disabled}>
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

export default UpdateUser;