"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "wouter";

export function NavPages({
  pages,
}: {
  pages: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup className="">
      <SidebarGroupLabel>Pages</SidebarGroupLabel>
      <SidebarMenu>
        {pages.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton tooltip={item.name} asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
