import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import Loading from "@/components/common/Loading";
import { toast } from "sonner";
import { profileService } from "@/services/profile.service.ts";
import { userService } from "@/services/user.service.ts";

interface UserToRate {
  username: string;
  full_name: string;
  rating: number;
  rating_count: number;
}

export default function RateUserPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [userToRate, setUserToRate] = useState<UserToRate | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const username = params.username_id?.trim().split("_")[0];
    const user_id = params.username_id?.trim().split("_")[1];

    if (!username || !user_id) {
      navigate("/");
      return;
    }

    profileService.getProfileDetail({ username, user_id })
      .then((data) => {
        setUserToRate(data.data);
      })
      .catch((error) => {
        console.error("Can't connect to backend:", error);
        navigate("/");
      });
  }, [params, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (score === null) {
      setError("Please select a rating (Positive or Negative)");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter your comments");
      return;
    }

    setIsSubmitting(true);

    try {
      const user_id = params.username_id?.trim().split("_")[1];
      if (!user_id) {
        navigate("/");
        return;
      }
      
      await userService.rateUser({
        user_id: parseInt(user_id),
        score,
        comment: comment.trim(),
      });

      navigate(-1);
    } catch {
      setError("Failed to submit rating. Please try again.");
      toast.error("Failed to submit rating. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!userToRate) return <Loading />;

  return (
    <div className="min-h-screen py-6 px-4 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mb-1">
            Rate User
          </h1>
          <p className="text-xs text-muted-foreground">Share your experience</p>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-5 transition-colors duration-300">
          <div className="flex items-center space-x-4 mb-4">
            {/* Avatar container */}
            <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-md font-bold text-2xl shrink-0 border border-border">
              {userToRate.full_name?.charAt(0).toUpperCase()}
            </div>

            {/* Profile User details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{userToRate.full_name}</h2>
              <p className="text-xs text-muted-foreground">@{userToRate.username}</p>

              <div className="flex items-center bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20 inline-flex mt-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                <span className="font-bold text-yellow-500 text-xs mr-1">
                  {userToRate.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-yellow-500/80">
                  ({userToRate.rating_count} ratings)
                </span>
              </div>
            </div>
          </div>

          {/* Average Rating Stars display */}
          <div className="flex items-center justify-center space-x-1 py-3 border-t border-border mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.floor(userToRate.rating)
                    ? "text-yellow-500 fill-current"
                    : star - 0.5 <= userToRate.rating
                    ? "text-yellow-500 fill-current opacity-50"
                    : "text-muted/40"
                }`}
              />
            ))}
            <span className="ml-2.5 text-foreground font-semibold text-sm">
              {userToRate.rating.toFixed(1)} / 5.0
            </span>
          </div>
        </div>

        {/* Rating Submission Form */}
        <div className="bg-card rounded-2xl border border-border p-6 transition-colors duration-300">
          <h3 className="text-lg font-bold text-foreground mb-4">Your Rating</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Experience rating thumbs */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Rate Experience *
              </label>
              <div className="flex gap-4 justify-center">
                {/* Thumbs Down Button */}
                <button
                  type="button"
                  onClick={() => setScore(-1)}
                  className={`flex flex-col items-center justify-center w-28 py-3.5 rounded-xl border transition-all cursor-pointer ${
                    score === -1
                      ? "border-destructive bg-destructive/10 text-destructive font-bold"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-destructive/30"
                  }`}
                >
                  <ThumbsDown className="w-8 h-8 mb-1 shrink-0" />
                  <span className="text-xs">Negative</span>
                </button>

                {/* Thumbs Up Button */}
                <button
                  type="button"
                  onClick={() => setScore(1)}
                  className={`flex flex-col items-center justify-center w-28 py-3.5 rounded-xl border transition-all cursor-pointer ${
                    score === 1
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold"
                      : "border-border bg-muted/20 text-muted-foreground hover:border-emerald-500/30"
                  }`}
                >
                  <ThumbsUp className="w-8 h-8 mb-1 shrink-0" />
                  <span className="text-xs">Positive</span>
                </button>
              </div>
            </div>

            {/* Comments Field */}
            <div>
              <label htmlFor="comment" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Your Comments *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this user..."
                className="w-full px-3.5 py-2.5 border border-border bg-muted/30 text-foreground rounded-xl outline-none focus:border-accent resize-none text-sm"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-[10px] text-muted-foreground mt-0.5">
                {comment.length}/500 characters
              </div>
            </div>

            {/* Submission Error messages */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3.5 py-2 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Form control triggers */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 border cursor-pointer border-border rounded-xl font-semibold text-xs text-foreground bg-muted/20 hover:bg-muted transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-xl font-semibold text-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center"
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Submit Rating
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
