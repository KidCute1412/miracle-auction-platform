/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import JustValidate from "just-validate";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, User, Mail, MapPin, Lock } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { accountService } from "@/services/account.service.ts";

function AccountRegister() {
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSuccessGoogleLogin = async (credentialResponse: any) => {
    const { credential } = credentialResponse;
    const dataFinal = { credential: credential, rememberMe: false };

    accountService.googleLogin(dataFinal as any)
      .then((data) => {
        if (data.code === "error") {
          toast.error(data.message);
        }
        if (data.code === "success") {
          toast.success(data.message || "Logged in successfully!");
          if (data.role === "admin") {
            navigate(`/admin/dashboard`);
          } else {
            navigate(`/`);
          }
        }
      });
  };

  useEffect(() => {
    const validate = new JustValidate("#registerForm");
    validate
      .addField(
        "#full_name",
        [{ rule: "required", errorMessage: "Please enter your name!" }],
        { errorContainer: "#fullNameError" }
      )
      .addField(
        "#email",
        [
          { rule: "required", errorMessage: "Please enter your email!" },
          { rule: "email", errorMessage: "Invalid email address!" },
        ],
        { errorContainer: "#emailError" }
      )
      .addField(
        "#password",
        [{ rule: "required", errorMessage: "Please enter your password!" }],
        { errorContainer: "#passwordError" }
      )
      .addField(
        "#address",
        [{ rule: "required", errorMessage: "Please enter your address!" }],
        { errorContainer: "#addressError" }
      )
      .onSuccess((event: any) => {
        const full_name = event.target.full_name.value;
        const email = event.target.email.value;
        const password = event.target.password.value;
        const address = event.target.address.value;

        const finalData = {
          full_name: full_name,
          email: email,
          password: password,
          address: address,
        };

        accountService.register(finalData)
          .then((data) => {
            if (data.code === "error") {
              toast.error(data.message);
            }
            if (data.code === "success") {
              navigate(`/accounts/verify?email=${email}&type=register`);
            }
            if (data.code === "existedOTP") {
              toast.error(data.message);
              navigate(`/accounts/verify?email=${email}&type=register`);
            }
          });
      });
  }, [navigate]);

  return (
    <div className="flex justify-center px-4 min-h-[calc(100vh-140px)] items-center py-4 transition-colors duration-300">
      <form
        id="registerForm"
        className="w-full max-w-md bg-card p-6 sm:p-7 rounded-2xl shadow-gold-glow border border-border"
      >
        {/* Compact Title */}
        <div className="text-center mb-4">
          <h1 className="font-heading font-bold text-xl text-foreground">
            Register
          </h1>
        </div>

        {/* Compact Input Stack */}
        <div className="space-y-3">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="full_name"
                placeholder="John Doe"
                className="w-full px-3.5 py-1.5 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div id="full_nameError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                id="email"
                placeholder="your@email.com"
                className="w-full px-3.5 py-1.5 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div id="emailError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Address
            </label>
            <div className="relative">
              <input
                id="address"
                type="text"
                placeholder="City, Country"
                className="w-full px-3.5 py-1.5 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div id="addressError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-1.5 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div id="passwordError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Terms Agreement */}
          <div className="pb-1">
            <label className="flex items-start gap-2 cursor-pointer group select-none">
              <input
                id="agree"
                type="checkbox"
                className="w-3.5 h-3.5 mt-0.5 text-accent bg-muted border-border rounded focus:ring-accent cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                I agree to the{" "}
                <span className="text-accent font-semibold hover:underline">
                  Terms of Service
                </span>
              </span>
            </label>
            <div id="agreeError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full cursor-pointer bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
            type="submit"
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>

          {/* Social Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                OR
              </span>
            </div>
          </div>

          {/* Google OAuth wrap */}
          <div className="flex justify-center w-full">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleSuccessGoogleLogin}
                onError={() => {
                  console.error("Google login failed");
                  toast.error("Google login failed");
                }}
                theme="outline"
                size="large"
                shape="pill"
              />
            </GoogleOAuthProvider>
          </div>

          {/* Login Link */}
          <div className="text-center pt-1">
            <span className="text-xs text-muted-foreground">Already have an account?</span>
            <span
              className="ml-1 text-accent hover:underline cursor-pointer font-bold transition-colors duration-200 text-xs"
              onClick={() => navigate("/accounts/login")}
            >
              Log in here
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AccountRegister;
