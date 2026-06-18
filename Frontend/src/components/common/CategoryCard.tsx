import Cristiano from "@/assets/images/cristiano.jpg";
import { cn } from "@/lib/utils";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

interface CategoryCardProps {
  name?: string;
  image?: string;
  onClick?: () => void;
  className?: string;
}

function CategoryCard({ name = "Cristiano", image, onClick, className }: CategoryCardProps) {
  const displayImage = image || Cristiano;
  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={cn(
        "group relative w-[380px] h-[450px] cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-card/45 border border-border/80",
        "hover:border-accent/50 hover:-translate-y-2 hover:shadow-[0_20px_45px_-15px_oklch(0.78_0.09_75_/_18%),_0_0_30px_oklch(0.78_0.09_75_/_10%)]",
        hasIntersected ? "animate__animated animate__fadeInUp" : "opacity-0",
        className
      )}
      onClick={onClick}
    >
      {/* Luxury Dual Glow Backdrops */}
      <div className="absolute inset-0 opacity-25 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-b from-accent/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-t from-primary/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
      </div>

      {/* Gold Inner Glow Border overlay */}
      <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/40 rounded-3xl transition-colors duration-500 pointer-events-none z-10"></div>

      {/* Image container */}
      <div className="relative h-[72%] overflow-hidden rounded-t-3xl border-b border-border/60">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:brightness-105 group-hover:saturate-[1.15]"
          loading="lazy"
        />

        {/* Action Button & Rotating Halo */}
        <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 relative">
            {/* Spinning Gold Halo */}
            <div className="absolute -inset-1.5 rounded-full border border-dashed border-accent/70 opacity-0 group-hover:opacity-100 group-hover:animate-[spin_8s_linear_infinite] transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative w-12 h-12 rounded-full bg-background/40 border border-accent/50 flex items-center justify-center hover:bg-background/70 hover:scale-105 transition-all">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="relative h-[28%] flex flex-col justify-center items-center p-6 text-center bg-card/5">
        {/* Accent line with width expansion */}
        <div className="w-6 h-0.5 bg-accent rounded-full mb-3.5 opacity-65 group-hover:w-16 group-hover:opacity-100 transition-all duration-500 ease-out"></div>

        {/* Category name with Liquid Gold text shimmer */}
        <h3 className="font-heading text-xl font-extrabold text-foreground tracking-wide group-hover:animate-text-shimmer transition-all duration-500 leading-tight">
          {name}
        </h3>

        {/* Subtitle with character tracking spread */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2.5 opacity-0 group-hover:opacity-100 group-hover:tracking-[0.25em] transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          Explore Now
        </p>
      </div>
    </div>
  );
}

export default CategoryCard;
