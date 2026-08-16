import React from 'react';
import { Gavel } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showImage?: boolean;
  image?: string;
  variant?: 'fullscreen' | 'inline';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  size = 'md',
  showImage = true,
  image,
  variant = 'fullscreen',
  className = '',
}) => {
  const sizeConfig = {
    sm: {
      container: 'p-4',
      badge: 'w-12 h-12',
      icon: 'w-5 h-5',
      haloSize: 'w-16 h-16',
      fontSize: 'text-xs tracking-wider',
    },
    md: {
      container: 'p-6 sm:p-8',
      badge: 'w-16 h-16',
      icon: 'w-7 h-7',
      haloSize: 'w-22 h-22',
      fontSize: 'text-sm tracking-widest',
    },
    lg: {
      container: 'p-8 sm:p-10',
      badge: 'w-20 h-20',
      icon: 'w-9 h-9',
      haloSize: 'w-28 h-28',
      fontSize: 'text-base tracking-[0.2em]',
    },
  };

  const current = sizeConfig[size];

  const content = (
    <div
      className={cn(
        current.container,
        "relative rounded-3xl bg-card/60 backdrop-blur-xl border border-border/80 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.3),0_0_25px_rgba(212,175,55,0.1)] flex flex-col items-center justify-center transition-all duration-300",
        variant === 'fullscreen' ? 'max-w-md mx-4' : 'w-auto'
      )}
    >
      {/* Ambient background glow inside card */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-primary/20 rounded-full blur-2xl" />
      </div>

      {showImage && (
        <div className="relative flex items-center justify-center my-2">
          {/* Outer dual-ring spinning halo */}
          <div
            className={cn(
              "absolute rounded-full border border-dashed border-accent/60 animate-[spin_6s_linear_infinite] pointer-events-none",
              current.haloSize
            )}
          />
          <div
            className={cn(
              "absolute rounded-full border border-accent/20 animate-[spin_9s_linear_infinite_reverse] pointer-events-none scale-110",
              current.haloSize
            )}
          />

          {/* Breathing Pulsing Aura */}
          <div className="absolute inset-0 rounded-full bg-accent/15 animate-ping opacity-70" />

          {/* Central Luxury Badge */}
          {image ? (
            <div
              className={cn(
                current.badge,
                "p-1.5 rounded-full overflow-hidden border border-accent/40 bg-card/90 shadow-gold-glow relative z-10 flex items-center justify-center"
              )}
            >
              <img
                src={image}
                alt="Loading"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          ) : (
            <div
              className={cn(
                current.badge,
                "rounded-full bg-gradient-to-br from-accent/25 via-background/90 to-accent/10 border border-accent/50 flex items-center justify-center shadow-gold-glow relative z-10"
              )}
            >
              <Gavel
                className={cn(
                  current.icon,
                  "text-accent animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Luxury Loading Typography */}
      {message && (
        <div className="mt-4 flex flex-col items-center text-center relative z-10">
          <span
            className={cn(
              current.fontSize,
              "font-heading font-bold text-foreground/90 uppercase animate-pulse drop-shadow-sm"
            )}
          >
            {message}
          </span>
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full mt-2 opacity-75" />
        </div>
      )}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={cn("w-full py-8 flex items-center justify-center", className)}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 mt-16 lg:mt-20 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300",
        className
      )}
    >
      {content}
    </div>
  );
};

export default Loading;