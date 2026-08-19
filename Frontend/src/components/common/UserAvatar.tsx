import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { getAvatarUrl } from "@/utils/image";

export interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-28 h-28 text-3xl",
};

const iconSizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 32,
  xl: 48,
};

const pixelSizeMap: Record<string, number> = {
  xs: 48,
  sm: 64,
  md: 96,
  lg: 160,
  xl: 256,
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = "",
  size = "md",
  className = "",
  onClick,
}) => {
  const targetPixelSize = typeof size === "number" ? size * 2 : pixelSizeMap[size] || 96;
  const optimizedSrc = src ? getAvatarUrl(src, targetPixelSize) : undefined;

  const [imgError, setImgError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(optimizedSrc);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setImgError(false);
    setCurrentSrc(optimizedSrc);
    setRetryCount(0);
  }, [optimizedSrc]);

  const handleError = () => {
    if (optimizedSrc && retryCount < 2) {
      const next = retryCount + 1;
      setRetryCount(next);
      setTimeout(() => {
        const sep = optimizedSrc.includes("?") ? "&" : "?";
        setCurrentSrc(`${optimizedSrc}${sep}_retry=${next}`);
      }, 1000);
    } else {
      setImgError(true);
    }
  };

  const getInitials = (str: string) => {
    if (!str) return "";
    const words = str.trim().split(" ").filter(Boolean);
    if (words.length === 0) return "";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const sizeClasses = typeof size === "string" ? sizeMap[size] : "";
  const customStyle = typeof size === "number" ? { width: `${size}px`, height: `${size}px` } : {};
  const iconSize = typeof size === "string" ? iconSizeMap[size] : Math.max(16, Math.round(size * 0.45));

  const hasValidImage = currentSrc && !imgError;

  return (
    <div
      onClick={onClick}
      style={customStyle}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-border shadow-xs select-none transition-all ${sizeClasses} ${className} ${
        onClick ? "cursor-pointer hover:opacity-90" : ""
      }`}
    >
      {hasValidImage ? (
        <img
          src={currentSrc}
          alt={name || "User avatar"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <div className="w-full h-full bg-accent text-accent-foreground font-bold font-heading flex items-center justify-center">
          {initials}
        </div>
      ) : (
        <div className="w-full h-full bg-muted text-muted-foreground flex items-center justify-center">
          <User size={iconSize} />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
