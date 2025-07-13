"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  Trophy, 
  FileText,
  Home
} from "lucide-react";

const sidebarItems = [
  {
    title: "대시보드",
    href: "/",
    icon: Home,
  },
  {
    title: "사용자 관리",
    href: "/users",
    icon: Users,
  },
  {
    title: "아이템 관리",
    href: "/items",
    icon: Package,
  },
  {
    title: "랭킹",
    href: "/ranking",
    icon: Trophy,
  },
  {
    title: "로그",
    href: "/logs",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 