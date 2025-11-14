import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SingleSearchSelector from "@/components/ui/single-search-selector";
import { useUserState } from "@/hooks/users";
import { Loader2Icon, BookCopy } from "lucide-react";
import { useCallback, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


const CopyResources = (props: { userId: string }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState<{ label: string, value: string } | null>(null);
    const state = useUserState();

    const handleSubmit = useCallback(() => {
        if (newUser) {
            state.copyResources(props.userId, newUser.value);
            setDialogOpen(false);
        }
    }, [newUser, state.copyResources]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setDialogOpen(true)}>
                            <BookCopy className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy Resources</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Copy Resources</DialogTitle>
                    <DialogDescription>
                        Copy Resources to another user
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <DataSelector onSelect={setNewUser} />
                    {newUser && (
                        <div className="text-sm text-muted-foreground">
                            You are about to copy resources to <strong>{newUser.label}</strong>. This action cannot be undone.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} disabled={state.updatingUser}>
                        {state.updatingUser ? (
                            <><Loader2Icon className="animate-spin" /> Saving changes...</>
                        ) : (
                            "Save changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface DataSelectorProps {
    onSelect: (selected: { label: string, value: string }) => void
}

const DataSelector = (props: DataSelectorProps) => {
    const userState = useUserState();
    let options: { label: string, value: string }[] = [];
    options = userState.users.map(user => ({
        label: user.name,
        value: user.id
    }));
    const searchOptions = useCallback((search: string) => {
        userState.fetchUsersForWidgets(search, 1, 10);
    }, [userState.fetchUsersForWidgets]);
    return (
        <div className="grid gap-4">
            <SingleSearchSelector
                onSelect={(selected: string) => {
                    const selectedOption = options.find(opt => opt.value === selected);
                    if (selectedOption) {
                        props.onSelect(selectedOption);
                    }
                }}
                options={options}
                loadOptions={searchOptions}
                title={`Choose user`}
            />
        </div>
    )
}


export default CopyResources;