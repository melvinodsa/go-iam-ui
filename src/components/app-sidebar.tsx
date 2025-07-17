import * as React from "react"
import { Minus, Plus } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { useNavState } from "@/hooks/nav"
import { NavUser } from "./nav-user"
import { ProjectSwitcher } from "./project-switcher"

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
  const [openIndicies, setOpenIndicies] = React.useState<number[]>([]);

  React.useEffect(() => {
    const ind = data.navMain.findIndex(item => state.pages[state.pages.length - 1].section === item.title)
    if (!openIndicies.includes(ind)) {
      setOpenIndicies(openIndicies.concat(ind))
    }
  }, [state.pages])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
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
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
