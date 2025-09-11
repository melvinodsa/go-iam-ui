import { useResourceState, type Resource } from "@/hooks/resources";
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

interface DisableResourceProps {
    data: Resource
}

const DisableResource = (props: DisableResourceProps) => {
    const state = useResourceState();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDisable = useCallback(() => {
        state.deleteResource(props.data.id);
    }, [props.data.id]);

    useEffect(() => {
        if (state.updatedResource) {
            setDialogOpen(false);
            state.resetUpdatedResource(); // Reset the updated resource state
            state.fetchResources("", 1, 10);
        }
    }, [state.updatedResource]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <CircleX className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Disable Resource</DialogTitle>
                    <DialogDescription>
                        Disable the resource in the system
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleDisable} disabled={state.updatingResource}>
                        {state.updatingResource ? (
                            <><Loader2Icon className="animate-spin" /> Disabling...</>
                        ) : (
                            "Disable Resource"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DisableResource;