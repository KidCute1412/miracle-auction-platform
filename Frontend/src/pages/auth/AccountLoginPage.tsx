/* eslint-disable @typescript-eslint/no-explicit-any */
import JustValidate from "just-validate";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { accountService } from "@/services/account.service.ts";

function AccountLogin() {
  const navigate = useNavigate();
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const validate = new JustValidate("#loginForm", { lockForm: false });
    validate
      .addField("#email", [
        { rule: "required", errorMessage: "Please enter your email!" },
        { rule: "email", errorMessage: "Invalid email address!" },
      ])
      .addField("#password", [
        { rule: "required", errorMessage: "Please enter your password!" },
      ])
      .onSuccess((e: any) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const email = (form.querySelector("#email") as HTMLInputElement).value;
        const password = (form.querySelector("#password") as HTMLInputElement)
          .value;
        const rememberPassword = (
          form.querySelector("#rememberPassword") as HTMLInputElement
        ).checked;

        if (!isCaptchaChecked || !captchaToken) {
          toast.error("Please verify that you are not a robot!");
          return;
        }

        const dataFinal = {
          email: email,
          password: password,
          rememberPassword: rememberPassword,
          captchaToken: captchaToken,
        };

        accountService.login(dataFinal)
          .then((data) => {
            if (data.code === "error") {
              toast.error(data.message);
            }

            if (data.code === "success") {
              toast.success("Logged in successfully!");
              if (data.role === "admin") {
                navigate(`/admin/dashboard`);
              } else {
                navigate(`/`);
              }
            }
          });
      });
    return () => {
      validate.destroy();
    };
  }, [isCaptchaChecked, captchaToken, navigate]);

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

  return (
    <div className="flex justify-center px-4 min-h-[calc(100vh-140px)] items-center py-4 transition-colors duration-300">
      <form
        id="loginForm"
        className="w-full max-w-md bg-card p-6 sm:p-7 rounded-2xl shadow-gold-glow border border-border"
      >
        {/* Compact Title */}
        <div className="text-center mb-4">
          <h1 className="font-heading font-bold text-xl text-foreground">
            Log In
          </h1>
        </div>

        {/* Inputs stack */}
        <div className="space-y-3.5">
          {/* Email input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                id="email"
                placeholder="your@email.com"
                className="w-full px-3.5 py-2 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div id="emailError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 pl-10 pr-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div id="passwordError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Remember/Forgot options */}
          <div className="flex items-center justify-between pb-0.5">
            <label className="flex items-center cursor-pointer group select-none">
              <input
                id="rememberPassword"
                type="checkbox"
                className="w-3.5 h-3.5 text-accent bg-muted border-border rounded focus:ring-accent focus:ring-offset-background cursor-pointer"
              />
              <span className="ml-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>
            <span
              className="text-xs text-accent hover:underline cursor-pointer font-semibold transition-colors duration-200"
              onClick={() => navigate("/accounts/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          {/* Google reCAPTCHA - scaled slightly down to fit */}
          <div className="flex justify-center my-1">
            <div className="scale-90 origin-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_CAPTCHA_SITE_KEY}
                onChange={(token) => {
                  setIsCaptchaChecked(!!token);
                  setCaptchaToken(token);
                }}
                onExpired={() => {
                  setIsCaptchaChecked(false);
                  setCaptchaToken(null);
                }}
                onErrored={() => {
                  setIsCaptchaChecked(false);
                  setCaptchaToken(null);
                  toast.error("Error loading reCAPTCHA, please try again!");
                }}
              />
            </div>
          </div>

          {/* Form Submit Button */}
          <div>
            <button
              className="w-full cursor-pointer bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
              type="submit"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
          </div>

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

          {/* Registration link */}
          <div className="text-center pt-1">
            <span className="text-xs text-muted-foreground">Don't have an account?</span>
            <span
              className="ml-1 text-accent hover:underline cursor-pointer font-bold transition-colors duration-200 text-xs"
              onClick={() => navigate("/accounts/register")}
            >
              Register now
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AccountLogin;
