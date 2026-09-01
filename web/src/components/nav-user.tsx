import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronsUpDown, Sparkles, User, Settings, LogOut, Flame } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useProfile } from "@/features/profile/hooks/useProfile"

export function NavUser() {
  const { isMobile, state, setOpen } = useSidebar()
  const navigate = useNavigate()
  const { user: authUser, clearAuth } = useAuthStore()
  const { data: profileData } = useProfile()

  const currentUser = profileData?.user ?? authUser
  const currentStreak = profileData?.streak?.current_streak ?? 1

  const name = currentUser?.name || currentUser?.email?.split('@')[0] || "Kintsugi Member"
  const email = currentUser?.email || "user@kintsugi.app"
  const avatarUrl = currentUser?.avatar_url || (currentUser as any)?.avatarUrl || ""

  const getInitials = (n?: string, e?: string) => {
    if (n) {
      const parts = n.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return n.substring(0, 2).toUpperCase()
    }
    if (e) return e.substring(0, 2).toUpperCase()
    return "KU"
  }

  const initials = getInitials(name, email)

  const handleUserClick = () => {
    if (state === "collapsed") {
      setOpen(true)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              onClick={handleUserClick}
              className="bg-transparent hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent rounded-xl group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:mx-auto"
            >
              <Avatar className="size-8 rounded-xl border border-[#7C3AED]/40 bg-[#7C3AED]/20 text-[#A855F7] font-bold text-xs shrink-0">
                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                <AvatarFallback className="bg-[#7C3AED]/20 text-[#A855F7] font-bold text-xs rounded-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-sidebar-foreground">{name}</span>
                <span className="truncate text-[10px] text-[#F59E0B] font-medium flex items-center gap-1 font-mono">
                  <Flame className="size-3 text-[#F59E0B]" /> {currentStreak} Day Streak
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-card border-border text-card-foreground shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex items-center gap-2 text-left text-xs">
                <Avatar className="size-8 rounded-xl border border-[#7C3AED]/40 bg-[#7C3AED]/20 text-[#A855F7] font-bold text-xs shrink-0">
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="bg-[#7C3AED]/20 text-[#A855F7] font-bold text-xs rounded-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-semibold text-card-foreground">{name}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate('/app/motivation')}
                className="gap-2 text-xs focus:bg-muted focus:text-foreground cursor-pointer"
              >
                <Sparkles className="size-4 text-[#A855F7]" />
                <span>Wellness Summary</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate('/app/profile')}
                className="gap-2 text-xs focus:bg-muted focus:text-foreground cursor-pointer"
              >
                <User className="size-4 text-muted-foreground" />
                <span>Profile & Badges</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/app/settings')}
                className="gap-2 text-xs focus:bg-muted focus:text-foreground cursor-pointer"
              >
                <Settings className="size-4 text-muted-foreground" />
                <span>Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-xs text-[#EF4444] focus:bg-[#EF4444]/15 focus:text-[#EF4444] cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavUser
