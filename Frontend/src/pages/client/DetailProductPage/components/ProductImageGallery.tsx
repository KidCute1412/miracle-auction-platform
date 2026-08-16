import React, { useState } from "react";
import { Eye, FileText } from "lucide-react";
import AddToLove from "@/components/common/AddToLove";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  product_id?: number;
  product_name?: string;
  product_images?: string[];
  onOpenImageModal: (index: number) => void;
}

export default function ProductImageGallery({
  product_id,
  product_name,
  product_images,
  onOpenImageModal,
}: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: y * -14,
      rotateY: x * 14,
      sheenX: (x + 0.5) * 100,
      sheenY: (y + 0.5) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 });
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full min-w-0">
      {/* Main Image Container with 3D Gyroscope Perspective */}
      <div 
        className="perspective-[1000px] relative w-full min-w-0 rounded-2xl border border-border/80 bg-card overflow-hidden group shadow-gold-glow cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onOpenImageModal(currentImageIndex)}
      >
        {/* Full-width Holographic Laser Scanner Beam on Mount */}
        <div className="absolute inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 via-yellow-300 to-transparent shadow-[0_0_20px_#F59E0B,0_0_35px_rgba(245,158,11,0.8)] pointer-events-none animate-laser-scan z-30" />

        {product_images && product_images.length > 0 ? (
          <div
            className="w-full flex items-center justify-center relative transition-transform duration-200 ease-out transform-gpu"
            style={{
              transform: isHovered
                ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1.03)`
                : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            }}
          >
            <img
              key={currentImageIndex}
              src={product_images[currentImageIndex]}
              alt={product_name}
              loading="lazy"
              className="w-full h-[280px] xs:h-[340px] sm:h-[420px] md:h-[480px] lg:h-[500px] object-contain mx-auto bg-card transition-all duration-500 animate-in fade-in zoom-in-95 duration-300 select-none"
            />

            {/* Dynamic Specular Lens Sheen Spotlight */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)`,
              }}
            />
          </div>
        ) : (
          <div className="w-full h-[280px] sm:h-[420px] md:h-[500px] bg-muted rounded-2xl flex items-center justify-center">
            <FileText className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Floating Add to Favorites button */}
        <div 
          className="absolute top-3 right-14 sm:top-4 sm:right-18 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <AddToLove
            product_id={product_id || 0}
            className="static top-auto right-auto h-8 sm:h-10 px-2.5 sm:px-3 text-xs sm:text-sm"
          />
        </div>
        
        {/* Fullsize Preview trigger */}
        <div
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm z-20 active:scale-90"
          onClick={(e) => {
            e.stopPropagation();
            onOpenImageModal(currentImageIndex);
          }}
          title="View full size image"
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>

      {/* Related Thumbnails */}
      {product_images && product_images.length > 1 && (
        <div className="w-full">
          <div className="flex overflow-x-auto justify-start sm:justify-center items-center gap-2 sm:gap-3 pb-2 pt-1 scrollbar-hide">
            {product_images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleImageClick(index)}
                className={cn(
                  "w-16 h-14 sm:w-24 sm:h-18 md:w-28 md:h-20 rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer active:scale-95 flex-shrink-0 relative group/thumb",
                  index === currentImageIndex
                    ? "border-accent ring-2 ring-accent/30 scale-105"
                    : "border-border hover:border-accent/40 opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
