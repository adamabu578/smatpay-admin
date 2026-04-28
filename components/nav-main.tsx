"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url + "/"))
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title} 
                isActive={isActive}
                className={isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                asChild
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
