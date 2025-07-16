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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavState } from "@/hooks/nav"
import { useProjectState } from "@/hooks/projects"
import { Badge } from "@/components/ui/badge"
import AddProject from "./AddProject"
import UpdateProject from "./UpdateProject"

const ProjectsListPage = () => {
    const navState = useNavState()
    const state = useProjectState();

    useEffect(() => {
        state.fetchProjects("")
    }, [])

    useEffect(() => {
        navState.setPage({ location: '/projects', name: 'Projects', section: 'Settings' })
    }, [])

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
                            <TableHead>Tags</TableHead>
                            <TableHead>Updated At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium"><Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="capitalize">{project.name}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{project.description}</p>
                                    </TooltipContent>
                                </Tooltip></TableCell>
                                <TableCell>{project.tags.map(
                                    tag => <Badge key={tag} className="mr-1">{tag}</Badge>
                                )}</TableCell>
                                <TableCell>{format(new Date(project.updated_at || project.created_at))}</TableCell>
                                <TableCell>
                                    {project.name.trim() !== "Default Project" && <UpdateProject data={JSON.parse(JSON.stringify(project))} />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}


export default ProjectsListPage;