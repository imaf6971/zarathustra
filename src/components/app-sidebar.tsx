"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  CalendarDays,
  Command,
  Frame,
  GalleryVerticalEnd,
  ListTodo,
  Map,
  PieChart,
  Settings2,
  SquareKanban,
  SquareTerminal,
} from "lucide-react";

import { NavPages } from "@/components/nav-pages";
import { NavUser } from "@/components/nav-user";
import { ContextSwitcher } from "@/components/context-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  contexts: [
    {
      name: "Work",
      logo: GalleryVerticalEnd,
    },
    {
      name: "Study",
      logo: AudioWaveform,
    },
    {
      name: "Personal",
      logo: Command,
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Kanban",
      url: "/kanban",
      icon: SquareKanban,
    },
    {
      name: "Todo",
      url: "/todo",
      icon: ListTodo,
    },
    {
      name: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const me = useQuery(api.auth.me);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ContextSwitcher contexts={data.contexts} />
      </SidebarHeader>
      <SidebarContent>
        <NavPages pages={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: me?.email?.at(0) ?? "M",
            email: me?.email ?? "",
            name: "Philospher",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
