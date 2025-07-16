import { useNavState } from "@/hooks/nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { AlertCircleIcon } from "lucide-react"
import {
    Alert,
    AlertTitle,
} from "@/components/ui/alert"
import { useAuthState } from "@/hooks/auth";

const AppNavbar = () => {
    const state = useNavState();
    const authState = useAuthState();
    const handleLinkClick = useCallback((index: number) => () => {
        const pages = JSON.parse(JSON.stringify(state.pages.slice(0, index + 1)))
        state.setPages(pages)
    }, [])
    return (
        <div className="flex items-center justify-between w-full">
            <Breadcrumb>
                <BreadcrumbList>
                    {state.pages.map((page, index) => (
                        <div key={page.location} className="flex items-center">
                            {page.section && (<>
                                <BreadcrumbItem>
                                    <Link to={'#'}>{page.section}</Link>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </>)}
                            <BreadcrumbItem>
                                <Link to={page.location} className={index === state.pages.length - 1 ? "text-black font-bold" : ""} onClick={handleLinkClick(index)}>{page.name}</Link>
                            </BreadcrumbItem>

                            {index !== state.pages.length - 1 && <BreadcrumbSeparator />}
                        </div>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            {!authState.clientAvailable && !authState.loadingAuth && (
                <Alert variant="destructive" className="w-80">
                    <AlertCircleIcon />
                    <AlertTitle>Client not setup for Go IAM</AlertTitle>
                    {/* <AlertDescription>
                        <p>Please verify your billing information and try again.</p>
                        <ul className="list-inside list-disc text-sm">
                            <li>Check your card details</li>
                            <li>Ensure sufficient funds</li>
                            <li>Verify billing address</li>
                        </ul>
                    </AlertDescription> */}
                </Alert>)}
        </div>
    )
}

export default AppNavbar;