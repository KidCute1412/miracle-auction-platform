import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { UserItem } from "@/interface/user.interface";
import { formatDateOfBirth } from "@/utils/format_time";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { userService } from "@/services/user.service.ts";
import { AdminDetailSkeleton } from "@/components/common/ContentSkeletons";
import UserAvatar from "@/components/common/UserAvatar";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Star,
  MessageSquare,
  Key,
  Save,
  AlertTriangle,
  ChevronDown,
  Check
} from "lucide-react";

type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  icon: React.ReactNode;
};

function CustomDropdown({ label, value, onChange, options, icon }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-border rounded-xl text-sm bg-card text-foreground cursor-pointer focus:outline-none hover:bg-muted/20 transition-all select-none text-left"
      >
        <span>{selectedOption ? selectedOption.label : "Select option..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 overflow-y-auto rounded-xl border border-border bg-card shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-muted text-foreground transition-colors duration-150 cursor-pointer"
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="h-4 w-4 text-accent shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    userService.adminDetail(Number(id))
      .then((data) => {
        if (data.code === "success" && data.user) {
          setUserDetail(data.user);
          setSelectedRole(data.user.role);
          setSelectedStatus(data.user.status);
        } else {
          setUserDetail(null);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setUserDetail(null);
        setIsLoading(false);
      });
  }, [id]);

  const handleSave = () => {
    if (!id) return;
    userService.adminEditRole(Number(id), { role: selectedRole, status: selectedStatus })
      .then((data) => {
        if (data.code === "success") {
          toast.success(data.message || "User updated successfully");
          // Update local state instead of hard reload
          if (userDetail) {
            setUserDetail({
              ...userDetail,
              role: selectedRole,
              status: selectedStatus
            });
          }
        } else {
          toast.error(data.message || "Failed to update user details");
        }
      })
      .catch(() => {
        toast.error("An error occurred, please try again!");
      });
  };

  const handleResetPassword = () => {
    Swal.fire({
      title: "Are you sure you want to reset the password?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        if (!id) return;
        userService.adminResetPassword(Number(id), {})
          .then((data) => {
            if (data.code === "success") {
              toast.success(data.message || "Password reset successfully");
            } else {
              toast.error(data.message || "Failed to reset password");
            }
          })
          .catch(() => {
            toast.error("An error occurred, please try again!");
          });
      }
    });
  };

  if (isLoading) {
    return <AdminDetailSkeleton />;
  }

  if (!userDetail) {
    return (
      <div className="p-6 text-foreground max-w-4xl mx-auto mt-10">
        <div className="text-center bg-card border border-destructive/20 rounded-2xl p-12 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">User Not Found</h3>
          <p className="text-sm text-muted-foreground mb-6">The user you are trying to inspect does not exist or has been removed.</p>
          <button
            onClick={() => navigate("/admin/user/list")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to user list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/user/list")}
            className="cursor-pointer p-3 hover:bg-muted rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{userDetail.full_name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                userDetail.status === "active"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}>
                {userDetail.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">User ID: #{userDetail.id}</p>
          </div>
        </div>
      </div>

      {/* Main Details Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status summary and stats */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col items-center text-center py-4 border-b border-border/50">
              <UserAvatar src={userDetail.avatar} name={userDetail.full_name || userDetail.username} size="lg" className="mb-3" />
              <h3 className="font-bold text-foreground text-lg">{userDetail.username}</h3>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{userDetail.role}</p>
            </div>

            {/* Account Metrics */}
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 shrink-0" />
                  Avg Rating
                </span>
                <span className="font-bold text-foreground">{userDetail.rating} / 5.0</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-accent shrink-0" />
                  Review Count
                </span>
                <span className="font-bold text-foreground">{userDetail.rating_count} reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile fields and actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-3">
              Personal Information
            </h3>

            {/* Profile fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={userDetail.full_name}
                  readOnly
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/20 text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={userDetail.email}
                  readOnly
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/20 text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  Residential Address
                </label>
                <input
                  type="text"
                  value={userDetail.address || "Not provided"}
                  readOnly
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/20 text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={formatDateOfBirth(userDetail.date_of_birth)}
                  readOnly
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/20 text-foreground focus:outline-none"
                />
              </div>

              <CustomDropdown
                label="User Role"
                value={selectedRole}
                onChange={setSelectedRole}
                options={[
                  { value: "user", label: "User" },
                  { value: "seller", label: "Seller" },
                ]}
                icon={<Shield className="w-3.5 h-3.5 text-accent" />}
              />

              <CustomDropdown
                label="Account Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                icon={<Activity className="w-3.5 h-3.5 text-accent" />}
              />
            </div>

            {/* Actions triggers */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border/50">
              <button
                onClick={handleResetPassword}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-semibold rounded-xl transition-all"
              >
                <Key className="w-4 h-4" /> Reset Password
              </button>
              <button
                onClick={handleSave}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
