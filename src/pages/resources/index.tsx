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
import { useResourceState } from "@/hooks/resources"
import { format } from "@formkit/tempo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavState } from "@/hooks/nav"
import AddResource from "./AddResource"
import UpdateResource from "./UpdateResource"
import DisableResource from "./DisableResource"
import Pagination from "./Pagination"

const ResourcesListPage = () => {
    const navState = useNavState()
    const state = useResourceState();
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        state.fetchResources("", 1, pageSize)
    }, [])

    useEffect(() => {
        navState.setPage({ location: '/resources', name: 'Resources', section: 'User Management' })
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
        state.fetchResources(debouncedSearch, 1, pageSize)
    }, [debouncedSearch, pageSize])

    const onPageChange = useCallback((page: number) => {
        if (page < 1 || page > state.pages.length) return
        state.fetchResources(debouncedSearch, page, pageSize)
    }, [])

    const onFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value
        setSearch(searchValue)
    }, [setSearch])

    const pageSizeChange = useCallback((value: string) => {
        const newPageSize = parseInt(value, 10)
        if (isNaN(newPageSize) || newPageSize <= 0) return
        setPageSize(newPageSize)
        state.fetchResources(debouncedSearch, 1, newPageSize)
    }, [state])

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter resources..."
                    onChange={onFilterChange}
                    className="max-w-sm"
                />

                <AddResource />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.resources.map((resource) => (
                            <TableRow key={resource.id}>
                                <TableCell className="font-medium"><Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="capitalize">{resource.name}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{resource.description}</p>
                                    </TooltipContent>
                                </Tooltip></TableCell>
                                <TableCell>{resource.key}</TableCell>
                                <TableCell>{format(new Date(resource.updated_at || resource.created_at))}</TableCell>
                                <TableCell>
                                    <UpdateResource data={resource} />
                                    <DisableResource data={resource} />
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


export default ResourcesListPage;