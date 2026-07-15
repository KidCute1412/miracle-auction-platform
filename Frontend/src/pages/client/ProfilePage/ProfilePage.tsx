import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import { useParams } from "react-router-dom";
import Loading from "@/components/common/Loading";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Star,
  Award,
  Edit,
  Shield,
  Crown,
  Sparkles,
  ChevronRight,
  Fingerprint
} from "lucide-react";
import { profileService } from "@/services/profile.service.ts";

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: "bidder" | "seller" | "admin";
  rating: number;
  rating_count: number;
  address: string;
  date_of_birth: string;
  avatar?: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const params = useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

  useEffect(() => {
    const username = params.username_id?.trim().split("_")[0];
    const user_id = params.username_id?.trim().split("_")[1];
    if (!username || !user_id) {
      navigate("/");
      return;
    }
    profileService.getProfileDetail({ username, user_id })
      .then((data) => {
        setUserProfile(data.data);
        setIsOwner(data.is_owner);
      })
      .catch((error) => {
        console.error("Can't connect to backend:", error);
        navigate("/");
      });
  }, [params, navigate]);

  const getRoleLabel = (role: string) => {
    if (!isOwner && role === "admin") {
      return "Royal Merchant";
    }
    
    switch (role) {
      case "admin": return "Grand Archon";
      case "seller": return "Elite Merchant";
      case "user": return "Noble Bidder";
      default: return "Noble Guest";
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    if (!isOwner && role === "admin") {
      return "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
    }
    
    switch (role) {
      case "admin": return "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800";
      case "seller": return "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
      case "user": return "bg-violet-100 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800";
      default: return "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700";
    }
  };

  if (!userProfile) return <Loading />;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Top Breadcrumb header */}
        <div className="flex items-center gap-2 mb-8 text-xs font-semibold tracking-wider uppercase text-accent">
          <Crown className="w-4 h-4" />
          <span>Imperial registry / Profile View</span>
        </div>

        {/* New Split Content Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card Overview */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-md transition-colors duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image & Avatar */}
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent bg-background flex items-center justify-center shadow-lg transition-colors duration-300">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-heading font-bold text-accent">
                      {userProfile.full_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-card shadow-md" title="Online Status"></div>
              </div>

              {/* Identity Details */}
              <h2 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">
                {userProfile.full_name}
              </h2>
              <p className="text-sm font-mono text-muted-foreground mb-4">
                @{userProfile.username}
              </p>

              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold mb-6 ${getRoleBadgeStyle(userProfile.role)}`}>
                <Shield className="w-3.5 h-3.5" />
                {getRoleLabel(userProfile.role)}
              </span>

              {/* Rating Section */}
              <div className="w-full border-t border-border pt-6 mb-6">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-muted-foreground">Rating Status</span>
                  <span className="font-bold text-accent">{userProfile.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.floor(userProfile.rating) ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <Link
                  to={`${location.pathname}/rate`}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1 font-semibold"
                >
                  View rating logs ({userProfile.rating_count} reviews)
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Edit Profile Button */}
              {isOwner && (
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-accent hover:bg-accent/90 text-white dark:text-neutral-950 font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Refine Credentials
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Account Registry Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Section */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight mb-2">
                Imperial Credentials
              </h1>
              <p className="text-sm text-muted-foreground">
                Verified identification status and privileges mapped within the registry system.
              </p>
            </div>

            {/* Structured Registry Data */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-4 mb-6">
                Registry Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Mail className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Registered Email</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm truncate">{userProfile.email}</p>
                </div>

                {/* Shipping Location */}
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Shipping Domain</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm truncate">{userProfile.address || "Unspecified"}</p>
                </div>

                {/* Username details */}
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Fingerprint className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Identity Alias</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{userProfile.username}</p>
                </div>

                {/* DOB details */}
                <div className="p-4 bg-muted/20 border border-border rounded-xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Genesis Date</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Not registered"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}