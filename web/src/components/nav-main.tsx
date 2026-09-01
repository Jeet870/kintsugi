import { Link } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronRight } from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  items?: {
    title: string
    url: string
  }[]
}

export interface NavGroup {
  label: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  items: NavItem[]
}

export function NavMain({
  groups,
  currentPath = "/app/mood",
}: {
  currentPath?: string
  groups: NavGroup[]
}) {
  const normalizedPath = currentPath === "/app" ? "/app/mood" : currentPath
  const { state, setOpen } = useSidebar()

  const handleItemClick = () => {
    if (state === "collapsed") {
      setOpen(true)
    }
  }

  return (
    <div className="space-y-3 w-full">
      {groups.map((group) => {
        const isGroupActive = group.items.some(
          (item) =>
            normalizedPath === item.url ||
            (item.url !== "/app" && normalizedPath.startsWith(item.url))
        )

        return (
          <Collapsible
            key={group.label}
            defaultOpen={isGroupActive || group.defaultOpen !== false}
            className="group/group-collapsible w-full"
          >
            <SidebarGroup className="group-data-[collapsible=icon]:p-0 py-0">
              <CollapsibleTrigger asChild>
                <div
                  className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors group-data-[collapsible=icon]:hidden select-none mb-1 gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {group.icon && (
                      <div className="flex items-center justify-center shrink-0">
                        {group.icon}
                      </div>
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                      {group.label}
                    </span>
                  </div>
                  <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/group-collapsible:rotate-90 shrink-0 text-muted-foreground" />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="border-l border-sidebar-border/60 pl-2.5 ml-3 my-1 space-y-0.5 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:ml-0">
                <SidebarMenu className="space-y-0.5 w-full">
                  {group.items.map((item) => {
                    const isActive =
                      normalizedPath === item.url ||
                      (item.url !== "/app" && normalizedPath.startsWith(item.url))
                    const hasSubItems = Boolean(item.items && item.items.length > 1)

                    if (hasSubItems) {
                      return (
                        <Collapsible
                          key={item.title}
                          asChild
                          defaultOpen={isActive}
                          className="group/collapsible w-full"
                        >
                          <SidebarMenuItem className="w-full">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                tooltip={item.title}
                                onClick={handleItemClick}
                                className={`rounded-xl text-xs transition-all border-none h-8 px-2.5 w-full group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mx-auto ${
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                    : "bg-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }`}
                              >
                                <span
                                  className={`truncate ${
                                    isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground"
                                  } group-data-[collapsible=icon]:hidden`}
                                >
                                  {item.title}
                                </span>
                                <ChevronRight className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                              <SidebarMenuSub className="border-l border-sidebar-border/60 pl-3 my-1 space-y-0.5">
                                {item.items?.map((subItem) => {
                                  const isSubActive = normalizedPath === subItem.url
                                  return (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      <SidebarMenuSubButton
                                        asChild
                                        className={`rounded-lg text-xs transition-all border-none ${
                                          isSubActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                            : "bg-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        }`}
                                      >
                                        <Link to={subItem.url}>
                                          <span className="truncate">{subItem.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  )
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      )
                    }

                    return (
                      <SidebarMenuItem key={item.title} className="w-full">
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          onClick={handleItemClick}
                          className={`rounded-xl text-xs transition-all border-none h-8 px-2.5 w-full group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mx-auto ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              : "bg-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <Link to={item.url} className="flex items-center w-full">
                            <span
                              className={`truncate ${
                                isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground"
                              } group-data-[collapsible=icon]:hidden`}
                            >
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )
      })}
    </div>
  )
}

export default NavMain
