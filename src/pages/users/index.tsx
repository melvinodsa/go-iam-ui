"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
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
import Pagination from "./Pagination"
import { useUserState } from "@/hooks/users"
import AddUser from "./AddUser"
import DisableUser from "./DisableUser"
import UpdateUser from "./UpdateUser"
import UpdateRole from "./UpdateRole"

const UsersListPage = () => {
    const navState = useNavState()
    const state = useUserState();
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        state.fetchUsers("", 1, pageSize)
    }, [])

    useEffect(() => {
        navState.setPage({ location: '/users', name: 'Users', section: 'User Management' })
    }, [])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }, [search])

    useEffect(() => {
        state.fetchUsers(debouncedSearch, 1, pageSize)
    }, [debouncedSearch, pageSize])

    const onPageChange = useCallback((page: number) => {
        if (page < 1 || page > state.pages.length) return
        state.fetchUsers(debouncedSearch, page, pageSize)
    }, [state.pages.length])

    const onFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value
        setSearch(searchValue)
    }, [setSearch])

    const pageSizeChange = useCallback((value: string) => {
        const newPageSize = parseInt(value, 10)
        if (isNaN(newPageSize) || newPageSize <= 0) return
        setPageSize(newPageSize)
        state.fetchUsers(debouncedSearch, 1, newPageSize)
    }, [state])

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter users..."
                    onChange={onFilterChange}
                    className="max-w-sm"
                />

                <AddUser />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium"><Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>{user.name}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{Object.keys(user.roles).length} roles</p>
                                    </TooltipContent>
                                </Tooltip></TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{format(new Date(user.updated_at || user.created_at))}</TableCell>
                                <TableCell>
                                    <UpdateUser data={user} />
                                    <UpdateRole data={user} />
                                    <DisableUser data={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Pagination
                pageSize={pageSize}
                onPageChange={onPageChange}
                pageSizeChange={pageSizeChange}
            />
        </div>
    )
}


export default UsersListPage;