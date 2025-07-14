import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { useNavState } from "@/hooks/nav"
import { useProjectState } from "@/hooks/projects"

// This is sample data.
const data = {
  navMain: [
    {
      title: "User Management",
      url: "#",
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Roles",
          url: "/roles",
        },
        {
          title: "Resources",
          url: "/resources",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Projects",
          url: "/projects",
        },
        {
          title: "Auth Providers",
          url: "/authprovider",
        },
        {
          title: "Clients",
          url: "/clients",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const state = useNavState();
  const projectsState = useProjectState();
  const [openIndicies, setOpenIndicies] = React.useState<number[]>([]);
  React.useEffect(() => {
    projectsState.fetchProjects("");
  }, []);

  React.useEffect(() => {
    const ind = data.navMain.findIndex(item => state.pages[state.pages.length - 1].section === item.title)
    if (!openIndicies.includes(ind)) {
      setOpenIndicies(openIndicies.concat(ind))
    }
  }, [state.pages])

  const projectChange = React.useCallback((value: string) => {
    projectsState.setProject(value);
  }, [projectsState]);
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Go IAM</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Select value={projectsState.project?.id || ""} onValueChange={projectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{projectsState.project?.name || "Select a project"}</SelectLabel>
              {projectsState.projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                onOpenChange={(opened) => {
                  if (!opened) {
                    setOpenIndicies(openIndicies.filter(ind => ind !== index))
                  } else {
                    setOpenIndicies(openIndicies.concat(index))
                  }
                }}
                key={item.title}
                open={openIndicies.includes(index)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.url === state.pages[state.pages.length - 1]?.location}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
