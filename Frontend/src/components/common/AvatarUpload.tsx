import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import UserAvatar from "./UserAvatar";

export interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  name?: string;
  onFileSelect: (file: File) => void;
  size?: "md" | "lg" | "xl" | number;
  disabled?: boolean;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  name = "",
  onFileSelect,
  size = "xl",
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`relative inline-block ${className}`}>
      <UserAvatar src={displayUrl} name={name} size={size} />

      {!disabled && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-accent hover:bg-accent/90 text-white p-2 rounded-full shadow-md transition-all cursor-pointer hover:scale-105 border border-background"
          title="Change Avatar"
        >
          <Camera size={14} />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default AvatarUpload;
