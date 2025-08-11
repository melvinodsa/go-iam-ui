import { Key, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useAuthProviderState, AuthProviderTypeGoIAMClient } from "@/hooks/authproviders"

const EnableServiceAccount = () => {
    const authProviderState = useAuthProviderState();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleEnable = () => {
        authProviderState.enableServiceAccount();
    };

    useEffect(() => {
        if (authProviderState.enabledServiceAccount) {
            setDialogOpen(false);
            authProviderState.resetEnabledServiceAccount();
            // Refresh auth providers to show the new GOIAM/CLIENT provider
            authProviderState.fetchAuthProviders();
        }
    }, [authProviderState.enabledServiceAccount]);

    // Check if service account is already enabled
    if (authProviderState.hasServiceAccount) {
        return (
            <Button disabled variant="outline">
                <Key className="mr-2 h-4 w-4" />
                Service Account Enabled
            </Button>
        );
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Enable Service Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enable Service Account</DialogTitle>
                    <DialogDescription>
                        This will enable GOIAM/CLIENT authentication provider for service accounts in your project.
                        Service accounts allow programmatic access to your application without user interaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to enable service account support (GOIAM/CLIENT) for this project?
                    </p>
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)} 
                        disabled={authProviderState.enablingServiceAccount}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleEnable} 
                        disabled={authProviderState.enablingServiceAccount}
                    >
                        {authProviderState.enablingServiceAccount ? (
                            <><Loader2Icon className="animate-spin mr-2" /> Enabling...</>
                        ) : (
                            "Yes, Enable"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EnableServiceAccount;