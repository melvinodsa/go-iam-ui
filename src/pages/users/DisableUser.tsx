import { useCallback, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CircleX } from "lucide-react";
import { Loader2Icon } from "lucide-react";
import { useUserState, type User } from "@/hooks/users";

interface DisableUserProps {
    data: User
}

const DisableUser = (props: DisableUserProps) => {
    const state = useUserState();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDisable = useCallback(() => {
        state.updateUser(Object.assign({}, props.data, {
            enabled: false,
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        }))
    }, [props.data.id]);

    useEffect(() => {
        if (state.updatedUser) {
            setDialogOpen(false);
            state.resetUpdatedUser(); // Reset the updated user state
            state.fetchUsers("", 1, 10);
        }
    }, [state.updatedUser]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <CircleX className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Disable User</DialogTitle>
                    <DialogDescription>
                        Disable the user in the system
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleDisable} disabled={state.updatingUser}>
                        {state.updatingUser ? (
                            <><Loader2Icon className="animate-spin" /> Disabling...</>
                        ) : (
                            "Disable User"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DisableUser;