import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import { ChevronDown, User, Package, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { accountService } from "@/services/account.service";

import UserAvatar from "./UserAvatar";

interface ProfileMenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  danger?: boolean;
}

interface ProfileDropdownProps {
  menuItems?: ProfileMenuItem[];
}

export default function ProfileDropdown({ menuItems }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
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

  const defaultMenuItems: ProfileMenuItem[] = [
    {
      label: "Profile",
      icon: <User size={16} />,
      action: () => {
        navigate(`/profile/${auth?.username}_${auth?.user_id}`);
        setIsOpen(false);
      }
    },
    {
      label: "Products",
      icon: <Package size={16} />,
      action: () => {
        navigate("/my-products");
        setIsOpen(false);
      }
    },
    {
      label: "Change Password",
      icon: <Lock size={16} />,
      action: () => {
        navigate("/profile/change-password");
        setIsOpen(false);
      }
    },
    {
      label: "Log Out",
      icon: <LogOut size={16} />,
      action: () => {
        accountService.logout().then(() => {
          setAuth(null);
          navigate("/");
        })
        .catch(() => {
          toast.error("Unable to connect to the server for logout!");
        });
      },
      danger: true
    }
  ];

  const itemsToRender = menuItems || defaultMenuItems;

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center cursor-pointer p-0.5 sm:px-3 sm:py-1.5 sm:space-x-3 rounded-full border border-transparent sm:border-border hover:shadow-sm transition-all duration-200 bg-transparent sm:bg-background/50 hover:bg-muted"
      >
        <UserAvatar
          src={auth?.avatar}
          name={auth?.full_name || auth?.username || ""}
          size="sm"
          className="sm:w-10 sm:h-10 border-accent/30 shadow-gold-glow"
        />

        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-semibold text-foreground max-w-[120px] truncate">
            {auth?.full_name || auth?.username}
          </span>
          <span className="text-xs text-muted-foreground max-w-[120px] truncate">{auth?.email}</span>
        </div>

        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu Container */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-glass shadow-gold-glow border border-border py-1.5 rounded-xl z-50 p-1 flex flex-col gap-0.5">
          {itemsToRender.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center px-3 py-2 text-left cursor-pointer rounded-lg text-sm font-medium transition-all duration-200 ${
                item.danger
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-muted-foreground hover:text-accent hover:bg-muted/50'
              }`}
            >
              <span className={`mr-2.5 ${item.danger ? 'text-red-500' : 'text-muted-foreground'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}