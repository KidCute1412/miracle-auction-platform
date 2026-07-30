
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OTPForm from "@/components/common/OTPForm";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { accountService } from "@/services/account.service.ts";

function AccountVerify() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const verifyType = params.get("type");

  useEffect(() => {
    accountService.verifyAccount({ email: "" }) // backend session validates this
      .then((data) => {
        if (data.code === "success") {
          toast.success(data.message);
        }
        if (data.code === "error") {
          toast.error(data.message);
          navigate("/accounts/login");
        }
      });
  }, [navigate]);

  const [otpValue, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (otpValue.trim().length !== 6) {
      setError("Please enter all 6 digits!");
      return;
    }
    const finalData = { otp: otpValue };
    if (verifyType === "forgot-password") {
      accountService.verifyForgotPassword(finalData as any)
        .then((data) => {
          if (data.code === "success") {
            toast.success(data.message);
            const email = params.get("email");
            navigate(`/accounts/reset-password?email=${email}`);
          }
          if (data.code === "error") {
            toast.error(data.message);
            navigate("/accounts/forgot-password");
          }
          if (data.code === "otp error") {
            toast.error(data.message);
          }
        });
    } else {
      accountService.verifyRegister(finalData as any)
        .then((data) => {
          if (data.code === "success") {
            toast.success(data.message);
            navigate("/accounts/login");
          }
          if (data.code === "error") {
            toast.error(data.message);
            navigate("/accounts/register");
          }
          if (data.code === "otp error") {
            toast.error(data.message);
          }
        });
    }
  };

  return (
    <div className="flex justify-center px-4 min-h-[calc(100vh-140px)] items-center py-4 transition-colors duration-300">
      <form
        id="registerVerify"
        className="w-full max-w-md bg-card p-6 sm:p-7 rounded-2xl shadow-gold-glow border border-border"
      >
        {/* Header section with Shield Check icon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2 border border-accent/20">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <h1 className="font-heading font-bold text-xl text-foreground mb-1">
            Verify OTP
          </h1>
          <p className="text-muted-foreground text-xs">
            Please enter the OTP code to continue
          </p>
        </div>

        {/* OTP inputs container */}
        <div className="flex flex-col items-center space-y-3 mb-4">
          <div className="w-full flex justify-center py-1">
            <OTPForm
              className="flex scale-110 origin-center"
              onChange={(val) => {
                setOtp(val);
              }}
            />
          </div>
          {error && <div className="text-destructive text-xs font-medium">{error}</div>}
        </div>

        {/* Form controls with verification button */}
        <div className="space-y-3">
          <button
            className="w-full cursor-pointer bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
            type="submit"
            onClick={handleSubmit}
          >
            <CheckCircle className="w-4 h-4" />
            Verify OTP
          </button>

          {/* Registration navigation option */}
          <div className="text-center pt-1">
            <span className="text-xs text-muted-foreground">Back to registration?</span>
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

export default AccountVerify;
