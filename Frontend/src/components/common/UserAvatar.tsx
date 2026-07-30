import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

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

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = "",
  size = "md",
  className = "",
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

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

  const hasValidImage = src && !imgError;

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
          src={src}
          alt={name || "User avatar"}
          onError={() => setImgError(true)}
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
