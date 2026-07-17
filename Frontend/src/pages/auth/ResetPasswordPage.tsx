/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import JustValidate from "just-validate";
import { useEffect } from "react";
import { toast } from "sonner";
import { KeyRound, Key, Check, RotateCcw } from "lucide-react";
import { accountService } from "@/services/account.service.ts";

function ResetPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check account verification status on mount
    accountService.verifyAccount({ email: "" })
      .then((data) => {
        if (data.code === "error") {
          toast.error(data.message);
          navigate("/accounts/login");
        }
      });
  }, [navigate]);

  useEffect(() => {
    const validate = new JustValidate("#resetPasswordForm");

    validate
      .addField(
        "#password",
        [
          { rule: "required", errorMessage: "Please enter your password!" },
          {
            validator: (value: string) => value.length >= 8,
            errorMessage: "Password must be at least 8 characters",
          },
          {
            validator: (value: string) => /[A-Z]/.test(value),
            errorMessage: "Password must contain at least one uppercase letter!",
          },
          {
            validator: (value: string) => /[a-z]/.test(value),
            errorMessage: "Password must contain at least one lowercase letter!",
          },
          {
            validator: (value: string) => /\d/.test(value),
            errorMessage: "Password must contain at least one digit!",
          },
          {
            validator: (value: string) => /[@$!%*?&]/.test(value),
            errorMessage: "Password must contain at least one special character!",
          },
        ],
        {
          errorContainer: "#passwordError",
        }
      )
      .addField(
        "#confirmPassword",
        [
          { rule: "required", errorMessage: "Please confirm your password!" },
          {
            validator: (value: string) => value.length >= 8,
            errorMessage: "Password must be at least 8 characters",
          },
          {
            validator: (value: string) => /[A-Z]/.test(value),
            errorMessage: "Password must contain at least one uppercase letter!",
          },
          {
            validator: (value: string) => /[a-z]/.test(value),
            errorMessage: "Password must contain at least one lowercase letter!",
          },
          {
            validator: (value: string) => /\d/.test(value),
            errorMessage: "Password must contain at least one digit!",
          },
          {
            validator: (value: string) => /[@$!%*?&]/.test(value),
            errorMessage: "Password must contain at least one special character!",
          },
        ],
        { errorContainer: "#confirmPasswordError" }
      )
      .onSuccess((event: any) => {
        const password = event.target.password.value;
        const confirmPassword = event.target.confirmPassword.value;
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
        } else {
          // Get email from search parameters
          const params = new URLSearchParams(window.location.search);
          const email = params.get("email");
          if (!email) {
            toast.error("Missing account email");
            return;
          }

          const dataFinal = {
            email,
            password,
          };

          accountService.resetPassword(dataFinal)
            .then((data) => {
              if (data.code === "error") {
                toast.error(data.message);
              }
              if (data.code === "success") {
                toast.success(data.message);
                navigate("/accounts/login");
              }
            })
            .catch(() => {
              toast.error("An error occurred, please try again!");
            });
        }
      });
  }, [navigate]);

  return (
    <div className="flex justify-center px-4 min-h-[calc(100vh-140px)] items-center py-4 transition-colors duration-300">
      <form
        id="resetPasswordForm"
        className="w-full max-w-md bg-card p-6 sm:p-7 rounded-2xl shadow-gold-glow border border-border"
      >
        {/* Header section with KeyRound icon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2 border border-accent/20">
            <KeyRound className="w-5 h-5 text-accent" />
          </div>
          <h1 className="font-heading font-bold text-xl text-foreground mb-1">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-xs">
            Please enter your new password to continue
          </p>
        </div>

        {/* Inputs stack */}
        <div className="space-y-3.5">
          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div id="passwordError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Confirm Password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <div id="confirmPasswordError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Action button */}
          <div className="pt-1">
            <button
              className="w-full cursor-pointer bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
              type="submit"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Password
            </button>
          </div>

          {/* Navigation to login */}
          <div className="text-center pt-1">
            <span className="text-xs text-muted-foreground">Back to login?</span>
            <span
              className="ml-1 text-accent hover:underline cursor-pointer font-bold transition-colors duration-200 text-xs"
              onClick={() => navigate("/accounts/login")}
            >
              Log in now
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
