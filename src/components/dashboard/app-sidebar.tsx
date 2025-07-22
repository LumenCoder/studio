
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTitle,
} from "@/components/ui/sidebar";
import { TacoIcon } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Briefcase,
  Calendar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from 'next/link';
import { useAppContext } from "@/app/dashboard/layout";
import { useAuth } from "../auth/auth-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const { navigateTo } = useAppContext();
  const { user, logout } = useAuth();

  const handleNavigation = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateTo(href);
  };
  
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout();
  }

  const baseMenuItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  ];
  
  const managerMenuItems = [
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/schedule", label: "Schedule", icon: Calendar },
  ]

  const adminMenuItems = [
    { href: "/dashboard/manager-setup", label: "Manager Set-up", icon: Briefcase },
  ]
  
  const settingsMenuItem = { href: "/dashboard/settings", label: "Settings", icon: Settings };

  let menuItems = [...baseMenuItems];

  if (user?.role === 'Manager') {
    menuItems = [...baseMenuItems, ...managerMenuItems, settingsMenuItem];
  } else if (user?.role === 'Admin Manager') {
     menuItems = [...baseMenuItems, ...managerMenuItems, ...adminMenuItems, settingsMenuItem];
  } else {
    // Team Training only sees base items
    menuItems = [...baseMenuItems];
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <TacoIcon className="w-8 h-8 text-primary" />
        <SidebarTitle>Taco Vision</SidebarTitle>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href} onClick={(e) => handleNavigation(item.href, e)}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40" alt="@admin" data-ai-hint="profile picture" />
            <AvatarFallback>{user?.name.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
            <span className="font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">ID: {user?.id}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Log Out" onClick={handleLogout}>
              <Link href="/">
                <LogOut />
                <span>Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
