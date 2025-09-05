


import { Check, Copy, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"

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
import { useEffect, useState } from "react"
import { useClientState, type Client } from "@/hooks/clients"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface RegenerateSecretProps {
    data: Client
}

const RegenerateSecret = (props: RegenerateSecretProps) => {
    const state = useClientState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        if (dialogOpen) {
            // Close the dialog or reset the form
            state.regenerateClientSecret(props.data.id);
        }
    }, [dialogOpen]);

    const handleCopySecret = async () => {
        try {
            await navigator.clipboard.writeText(state.updatedClientData?.secret || "")
            setCopiedSecret(true)
            setTimeout(() => setCopiedSecret(false), 1500)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(state.updatedClientData?.id || "")
            setCopiedId(true)
            setTimeout(() => setCopiedId(false), 1500)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    Regenerate Client Secret
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Regenerate Client Secret</DialogTitle>
                    <DialogDescription>
                        Update the existing client in the system
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    {state.regeneratingSecret && (
                        <Loader className="animate-spin mx-auto" />
                    )}
                    {
                        !state.regeneratingSecret && (
                            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                <div className="grid gap-3">
                                    <Label htmlFor="name-1">Client Id</Label>
                                    <div className="flex space-between">
                                        <Input id="name-1" name="client-id" className="mr-5" value={state.updatedClientData?.id || ''} readOnly={true} />
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
                                        <Input id="name-1" name="client-secret" className="mr-5" value={state.updatedClientData?.secret || ''} readOnly={true} />
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
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RegenerateSecret;