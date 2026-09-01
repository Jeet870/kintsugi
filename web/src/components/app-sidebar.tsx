import * as React from "react"
import { useLocation } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { AppLogo } from "@/components/AppLogo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Sparkles,
  Heart,
  User,
  Shield,
  Lock,
  Wind,
  Trophy,
} from "lucide-react"

const kintsugiData = {
  workspaces: [
    {
      name: "Kintsugi Companion",
      plan: "AI Emotional Support",
      logo: <Sparkles className="w-4 h-4 text-[#A855F7]" />,
    },
    {
      name: "Crisis Guard",
      plan: "24/7 Safety Shield",
      logo: <Shield className="w-4 h-4 text-[#A855F7]" />,
    },
    {
      name: "Journal Vault",
      plan: "Fernet Encrypted",
      logo: <Lock className="w-4 h-4 text-[#A855F7]" />,
    },
  ],
  navGroups: [
    {
      label: "DAILY WELLNESS",
      icon: <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />,
      items: [
        {
          title: "Mood Tracker",
          url: "/app/mood",
        },
        {
          title: "3D Kintsugi Vessel",
          url: "/app/vessel",
        },
        {
          title: "AI Companion",
          url: "/app/chat",
        },
        {
          title: "Encrypted Journal",
          url: "/app/journal",
        },
      ],
    },
    {
      label: "INNOVATIVE AI & SOUND",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />,
      items: [
        {
          title: "Solfeggio Soundscape",
          url: "/app/soundscape",
        },
        {
          title: "AI Biometric Scanner",
          url: "/app/biometric-scan",
        },
        {
          title: "5-4-3-2-1 Somatic Reset",
          url: "/app/somatic-reset",
        },
      ],
    },
    {
      label: "MINDFULNESS & EXERCISES",
      icon: <Wind className="w-3.5 h-3.5 text-[#2DD4BF]" />,
      items: [
        {
          title: "Guided Breathing",
          url: "/app/breathing",
        },
        {
          title: "Calm Mind Game",
          url: "/app/mind-game",
        },
        {
          title: "Daily Motivation",
          url: "/app/motivation",
        },
      ],
    },
    {
      label: "PROGRESS & SAFETY",
      icon: <Trophy className="w-3.5 h-3.5 text-[#A855F7]" />,
      items: [
        {
          title: "Achievements",
          url: "/app/achievements",
        },
        {
          title: "Notifications",
          url: "/app/notifications",
        },
        {
          title: "Crisis Helplines",
          url: "/app/emergency",
        },
      ],
    },
    {
      label: "ACCOUNT & ABOUT",
      icon: <User className="w-3.5 h-3.5 text-[#A855F7]" />,
      items: [
        {
          title: "Profile & Settings",
          url: "/app/profile",
          items: [
            { title: "Profile Overview", url: "/app/profile" },
            { title: "Account Settings", url: "/app/settings" },
          ],
        },
        {
          title: "About Kintsugi",
          url: "/about",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar transition-colors duration-250" {...props}>
      <SidebarHeader className="h-14 shrink-0 border-b border-sidebar-border px-3 bg-sidebar flex items-center justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 w-full px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <AppLogo size={32} animated={true} />
          <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground font-serif">Kintsugi Companion</span>
            <span className="text-[10px] text-muted-foreground font-mono">AI Emotional Support</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4 bg-sidebar group-data-[collapsible=icon]:px-0">
        <NavMain groups={kintsugiData.navGroups} currentPath={location.pathname} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3 flex items-center justify-center">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
