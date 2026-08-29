import React, { useState, useEffect, useRef } from "react";
import { Gavel, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { optimizeImageUrl } from "@/utils/image";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: string;
  showFallbackText?: boolean;
  maxRetries?: number;
  autoOptimize?: boolean;
  optimizeWidth?: number;
}

function resolveSourceUrl(rawSrc?: string, autoOpt = true, width = 600): string | undefined {
  if (!rawSrc) return undefined;
  return autoOpt ? optimizeImageUrl(rawSrc, width) : rawSrc;
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
  decoding = "async",
  referrerPolicy = "no-referrer",
  maxRetries = 1,
  autoOptimize = true,
  optimizeWidth = 600,
  onLoad,
  onError,
  ...props
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(() => (!src ? "error" : "loading"));
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(() => resolveSourceUrl(src, autoOptimize, optimizeWidth));
  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!src) {
      setStatus("error");
      setCurrentSrc(undefined);
      setRetryCount(0);
    } else {
      const resolved = resolveSourceUrl(src, autoOptimize, optimizeWidth);
      setCurrentSrc(resolved);
      setRetryCount(0);

      // Check if image is already cached / completed
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        setStatus("loaded");
      } else {
        setStatus("loading");
        // Watchdog timer: on weak devices or delayed events, reveal image after 3.5s
        timeoutRef.current = setTimeout(() => {
          setStatus((prev) => (prev === "loading" ? "loaded" : prev));
        }, 3500);
      }
    }

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, autoOptimize, optimizeWidth]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus("loaded");
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // 1. Attempt Auto-Retry with backoff if retries remain and src exists
    if (src && retryCount < maxRetries) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);

      retryTimerRef.current = setTimeout(() => {
        const baseSrc = resolveSourceUrl(src, autoOptimize, optimizeWidth) || src;
        const separator = baseSrc.includes("?") ? "&" : "?";
        setCurrentSrc(`${baseSrc}${separator}_retry=${nextRetry}`);
        setStatus("loading");
      }, 1000);
      return;
    }

    // 2. Attempt fallbackSrc if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus("loading");
      return;
    }

    // 3. Mark final error and notify parent
    setStatus("error");
    onError?.(e);
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
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          referrerPolicy={referrerPolicy}
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
