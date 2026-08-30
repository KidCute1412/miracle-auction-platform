import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ShieldCheck, User, LayoutDashboard, Store, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { accountService } from "@/services/account.service";
import { toast } from "sonner";

interface HeaderProps { sidebarOpen?: boolean; onToggleSidebar?: () => void; }

export default function Header({ sidebarOpen = true, onToggleSidebar }: HeaderProps) {
  const { auth, setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    accountService
      .logout()
      .then(() => {
        setAuth(null);
        navigate("/");
      })
      .catch(() => {
        toast.error("Unable to connect to the server for logout!");
      });
  };

  return (
    <div className="mx-auto flex h-16 items-center justify-between px-3 sm:px-6 bg-card text-foreground transition-colors duration-300">
      {/* Brand logo container */}
      <div className="flex items-center gap-2 sm:gap-2.5 font-heading font-bold text-base sm:text-lg tracking-wide select-none">
        <button onClick={onToggleSidebar} className="rounded-lg border border-border/50 bg-muted/60 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer" aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"} aria-pressed={sidebarOpen}>
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent border border-accent/20 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <Link to="/admin/dashboard" className="text-foreground hover:text-accent transition-colors truncate">
          Vanguard <span className="text-accent font-semibold">Admin</span>
        </Link>
      </div>

      {/* User profile and controls container */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200 cursor-pointer border border-border/50"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User profile dropdown container */}
        <div className="relative pl-2 sm:pl-3 border-l border-border" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer select-none text-left"
          >
            <div className="rounded-full ring-2 ring-accent/40 p-0.5 shrink-0 bg-background shadow-gold-glow">
              <UserAvatar
                src={auth?.avatar}
                name={auth?.full_name || auth?.username || "Admin"}
                size="sm"
              />
            </div>

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-medium text-sm text-foreground max-w-[140px] truncate">
                {auth?.full_name || auth?.username || "Admin"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
                Administrator
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown Container */}
          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 max-w-[calc(100vw-32px)] bg-glass shadow-gold-glow border border-border py-1.5 rounded-xl z-50 p-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border/50 sm:hidden">
                <p className="text-xs font-semibold text-foreground truncate">{auth?.full_name || auth?.username}</p>
                <p className="text-[10px] text-accent font-mono uppercase">Administrator</p>
              </div>

              <button
                onClick={() => {
                  navigate("/admin/profile");
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left cursor-pointer rounded-lg text-sm font-medium text-muted-foreground hover:text-accent hover:bg-muted/50 transition-colors"
              >
                <User size={16} className="mr-2.5 text-muted-foreground" />
                <span>Admin Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate("/admin/dashboard");
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left cursor-pointer rounded-lg text-sm font-medium text-muted-foreground hover:text-accent hover:bg-muted/50 transition-colors"
              >
                <LayoutDashboard size={16} className="mr-2.5 text-muted-foreground" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  navigate("/");
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left cursor-pointer rounded-lg text-sm font-medium text-muted-foreground hover:text-accent hover:bg-muted/50 transition-colors"
              >
                <Store size={16} className="mr-2.5 text-muted-foreground" />
                <span>Marketplace</span>
              </button>

              <div className="my-1 border-t border-border/50" />

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-left cursor-pointer rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} className="mr-2.5 text-red-500" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
