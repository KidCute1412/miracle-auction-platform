import { useAuth } from "@/routes/ProtectedRouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";

export default function Header() {
  const { auth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex h-16 items-center justify-between px-[60px] bg-card text-foreground transition-colors duration-300">
      {/* Brand logo container */}
      <div className="text-xl font-heading font-bold tracking-wider">
        <a href="/admin/dashboard" className="text-accent hover:opacity-90 transition-opacity">
          Bidding Admin
        </a>
      </div>

      {/* User profile and controls container */}
      <div className="flex items-center gap-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted text-foreground transition-colors duration-200 cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User profile details */}
        <div className="flex items-center gap-3">
          <UserAvatar
            src={auth?.avatar}
            name={auth?.full_name || auth?.username || "Admin"}
            size="sm"
          />

          <div className="flex flex-col leading-tight">
            <span className="font-medium text-sm max-w-[150px] truncate">{auth?.username || "Admin"}</span>
            <span className="font-normal text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}