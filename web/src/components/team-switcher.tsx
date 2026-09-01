import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { AppLogo } from "@/components/AppLogo"
import { ChevronsUpDown, Plus } from "lucide-react"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const { isMobile, state, setOpen } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  const handleHeaderClick = () => {
    if (state === "collapsed") {
      setOpen(true)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              onClick={handleHeaderClick}
              className="bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent rounded-xl p-1 transition-all h-auto group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:mx-auto cursor-pointer"
            >
              <div className="shrink-0 flex items-center justify-center">
                <AppLogo size={42} animated={true} />
              </div>
              <div className="grid flex-1 text-left leading-tight ml-3 group-data-[collapsible=icon]:hidden overflow-hidden">
                <span className="truncate font-serif font-bold text-base text-[#FAFAFA] tracking-tight">
                  {activeTeam.name}
                </span>
                <span className="truncate text-[11px] text-[#A855F7] font-semibold tracking-wide">
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-[#71717A] shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 bg-[#18181B] border-[#3F3F46] text-[#FAFAFA] shadow-2xl p-1.5"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-[10px] text-[#71717A] uppercase tracking-wider px-2 py-1.5">
              Kintsugi Companion Suites
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-3 p-2.5 text-xs focus:bg-[#27272A] focus:text-[#FAFAFA] cursor-pointer rounded-lg transition-colors"
              >
                <div className="flex size-7 items-center justify-center rounded-lg border border-[#3F3F46] bg-[#27272A] shadow-sm">
                  {team.logo}
                </div>
                <div>
                  <div className="font-bold text-[#FAFAFA] text-xs font-serif">{team.name}</div>
                  <div className="text-[10px] text-[#A855F7]">{team.plan}</div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[#3F3F46] my-1" />
            <DropdownMenuItem className="gap-2.5 p-2.5 text-xs focus:bg-[#27272A] cursor-pointer rounded-lg">
              <div className="flex size-7 items-center justify-center rounded-lg border border-[#3F3F46] bg-transparent">
                <Plus className="size-3.5 text-[#A1A1AA]" />
              </div>
              <div className="font-medium text-[#A1A1AA]">Custom Companion Profile</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default TeamSwitcher
