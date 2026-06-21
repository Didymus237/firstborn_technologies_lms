"use client";



import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router";

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {


  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex gap-3 hover:bg-gray-100 rounded-lg transition-colors" title="View Profile">
        <Link to="/profile" className="flex items-center gap-3 w-full p-1 cursor-pointer">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
