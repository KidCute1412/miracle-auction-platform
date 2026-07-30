
import { useNavigate } from "react-router-dom";
import JustValidate from "just-validate";
import { useEffect } from "react";
import { toast } from "sonner";
import { Key, Mail, Send } from "lucide-react";
import { accountService } from "@/services/account.service.ts";

function ForgotPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    const validate = new JustValidate("#forgotPasswordForm");

    // Add validation rules for email input
    validate
      .addField(
        "#email",
        [
          { rule: "required", errorMessage: "Please enter your email!" },
          { rule: "email", errorMessage: "Invalid email format" },
        ],
        { errorContainer: "#emailError" }
      )
      .onSuccess((event: any) => {
        const email = event.target.email.value;
        const dataFinal = { email: email };

        accountService.forgotPassword(dataFinal)
          .then((data) => {
            if (data.code === "error") {
              toast.error(data.message);
            }
            if (data.code === "success") {
              navigate(`/accounts/verify?email=${email}&type=forgot-password`);
            }
            if (data.code === "existedOTP") {
              navigate(`/accounts/verify?email=${email}&type=forgot-password`);
            }
          });
      });
  }, [navigate]);

  return (
    <div className="flex justify-center px-4 min-h-[calc(100vh-140px)] items-center py-4 transition-colors duration-300">
      <form
        id="forgotPasswordForm"
        className="w-full max-w-md bg-card p-6 sm:p-7 rounded-2xl shadow-gold-glow border border-border"
      >
        {/* Header section with Key icon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2 border border-accent/20">
            <Key className="w-5 h-5 text-accent" />
          </div>
          <h1 className="font-heading font-bold text-xl text-foreground mb-1">
            Forgot Password
          </h1>
          <p className="text-muted-foreground text-xs">
            Enter your email to receive a verification OTP code
          </p>
        </div>

        {/* Inputs stack */}
        <div className="space-y-3.5">
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="text"
                placeholder="your@email.com"
                className="w-full px-3.5 py-2 pl-10 bg-muted/30 border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/30 text-foreground transition-all duration-200 text-sm outline-none"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div id="emailError" className="text-xs text-destructive mt-0.5 font-medium"></div>
          </div>

          {/* Action button */}
          <div className="pt-1">
            <button
              className="w-full cursor-pointer bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
              type="submit"
            >
              <Send className="w-4 h-4" />
              Send Code
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

export default ForgotPassword;
