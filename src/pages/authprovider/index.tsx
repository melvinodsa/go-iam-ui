"use client"

import { useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "@formkit/tempo"
import { useNavState } from "@/hooks/nav"
import AddProject from "./AddAuthProvider"
import UpdateProject from "./UpdateAuthProvider"
import EnableServiceAccount from "./EnableServiceAccount"
import { useAuthProviderState } from "@/hooks/authproviders"
import { Badge } from "@/components/ui/badge"
import {AuthProviderTypeGoIAMClient} from "@/hooks/authproviders"


const AuthProvidersListPage = () => {
    const navState = useNavState()
    const state = useAuthProviderState();

    useEffect(() => {
        state.fetchAuthProviders()
    }, [])

    useEffect(() => {
        navState.setPage({ location: '/authproviders', name: 'Auth Providers', section: 'Settings' })
    }, [])

    return (
        <div className="w-full">
            <div className="flex items-center justify-end py-4 gap-2">
                <EnableServiceAccount />
                <AddProject />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.authproviders.map((authProvider) => (
                            <TableRow key={authProvider.id}>
                                <TableCell className="font-medium"><div className="capitalize">{authProvider.name}</div></TableCell>
                                <TableCell><Badge>{authProvider.provider}</Badge></TableCell>
                                <TableCell>{format(new Date(authProvider.updated_at || authProvider.created_at))}</TableCell>
                                <TableCell>
                                    {authProvider.provider !== AuthProviderTypeGoIAMClient && (
                                        <UpdateProject data={JSON.parse(JSON.stringify(authProvider))} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}


export default AuthProvidersListPage;