"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  User, 
  LogOut,
  Settings
} from "lucide-react";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Butterfly Admin</h1>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button variant="outline" size="icon">
            <Settings className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </Button>
          
          <Button variant="outline" size="icon">
            <User className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Profile</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
} 