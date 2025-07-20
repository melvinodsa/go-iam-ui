


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
import { useCallback, useEffect, useState } from "react"
import { useProjectState } from "@/hooks/projects"
import { useUserState } from "@/hooks/users"


const AddUser = () => {
    const state = useUserState();
    const projectState = useProjectState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");


    useEffect(() => {
        if (state.createdUser) {
            // Close the dialog or reset the form
            setDialogOpen(false);
            state.resetCreatedUser(); // Reset the created user state
            state.fetchUsers("", 1, 10); // Fetch users after creation
        }
    }, [state.createdUser]);


    const handleSubmit = useCallback(() => {
        const user = {
            id: "",
            name: name,
            email: email,
            phone: phone,
            roles: {},
            expiry: null,
            policies: {},
            project_id: projectState.project?.id || "",
            resources: {},
            enabled: true,
            created_at: new Date().toISOString(),
            created_by: "system", // This should be replaced with the actual user ID
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        };
        state.registerUser(user)
    }, [name, email, phone, projectState.project?.id]);

    const isValid = name.trim() !== "" && email.trim() !== "";
    const disabled = state.registeringUser || !isValid;

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CirclePlus className="mr-2 h-4 w-4" />Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Register User</DialogTitle>
                    <DialogDescription>
                        Register a user in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" placeholder="My Previleged user" value={name} onChange={(e) => setName(e.target.value)} />
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
                        {state.registeringUser ? (
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

export default AddUser;