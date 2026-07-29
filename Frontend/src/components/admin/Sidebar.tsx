import {
  FiHome,
  FiTag,
  FiPackage,
  FiUsers,
  FiFileText,
  FiUserCheck,
  FiLogOut,
} from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { accountService } from "@/services/account.service.ts";

const baseLinkClass =
  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200";
const activeClass =
  "bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.15)] font-semibold";
const normalClass =
  "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:border-l-2 hover:border-amber-500/30";

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  
  // Check if current path matches parent categories route
  const isCategoryActive = pathname.startsWith(
    `/${import.meta.env.VITE_PATH_ADMIN}/category`
  );
  
  // Check if current path matches parent users route
  const isUserActive = pathname.startsWith(
    `/${import.meta.env.VITE_PATH_ADMIN}/user`
  );
  
  // Check if current path matches bidder applications route
  const isBidderFormActive =
    pathname.startsWith(
      `/${import.meta.env.VITE_PATH_ADMIN}/seller/applications`
    ) ||
    pathname.startsWith(
      `/${import.meta.env.VITE_PATH_ADMIN}/seller/application/`
    );

  return (
    <nav className="p-4 space-y-1.5 bg-[#0F1420]/60 h-full border-r border-amber-500/10 transition-colors duration-300">
      <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
        Navigation
      </div>

      {/* Dashboard / Overview Link */}
      <NavLink
        to={`/${import.meta.env.VITE_PATH_ADMIN}/dashboard`}
        end
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeClass : normalClass}`
        }
      >
        <FiHome className="text-lg text-amber-400/80" />
        <span>Dashboard</span>
      </NavLink>

      {/* Category Management Link */}
      <NavLink
        to={`/${import.meta.env.VITE_PATH_ADMIN}/category/list`}
        className={() =>
          `${baseLinkClass} ${isCategoryActive ? activeClass : normalClass}`
        }
      >
        <FiTag className="text-lg text-amber-400/80" />
        <span>Manage Categories</span>
      </NavLink>

      {/* Product Management Link */}
      <NavLink
        to={`/${import.meta.env.VITE_PATH_ADMIN}/product/list`}
        className={({ isActive }) =>
          `${baseLinkClass} ${isActive ? activeClass : normalClass}`
        }
      >
        <FiPackage className="text-lg text-amber-400/80" />
        <span>Manage Products</span>
      </NavLink>

      {/* User Management Link */}
      <NavLink
        to={`/${import.meta.env.VITE_PATH_ADMIN}/user/list`}
        className={() =>
          `${baseLinkClass} ${isUserActive ? activeClass : normalClass}`
        }
      >
        <FiUsers className="text-lg text-amber-400/80" />
        <span>Manage Users</span>
      </NavLink>

      {/* Registration Applications Link */}
      <NavLink
        to={`/${import.meta.env.VITE_PATH_ADMIN}/seller/applications`}
        className={() =>
          `${baseLinkClass} ${isBidderFormActive ? activeClass : normalClass}`
        }
      >
        <FiFileText className="text-lg text-amber-400/80" />
        <span>Manage Applications</span>
      </NavLink>

      {/* Separate section for profile and action triggers */}
      <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
          Account
        </div>

        {/* Personal Profile Info Link */}
        <NavLink
          to={`/${import.meta.env.VITE_PATH_ADMIN}/profile`}
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          <FiUserCheck className="text-lg text-amber-400/80" />
          <span>Profile Info</span>
        </NavLink>

        {/* Account Logout Button */}
        <div
          className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-all duration-200 border border-transparent hover:border-rose-500/20"
          onClick={() => {
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
