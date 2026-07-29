import { useAuth } from "@/routes/ProtectedRouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";

export default function Header() {
  const { auth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto flex h-16 items-center justify-between px-6 md:px-10 bg-[#0F1420]/80 text-slate-100 backdrop-blur-xl transition-colors duration-300">
      {/* Brand logo container */}
      <div className="text-xl font-heading font-bold tracking-widest uppercase">
        <a href="/admin/dashboard" className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 hover:brightness-110 transition-all drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#D4AF37]" />
          <span>Vanguard Admin</span>
        </a>
      </div>

      {/* User profile and controls container */}
      <div className="flex items-center gap-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900/60 border border-amber-500/10 hover:border-amber-500/30 text-amber-300/80 hover:text-amber-300 transition-all duration-200 cursor-pointer shadow-inner"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User profile details */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="ring-2 ring-amber-500/30 rounded-full p-0.5 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
            <UserAvatar
              src={auth?.avatar}
              name={auth?.full_name || auth?.username || "Admin"}
              size="sm"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-medium text-sm text-slate-200 max-w-[150px] truncate">{auth?.username || "Admin"}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold">Executive Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}