import {
  FiHome,
  FiTag,
  FiPackage,
  FiUsers,
  FiFileText,
  FiUserCheck,
  FiLogOut,
  FiActivity,
} from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { accountService } from "@/services/account.service.ts";
import { adminRoute } from "@/lib/admin-path";

const baseLinkClass =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200";
const activeClass =
  "bg-accent/15 text-accent font-semibold border-l-2 border-accent shadow-sm";
const normalClass =
  "text-muted-foreground hover:text-foreground hover:bg-muted/60";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps = {}) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  
  // Check if current path matches parent categories route
  const isCategoryActive = pathname.startsWith(
    adminRoute("category")
  );
  
  // Check if current path matches parent users route
  const isUserActive = pathname.startsWith(
    adminRoute("user")
  );
  
  // Check if current path matches bidder applications route
  const isBidderFormActive =
    pathname.startsWith(
      adminRoute("seller/applications")
    ) ||
    pathname.startsWith(
      adminRoute("seller/application/")
    );

  return (
    <nav className="p-3 space-y-1 bg-card h-full transition-colors duration-300">
      <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
        Navigation
      </div>

      {/* Dashboard / Overview Link */}
      <NavLink
        to={adminRoute("dashboard")}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeClass : normalClass}`
        }
      >
        <FiHome className="text-lg opacity-80" />
        <span>Dashboard</span>
      </NavLink>

      {/* Category Management Link */}
      <NavLink
        to={adminRoute("category/list")}
        onClick={onNavigate}
        className={() =>
          `${baseLinkClass} ${isCategoryActive ? activeClass : normalClass}`
        }
      >
        <FiTag className="text-lg opacity-80" />
        <span>Manage Categories</span>
      </NavLink>

      {/* Product Management Link */}
      <NavLink
        to={adminRoute("product/list")}
        onClick={onNavigate}
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeClass : normalClass}`
        }
      >
        <FiPackage className="text-lg opacity-80" />
        <span>Manage Products</span>
      </NavLink>

      {/* User Management Link */}
      <NavLink
        to={adminRoute("user/list")}
        onClick={onNavigate}
        className={() =>
          `${baseLinkClass} ${isUserActive ? activeClass : normalClass}`
        }
      >
        <FiUsers className="text-lg opacity-80" />
        <span>Manage Users</span>
      </NavLink>

      {/* Registration Applications Link */}
      <NavLink
        to={adminRoute("visitor-analytics")}
        onClick={onNavigate}
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeClass : normalClass}`
        }
      >
        <FiActivity className="text-lg opacity-80" />
        <span>Visitor Analytics</span>
      </NavLink>

      <NavLink
        to={adminRoute("seller/applications")}
        onClick={onNavigate}
        className={() =>
          `${baseLinkClass} ${isBidderFormActive ? activeClass : normalClass}`
        }
      >
        <FiFileText className="text-lg opacity-80" />
        <span>Manage Applications</span>
      </NavLink>

      {/* Separate section for profile and action triggers */}
      <div className="pt-4 mt-4 border-t border-border space-y-1">
        <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
          Account
        </div>

        {/* Personal Profile Info Link */}
        <NavLink
          to={adminRoute("profile")}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <FiUserCheck className="text-lg opacity-80" />
          <span>Profile Info</span>
        </NavLink>

        {/* Account Logout Button */}
        <div
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors duration-200"
          onClick={() => {
            onNavigate?.();
            accountService.logout()
              .then((data) => {
                if (data.code === "success") {
                  toast.success(data.message);
                  navigate(`/`);
                }
              });
          }}
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </div>
      </div>
    </nav>
  );
}
