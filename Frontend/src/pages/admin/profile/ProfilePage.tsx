import React, { useState } from "react";
import { Save, X, User, Mail, Shield } from "lucide-react";
import { useAuth } from "@/routes/ProtectedRouter";
import { toast } from "sonner";
import { profileService } from "@/services/profile.service";
import AvatarUpload from "@/components/common/AvatarUpload";

export default function ProfilePage() {
  const { auth: user, setAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (file: File) => {
    setSelectedFile(file);
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name);
      formDataToSend.append("username", user.username);
      formDataToSend.append("email", formData.email);
      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }
      
      const data = await profileService.editProfile(formDataToSend);

      if (data.status === "success") {
        toast.success("Profile updated successfully!");
        setAuth(data.data);
        setIsEditing(false);
        setSelectedFile(null);
      } else {
        toast.error(data.message || "An error occurred during update!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  };

  if (!user) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] flex justify-center items-center py-6 bg-background text-foreground transition-colors duration-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-foreground bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
            Personal Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your account information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm text-center transition-colors duration-300">
              <AvatarUpload
                currentAvatarUrl={user.avatar}
                name={user.full_name || user.username}
                onFileSelect={handleAvatarSelect}
                size="xl"
              />

              <h3 className="text-base font-bold text-foreground mt-3">
                {user.full_name}
              </h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>

              <div className="mt-3 flex justify-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                      : user.role === "seller"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-primary/10 text-accent border border-accent/20"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  {user.role === "admin"
                    ? "Administrator"
                    : user.role === "seller"
                    ? "Seller"
                    : "User"}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                <h2 className="text-base font-bold text-foreground">
                  Detailed Info
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="bg-muted text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/80 text-xs font-semibold transition-colors cursor-pointer"
                      disabled={isSaving}
                    >
                      <X size={14} className="inline mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:opacity-90 text-xs font-semibold transition-opacity disabled:opacity-50 cursor-pointer"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white inline mr-1"></div>
                      ) : (
                        <Save size={14} className="inline mr-1" />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <User className="inline w-3.5 h-3.5 mr-1 align-text-bottom" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 border border-border bg-muted/30 text-foreground text-sm rounded-lg outline-none focus:border-accent transition-all"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm text-foreground bg-muted/20 border border-border/50 px-3.5 py-2 rounded-lg">
                      {user.full_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Mail className="inline w-3.5 h-3.5 mr-1 align-text-bottom" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3.5 py-2 border border-border bg-muted/30 text-muted-foreground text-sm rounded-lg outline-none cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-sm text-foreground bg-muted/20 border border-border/50 px-3.5 py-2 rounded-lg">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Shield className="inline w-3.5 h-3.5 mr-1 align-text-bottom" />
                    User Role
                  </label>
                  <p className="text-sm text-foreground bg-muted/20 border border-border/50 px-3.5 py-2 rounded-lg">
                    {user.role === "admin"
                      ? "Administrator"
                      : user.role === "seller"
                      ? "Seller"
                      : "User"}
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
