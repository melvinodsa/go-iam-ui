

import { ChevronLeft, ChevronRight, } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useUserState } from "@/hooks/users";

interface PaginationProps {
    pageSize: number;
    onPageChange: (page: number) => void;
    pageSizeChange: (value: string) => void;
}


const Pagination = (props: PaginationProps) => {
    const state = useUserState();

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-muted-foreground flex-1 text-sm">
                Displaying {Math.min(state.users.length, props.pageSize)} of{" "}
                {state.total}.
            </div>
            <div className="space-x-2 flex items-center">
                <Select onValueChange={props.pageSizeChange} defaultValue={props.pageSize.toString()}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={props.pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>{props.pageSize}</SelectLabel>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => props.onPageChange(state.currentPage - 1)}
                    disabled={state.currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {state.pages.map((page) => (
                    <Button
                        key={page}
                        variant={page === state.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => props.onPageChange(page)}
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => props.onPageChange(state.currentPage + 1)}
                    disabled={state.currentPage === state.pages.length}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default Pagination;