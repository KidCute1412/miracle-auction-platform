import React, { useState, useEffect } from "react";
import { Gavel, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: string;
  showFallbackText?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = "Product image",
  fallbackSrc,
  className = "",
  containerClassName = "",
  aspectRatio,
  showFallbackText = false,
  loading = "lazy",
  onLoad,
  onError,
  ...props
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(() => (!src ? "error" : "loading"));
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  useEffect(() => {
    if (!src) {
      setStatus("error");
      setCurrentSrc(undefined);
    } else {
      setStatus("loading");
      setCurrentSrc(src);
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setStatus("loaded");
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus("loading");
    } else {
      setStatus("error");
      onError?.(e);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full h-full flex items-center justify-center bg-card/20",
        containerClassName
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton Shimmer while loading */}
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/40 animate-pulse overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-accent/10 to-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.12) 50%, transparent 100%)",
            }}
          />
          <div className="w-8 h-8 rounded-full border border-accent/20 flex items-center justify-center opacity-40">
            <Gavel className="w-4 h-4 text-accent animate-pulse" />
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {status === "error" ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center bg-card/40 border border-border/50 select-none">
          <div className="w-10 h-10 rounded-2xl bg-background/60 border border-accent/20 flex items-center justify-center shadow-sm mb-2">
            <ImageOff className="w-5 h-5 text-muted-foreground/60" />
          </div>
          {showFallbackText && (
            <span className="text-xs font-heading text-muted-foreground/70 line-clamp-1">
              {alt || "No image available"}
            </span>
          )}
        </div>
      ) : (
        /* Image Element */
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 ease-out",
            status === "loading"
              ? "opacity-0 scale-[1.03] blur-sm"
              : "opacity-100 scale-100 blur-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default SafeImage;
