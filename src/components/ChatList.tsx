import React from "react"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { MessageCircle } from "lucide-react"

export function ChatList({ chats, activeChatId, setActiveChatId }: {
  chats: Array<{ id: number, name: string }>,
  activeChatId: number,
  setActiveChatId: (id: number) => void
}) {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  asChild
                  className={
                    activeChatId === chat.id
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  <button
                    onClick={() => setActiveChatId(chat.id)}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="truncate">{chat.name}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
