import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { USER_KEY, TOKEN_KEY, SCHOOL_KEY } from "@/lib/key";

const Header = () => {
  const [user, setUser] = useState<{
    firstName?: string;
    email?: string;
  } | null>(null);
  const [school, setSchool] = useState<{
    name?: string;
    _id?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
     const storedSchool = localStorage.getItem(SCHOOL_KEY);
    if (storedSchool) {
      try {
        setSchool(JSON.parse(storedSchool));
      } catch {
        setSchool(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    navigate("/login");
  };

  const handleSchoolChange = () => {
    navigate("/schools-select");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  console.log("user");
  console.log(user);
  return (
    <header className="w-full bg-white border-b shadow-sm px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-skyblue">{school?.name}</h1>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <div className="w-8 h-8 bg-skyblue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {getInitials(user.firstName || user.email || "U")}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[100px]">
                {user.firstName || "Utilisateur"}
              </span>
              <Menu className="w-4 h-4 ml-1 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 shadow-lg border">
            <div className="px-3 py-2 text-sm text-gray-600 break-words border-b">
              {user.email || "no-email@example.com"}
            </div>

            <DropdownMenuItem
              onClick={handleSchoolChange}
              className="cursor-pointer text-sm flex items-center text-gray-700 hover:bg-gray-100"
            >
              <RefreshCcwIcon className="w-4 h-4 mr-2 text-blue-500" />
              Changer d'école
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-sm flex items-center text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default Header;
