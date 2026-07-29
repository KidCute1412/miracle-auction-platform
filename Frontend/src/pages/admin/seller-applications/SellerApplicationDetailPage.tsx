import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatToVN } from "@/utils/format_time";
import Loading from "@/components/common/Loading";
import { userService } from "@/services/user.service";

interface ApplicationInfo {
  full_name: string;
  username: string;
  email: string;
  status: string;
  submitted_date: string;
  description: string;
}

export default function SellerApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [detailForm, setDetailForm] = useState<ApplicationInfo | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Fetch application details by form ID
    userService
      .adminGetApplicationDetail(Number(id))
      .then((data) => {
        if (data.code === "success") {
          const app = data.applicationInfo;
          setDetailForm({
            full_name: app.full_name || "",
            username: app.username || "",
            email: app.email || "",
            status: app.status || "pending",
            submitted_date: formatToVN(app.created_at),
            description: app.reason || "",
          });
          setIsLoading(false);
        } else {
          setHasError(true);
          setIsLoading(false);
          toast.error(data.message || "Error loading application details");
        }
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
        toast.error("Application details do not exist");
      });
  }, [id, navigate]);

  const handleConfirmApplication = (status: string) => {
    // Send request to set application status
    userService
      .adminSetApplicationStatus(Number(id), { status })
      .then((data) => {
        if (data.code === "success") {
          toast.success(data.message);
          setDetailForm((prev) => (prev ? { ...prev, status } : null));
        } else {
          toast.error(data.message || "Error confirming application status");
        }
      })
      .catch(() => {
        toast.error("Error confirming application status");
      });
  };

  if (isLoading) {
    return (
      <Loading className="ml-[240px] bg-transparent"></Loading>
    );
  }

  if (hasError) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-140px)] text-foreground">
        <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm max-w-md">
          <h1 className="text-xl font-bold text-destructive mb-2">
            Application not found
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            This account upgrade application does not exist or has been deleted.
          </p>
          <button
            onClick={() => navigate("/admin/seller/applications")}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 shadow-sm transition-all cursor-pointer"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    detailForm && (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-foreground bg-background">
        <h1 className="text-xl sm:text-2xl font-heading font-bold mb-4 text-foreground">
          Upgrade Application Details
        </h1>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm transition-colors duration-300">
          {/* Summary Application info fields */}
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground mb-2">
              Application Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted date:</span>
                <span className="ml-2 font-medium text-foreground">
                  {detailForm.submitted_date}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    detailForm.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      : detailForm.status === "accepted"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {detailForm.status === "pending"
                    ? "Pending"
                    : detailForm.status === "accepted"
                    ? "Accepted"
                    : "Rejected"}
                </span>
              </div>
            </div>
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={detailForm.full_name}
                readOnly
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm bg-muted/30 text-foreground focus:outline-none cursor-default"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={detailForm.username}
                readOnly
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm bg-muted/30 text-foreground focus:outline-none cursor-default"
              />
            </div>
          </div>

          {/* Email address field */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={detailForm.email}
                readOnly
                className="w-full px-3.5 py-2 border border-border rounded-lg text-sm bg-muted/30 text-foreground focus:outline-none cursor-default"
              />
            </div>
          </div>

          {/* Reason details text area */}
          <div className="mb-6">
            <label className="block mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reason for Upgrade
            </label>
            <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
              <div className="p-4 text-sm text-foreground">
                <div
                  dangerouslySetInnerHTML={{ __html: detailForm.description }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              * This content is view-only and cannot be modified
            </p>
          </div>

          {/* User action button triggers */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {detailForm.status === "pending" && (
              <>
                <button
                  onClick={() => handleConfirmApplication("accepted")}
                  className="cursor-pointer px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm transition-all focus:outline-none"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleConfirmApplication("rejected")}
                  className="cursor-pointer px-6 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm transition-all focus:outline-none"
                >
                  Reject
                </button>
              </>
            )}

            <button
              onClick={() =>
                navigate(
                  `/${import.meta.env.VITE_PATH_ADMIN}/seller/applications`
                )
              }
              className="cursor-pointer px-6 py-2 bg-muted text-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all focus:outline-none"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  );
}
