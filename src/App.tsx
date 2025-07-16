import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AppNavbar from "./components/app-navbar"
import { Routes, Route, useLocation } from "react-router-dom"
import ResourcesListPage from "./pages/resources"
import { Toaster } from "sonner"
import RolesListPage from "./pages/roles"
import ProjectsListPage from "./pages/projects"
import AuthProvidersListPage from "./pages/authprovider"
import ClientsListPage from "./pages/client"
import UsersListPage from "./pages/users"
import LoginPage from "./pages/login"
import VerifyPage from "./pages/login/VerifyPage"

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/verify');
  return (
    <SidebarProvider>
      {!isLoginPage && <AppSidebar />}
      <SidebarInset>
        {!isLoginPage && (<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <AppNavbar />
        </header>
        )}
        <Toaster position="top-center" />
        <div className="p-5">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route
              path="/resources/"
              element={<ResourcesListPage />} />
            <Route
              path="/roles/"
              element={<RolesListPage />} />
            <Route
              path="/projects/"
              element={<ProjectsListPage />} />
            <Route
              path="/authprovider/"
              element={<AuthProvidersListPage />} />
            <Route
              path="/clients/"
              element={<ClientsListPage />} />
            <Route
              path="/users/"
              element={<UsersListPage />} />
            <Route
              path="/login/"
              element={<LoginPage />} />
            <Route
              path="/verify"
              element={<VerifyPage />} />

          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
