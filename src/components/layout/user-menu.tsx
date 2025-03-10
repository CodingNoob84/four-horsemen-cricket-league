"use client";

import { useUser } from "@/hooks/convex-hooks";
import { getInitials } from "@/lib/utils";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  BookOpenText,
  History,
  Home,
  Loader,
  LogOut,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export const UserMenuCard = () => {
  const { signOut } = useAuthActions();
  const { user, loading } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false); // State to control sheet visibility

  if (loading) {
    return (
      <div>
        <Loader className="animate-spin" />
      </div>
    );
  }

  // Function to handle redirection & close menu
  const handleRedirect = (path: string) => {
    router.push(path);
    setOpen(false); // Close menu after navigation
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative w-10 h-10 rounded-full">
          <Avatar className="w-10 h-10 border-2 border-blue-100">
            <AvatarImage src={user?.image} alt={user?.name} />
            <AvatarFallback>{getInitials(user?.name || "User")}</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        {/* User Profile Section */}
        <SheetHeader>
          <div className="flex items-center space-x-3 pb-4 border-b">
            <Avatar className="w-14 h-14 border-2 border-primary">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>
                {getInitials(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-lg font-medium">
                {user?.name}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Navigation Links */}
        <div className="mt-6 space-y-2">
          <Button
            variant="ghost"
            className="w-full flex justify-start"
            onClick={() => handleRedirect("/what-is-4horsemen")}
          >
            <BookOpenText className="w-5 h-5 mr-2" />
            4Horsemen Cricket League
          </Button>
          <Button
            variant="ghost"
            className="w-full flex justify-start"
            onClick={() => handleRedirect("/")}
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Button>
          <Button
            variant="ghost"
            className="w-full flex justify-start"
            onClick={() => handleRedirect("/points-history")}
          >
            <History className="w-5 h-5 mr-2" />
            Points History
          </Button>
          <Button
            variant="ghost"
            className="w-full flex justify-start"
            onClick={() => handleRedirect("/auto-setup")}
          >
            <Settings className="w-5 h-5 mr-2" />
            Auto Setup
          </Button>
          <Button
            variant="ghost"
            className="w-full flex justify-start"
            onClick={() => handleRedirect("/groups")}
          >
            <Users className="w-5 h-5 mr-2" />
            Groups
          </Button>
          <Button
            variant="ghost"
            className="w-full flex justify-start"
            onClick={() => handleRedirect("/admin")}
          >
            <UserCog className="w-5 h-5 mr-2" />
            Admin Panel
          </Button>
        </div>

        {/* Logout Button */}
        <div className="mt-6 border-t pt-4">
          <Button
            variant="destructive"
            className="w-full flex justify-start"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
