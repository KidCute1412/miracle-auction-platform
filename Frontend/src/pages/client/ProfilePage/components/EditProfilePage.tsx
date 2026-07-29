import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/routes/ProtectedRouter";
import { useNavigate } from "react-router-dom";
import JustValidate from "just-validate";
import DatePicker from "react-datepicker";
import Loading from "@/components/common/Loading";
import { 
  User, 
  Mail, 
  MapPin, 
  Save, 
  Edit3,
  Camera
} from "lucide-react";
import { toast } from "sonner";
import { profileService } from "@/services/profile.service.ts";
import AvatarUpload from "@/components/common/AvatarUpload";

interface ProfileData {
  username: string;
  email: string;
  full_name: string;
  address: string;
  date_of_birth: string;
  avatar?: string;  
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth, setAuth } = useAuth();
  const [date, setDate] = useState<Date | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [formData, setFormData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (auth) {
      setFormData({
        username: auth.username,
        email: auth.email,
        full_name: auth.full_name,
        address: auth.address,
        date_of_birth: auth.date_of_birth,
        avatar: auth.avatar
      });
      const parsedDate = auth.date_of_birth ? new Date(auth.date_of_birth) : null;
      setDate(parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null);
      if (auth.avatar) {
        setAvatarPreview(auth.avatar);
      }
    }
  }, [auth]);

  useEffect(() => {
    if (!formData || formRef.current) return;  
    const validate = new JustValidate("#edit-profile-form");
    formRef.current = validate as any;
    validate
      .addField("#username", [
        { rule: "required", errorMessage: "Username is required" },
        { rule: "minLength", value: 3, errorMessage: "Username must be at least 3 characters" }
      ])
      .addField("#email", [
        { rule: "required", errorMessage: "Email is required" },
        { rule: "email", errorMessage: "Invalid email" }
      ])
      .addField("#full_name", [
        { rule: "required", errorMessage: "Full name is required" },
        { rule: "minLength", value: 3, errorMessage: "Full name must be at least 3 characters" }
      ])
      .onSuccess(() => {
        setIsSubmitting(true);
      });
  }, [formData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size cannot exceed 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!isSubmitting) return;
    
    const formSubmitData = new FormData();
    formSubmitData.append("username", event.target.username.value);
    formSubmitData.append("email", event.target.email.value);
    formSubmitData.append("full_name", event.target.full_name.value);
    formSubmitData.append("address", event.target.address.value);
    formSubmitData.append("date_of_birth", date ? date.toLocaleDateString("en-CA") : "");
    if (avatarFile) {
      formSubmitData.append("avatar", avatarFile);
    }
    
    profileService.editProfile(formSubmitData)
      .then((data) => {
        toast.success(data.message || "Profile updated successfully");
        setAuth(data.data);
        navigate(-1);
      })
      .catch((err) => {
        toast.error(err.message || "An error occurred while updating profile");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (!formData) return <Loading />;

  return (
    <div className="min-h-screen bg-background text-foreground py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Edit3 className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-foreground mb-1">Edit Profile</h1>
          <p className="text-muted-foreground text-sm">Update your personal information</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          {/* Card Header */}
          <div className="bg-accent text-white p-4">
            <h2 className="text-lg font-semibold flex items-center">
              <User className="w-4 h-4 mr-2" />
              Personal Information
            </h2>
          </div>

          {/* Form Content */}
          <form id="edit-profile-form" onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4 p-3 bg-muted/30 border border-border rounded-xl mb-4">
                <AvatarUpload
                  currentAvatarUrl={auth.avatar}
                  name={auth.full_name || auth.username}
                  onFileSelect={(file) => setAvatarFile(file)}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Profile Avatar</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG, max 10MB.</p>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label htmlFor="#username" className="block text-xs font-semibold text-muted-foreground mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      defaultValue={formData.username}
                      className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-accent focus:border-accent transition-colors text-sm"
                      placeholder="username123"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="#email" className="block text-xs font-semibold text-muted-foreground mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={formData.email}               
                      className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-accent focus:border-accent transition-colors text-sm"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="#full_name" className="block text-xs font-semibold text-muted-foreground mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      defaultValue={formData.full_name}
                      className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-accent focus:border-accent transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="#date_of_birth" className="block text-xs font-semibold text-muted-foreground mb-1">
                    Date of Birth 
                  </label>
                  <DatePicker
                    id="date_of_birth"
                    name="date_of_birth"
                    selected={date}
                    onChange={(date: Date | null) => setDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-accent focus:border-accent transition-colors text-sm"
                    placeholderText="Select date of birth"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="#address" className="block text-xs font-semibold text-muted-foreground mb-1">
                  Address 
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/50" />
                  <textarea
                    defaultValue={formData.address}
                    name="address"
                    rows={2}
                    id="address"
                    className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-foreground focus:ring-1 focus:ring-accent focus:border-accent transition-colors resize-none text-sm"
                    placeholder="123 Street, District, City"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 cursor-pointer border border-border text-muted-foreground rounded-lg bg-card hover:bg-muted/50 transition-colors text-sm"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 cursor-pointer bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}