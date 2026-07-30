
import { useNavigate } from "react-router-dom";
import JustValidate from "just-validate";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Key, Check, Lock, ShieldCheck, CheckCircle, Eye, EyeOff } from "lucide-react";
import OTPForm from "@/components/common/OTPForm";
import { accountService } from "@/services/account.service.ts";

interface ChangePasswordFormProps {
  onSuccess: () => void;
}

function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validate = new JustValidate("#changePasswordForm");

    validate
      .addField(
        "#currentPassword",
        [
          { rule: "required", errorMessage: "Please enter your current password!" },
        ],
        {
          errorContainer: "#currentPasswordError",
        }
      )
      .addField(
        "#newPassword",
        [
          { rule: "required", errorMessage: "Please enter your new password!" },
          {
            validator: (value: string) => value.length >= 8,
            errorMessage: "Password must be at least 8 characters long",
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
            errorMessage: "Password must contain at least one number!",
          },
          {
            validator: (value: string) => /[@$!%*?&]/.test(value),
            errorMessage: "Password must contain at least one special character!",
          },
        ],
        {
          errorContainer: "#newPasswordError",
        }
      )
      .addField(
        "#confirmPassword",
        [
          { rule: "required", errorMessage: "Please re-enter password!" },
          {
            validator: (value: string) => value.length >= 8,
            errorMessage: "Password must be at least 8 characters long",
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
            errorMessage: "Password must contain at least one number!",
          },
          {
            validator: (value: string) => /[@$!%*?&]/.test(value),
            errorMessage: "Password must contain at least one special character!",
          },
        ],
        { errorContainer: "#confirmPasswordError" }
      )
      .onSuccess((event: any) => {
        const currentPassword = event.target.currentPassword.value;
        const newPassword = event.target.newPassword.value;
        const confirmPassword = event.target.confirmPassword.value;
        
        if (newPassword !== confirmPassword) {
          toast.error("New passwords do not match!");
          return;
        }

        if (currentPassword === newPassword) {
          toast.error("New password must be different from current password!");
          return;
        }

        const dataFinal = {
          currentPassword,
          newPassword,
        };

        accountService.changePassword(dataFinal)
          .then((data) => {
            if (data.code === "error") {
              toast.error(data.message);
            }

            if (data.code === "success") {
              toast.success("Please verify OTP to complete changing your password!");
              onSuccess();
            }
          })
          .catch(() => {
            toast.error("An error occurred, please try again!");
          });
      });

    return () => {
      validate.destroy();
    };
  }, [onSuccess]);

  return (
    <form
      id="changePasswordForm"
      action=""
      className="bg-card p-6 rounded-2xl shadow-2xl border border-border"
    >
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-3 shadow-lg">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/90 bg-clip-text text-transparent">
          Change Password
        </h1>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Current Password Field */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-bold text-muted-foreground mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pl-10 pr-10 border border-border rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-200 bg-muted hover:bg-card text-sm text-foreground"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div id="currentPasswordError" className="text-xs text-red-500 mt-1 font-medium"></div>
        </div>

        {/* New Password Field */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-bold text-muted-foreground mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pl-10 pr-10 border border-border rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-200 bg-muted hover:bg-card text-sm text-foreground"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Key className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div id="newPasswordError" className="text-xs text-red-500 mt-1 font-medium"></div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-muted-foreground mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pl-10 pr-10 border border-border rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-200 bg-muted hover:bg-card text-sm text-foreground"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Check className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div id="confirmPasswordError" className="text-xs text-red-500 mt-1 font-medium"></div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full cursor-pointer bg-accent hover:bg-accent/90 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
          type="submit"
        >
          <KeyRound className="w-4 h-4" />
          Update
        </button>

        {/* Back Link */}
        <div className="text-center pt-2">
          <span
            className="text-accent hover:text-accent/90 cursor-pointer font-semibold transition-colors duration-200 text-xs"
            onClick={() => navigate(-1)}
          >
            ← Back
          </span>
        </div>
      </div>
    </form>
  );
}

interface OTPVerifyFormProps {
  onBack: () => void;
}

function OTPVerifyForm({ onBack }: OTPVerifyFormProps) {
  const navigate = useNavigate();
  const [otpValue, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleOtpSubmit = (event: any) => {
    event.preventDefault();

    if (otpValue.trim().length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    const finalData = { otp: otpValue };

    accountService.verifyChangePassword(finalData as any)
      .then((data) => {
        if (data.code === "success") {
          toast.success(data.message);
          navigate(-1);
        }
        if (data.code === "error") {
          toast.error(data.message);
        }
        if (data.code === "otp error") {
          toast.error(data.message);
          setOtpError(data.message);
        }
      });
  };

  return (
    <form
      id="otpVerifyForm"
      action=""
      className="bg-card p-6 rounded-2xl shadow-2xl border border-border"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-3 shadow-lg">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/90 bg-clip-text text-transparent">
          OTP Verification
        </h1>
      </div>

      {/* OTP Input */}
      <div className="flex flex-col items-center space-y-3 mb-4">
        <div className="w-full flex flex-col items-center">
          <OTPForm
            className="flex scale-125 bg-card"
            onChange={(val) => {
              setOtp(val);
              setOtpError("");
            }}
          />
        </div>
        {otpError && <div className="text-red-500 text-xs font-medium">{otpError}</div>}
      </div>

      {/* Submit Button */}
      <button
        className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer mb-3"
        type="submit"
        onClick={handleOtpSubmit}
      >
        <CheckCircle className="w-4 h-4" />
        Confirm
      </button>

      {/* Back Link */}
      <div className="text-center">
        <span
          className="text-accent hover:text-accent/90 cursor-pointer font-semibold transition-colors duration-200 text-xs"
          onClick={onBack}
        >
          ← Back
        </span>
      </div>
    </form>
  );
}

function ChangePassword() {
  const [showOtpForm, setShowOtpForm] = useState(false);

  return (
    <div className="flex items-center justify-center px-4 py-8 mb-20 bg-background text-foreground min-h-[70vh]">
      <div className="w-full max-w-md">
        {/* Header Text */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/95 bg-clip-text text-transparent">
            {showOtpForm ? "OTP Verification" : "Change Password"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {showOtpForm 
              ? "Enter the OTP code sent to your email"
              : "Update a new password for your account"
            }
          </p>
        </div>

        {showOtpForm ? (
          <OTPVerifyForm onBack={() => setShowOtpForm(false)} />
        ) : (
          <ChangePasswordForm onSuccess={() => setShowOtpForm(true)} />
        )}
      </div>
    </div>
  );
}

export default ChangePassword;
