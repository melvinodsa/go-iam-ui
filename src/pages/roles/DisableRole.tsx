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
import { useRoleState, type Role } from "@/hooks/roles";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface DisableRoleProps {
    data: Role
}

const DisableRole = (props: DisableRoleProps) => {
    const state = useRoleState();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDisable = useCallback(() => {
        state.updateRole(Object.assign({}, props.data, {
            enabled: false,
            updated_at: new Date().toISOString(),
            updated_by: "system", // This should be replaced with the actual user ID
        }))
    }, [props.data.id]);

    useEffect(() => {
        if (state.updatedRole) {
            setDialogOpen(false);
            state.resetUpdatedRole(); // Reset the updated role state
            state.fetchRoles("", 1, 10);
        }
    }, [state.updatedRole]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)}>
                            <CircleX className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Disable Role</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Disable Role</DialogTitle>
                    <DialogDescription>
                        Disable the role in the system
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleDisable} disabled={state.updatingRole}>
                        {state.updatingRole ? (
                            <><Loader2Icon className="animate-spin" /> Disabling...</>
                        ) : (
                            "Disable Role"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DisableRole;