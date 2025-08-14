import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, RefreshCcwIcon, Settings, User, HelpCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { USER_KEY, TOKEN_KEY } from "@/lib/key";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSchool } from "@/context/SchoolContext";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [notifications, setNotifications] = useState<number>(3); // Mock notifications count
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentSchool, schools, switchSchool } = useSchool();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSchoolChange = () => {
    navigate("/schools-select");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleHelp = () => {
    navigate("/help");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-skyblue/20 shadow-lg px-6 py-3 flex justify-between items-center transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-skyblue to-mustard bg-clip-text text-transparent">
          {currentSchool?.name || t('header.noSchoolSelected')}
        </h1>
        <LanguageSwitcher className="hidden md:flex" />
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNotifications}
            className="relative rounded-full hover:bg-skyblue/10"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gradient-to-r hover:from-skyblue/10 hover:to-mustard/10 focus:outline-none transition-all duration-300"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-skyblue to-mustard text-white">
                    {getInitials(user.firstName || user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[100px]">
                  {user.firstName || t('header.user')}
                </span>
                <Menu className="w-4 h-4 ml-1 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              align="end" 
              className="w-56 shadow-xl border border-skyblue/20 bg-white/95 backdrop-blur-md"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email || "no-email@example.com"}
                </p>
              </div>

              <DropdownMenuSeparator className="bg-skyblue/20" />

              <DropdownMenuItem
                onClick={handleProfile}
                className="cursor-pointer text-sm flex items-center text-gray-700 hover:bg-skyblue/10"
              >
                <User className="w-4 h-4 mr-2 text-skyblue" />
                {t('header.profile')}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleSettings}
                className="cursor-pointer text-sm flex items-center text-gray-700 hover:bg-skyblue/10"
              >
                <Settings className="w-4 h-4 mr-2 text-skyblue" />
                {t('header.settings')}
              </DropdownMenuItem>

              {schools.length > 1 && (
                <>
                  <DropdownMenuItem
                    onClick={handleSchoolChange}
                    className="cursor-pointer text-sm flex items-center text-gray-700 hover:bg-skyblue/10"
                  >
                    <RefreshCcwIcon className="w-4 h-4 mr-2 text-skyblue" />
                    {t('header.changeSchool')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-skyblue/20" />
                </>
              )}

              <DropdownMenuItem
                onClick={handleHelp}
                className="cursor-pointer text-sm flex items-center text-gray-700 hover:bg-skyblue/10"
              >
                <HelpCircle className="w-4 h-4 mr-2 text-skyblue" />
                {t('header.help')}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-skyblue/20" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-sm flex items-center text-mustard hover:bg-mustard/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('header.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
};

export default Header;