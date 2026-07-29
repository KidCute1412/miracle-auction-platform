import { useAuth } from "@/routes/ProtectedRouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ShieldCheck } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";

export default function Header() {
  const { auth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex h-16 items-center justify-between px-6 bg-card text-foreground transition-colors duration-300">
      {/* Brand logo container */}
      <div className="flex items-center gap-2.5 font-heading font-bold text-lg tracking-wide select-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent border border-accent/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <a href="/admin/dashboard" className="text-foreground hover:text-accent transition-colors">
          Vanguard <span className="text-accent font-semibold">Admin</span>
        </a>
      </div>

      {/* User profile and controls container */}
      <div className="flex items-center gap-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 cursor-pointer border border-border/50"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User profile details */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="rounded-full ring-2 ring-accent/30 p-0.5">
            <UserAvatar
              src={auth?.avatar}
              name={auth?.full_name || auth?.username || "Admin"}
              size="sm"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-medium text-sm text-foreground max-w-[150px] truncate">{auth?.username || "Admin"}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}