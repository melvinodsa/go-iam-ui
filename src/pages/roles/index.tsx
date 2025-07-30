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
import AddRole from "./AddRole"
import UpdateRole from "./UpdateRole"
import Pagination from "./Pagination"
import DisableRole from "./DisableRole"
import { useRoleState } from "@/hooks/roles"

const RolesListPage = () => {
    const navState = useNavState()
    const state = useRoleState();
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        state.fetchRoles("", 1, pageSize)
    }, [])

    useEffect(() => {
        navState.setPage({ location: '/roles', name: 'Roles', section: 'User Management' })
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
        state.fetchRoles(debouncedSearch, 1, pageSize)
    }, [debouncedSearch, pageSize])

    const onPageChange = useCallback((page: number) => {
        if (page < 1 || page > state.pages.length) return
        state.fetchRoles(debouncedSearch, page, pageSize)
    }, [state.pages.length])

    const onFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value
        setSearch(searchValue)
    }, [setSearch])

    const pageSizeChange = useCallback((value: string) => {
        const newPageSize = parseInt(value, 10)
        if (isNaN(newPageSize) || newPageSize <= 0) return
        setPageSize(newPageSize)
        state.fetchRoles(debouncedSearch, 1, newPageSize)
    }, [state])

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter roles..."
                    onChange={onFilterChange}
                    className="max-w-sm"
                />

                <AddRole />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium"><Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="capitalize">{role.name}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{role.description}</p>
                                    </TooltipContent>
                                </Tooltip></TableCell>
                                <TableCell>{format(new Date(role.updated_at || role.created_at))}</TableCell>
                                <TableCell>
                                    <UpdateRole data={role} />
                                    <DisableRole data={role} />
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


export default RolesListPage;