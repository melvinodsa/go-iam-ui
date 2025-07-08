"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "@formkit/tempo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavState } from "@/hooks/nav"
import { Badge } from "@/components/ui/badge"
import AddProject from "./AddClient"
import UpdateProject from "./UpdateClient"
import { useClientState } from "@/hooks/clients"
import { useAuthProviderState } from "@/hooks/authproviders"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

const ClientsListPage = () => {
    const navState = useNavState()
    const state = useClientState();
    const authProvidersState = useAuthProviderState();
    const [copiedId, setCopiedId] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        authProvidersState.fetchAuthProviders()
        state.fetchClients()
    }, [])

    useEffect(() => {
        navState.setPage({ location: '/clients', name: 'Clients', section: 'Settings' })
    }, [])


    const handleCopyId = async (textToCopy: string) => {
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopiedId(true)
            setTimeout(() => setCopiedId(false), 1500)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleCopy = async (textToCopy: string) => {
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-end py-4">

                <AddProject />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Client ID</TableHead>
                            <TableHead>Client Secret</TableHead>
                            <TableHead>Auth Provider</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.clients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium"><Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="capitalize">{client.name}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{client.description}</p>
                                    </TooltipContent>
                                </Tooltip></TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => handleCopyId(client.id)}>
                                        {copiedId ? (
                                            <Check className="h-4 w-4 mr-2 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-2" />
                                        )}
                                        {copiedId ? "Copied!" : "Copy"}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => handleCopy(client.secret)}>
                                        {copied ? (
                                            <Check className="h-4 w-4 mr-2 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-2" />
                                        )}
                                        {copied ? "Copied!" : "Copy"}
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Badge>{authProvidersState.authprovidersMap[client.default_auth_provider_id]?.name || "Unknown"}</Badge>
                                </TableCell>
                                <TableCell>{format(new Date(client.updated_at || client.created_at))}</TableCell>
                                <TableCell>
                                    <UpdateProject data={JSON.parse(JSON.stringify(client))} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}


export default ClientsListPage;