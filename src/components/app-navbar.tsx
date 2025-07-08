import { useNavState } from "@/hooks/nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useCallback } from "react";
import { Link } from "react-router-dom";

const AppNavbar = () => {
    const state = useNavState();
    const handleLinkClick = useCallback((index: number) => () => {
        const pages = JSON.parse(JSON.stringify(state.pages.slice(0, index + 1)))
        state.setPages(pages)
    }, [])
    return (
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
    )
}

export default AppNavbar;