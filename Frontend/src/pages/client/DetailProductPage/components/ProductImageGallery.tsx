import { useState } from "react";
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
    <div className="space-y-4 min-w-0">
      {/* Main Image Container with 3D Gyroscope Perspective */}
      <div 
        className="perspective-[1000px] flex justify-center relative min-w-0 rounded-2xl border border-border/80 bg-card overflow-hidden group shadow-gold-glow cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => onOpenImageModal(currentImageIndex)}
      >
        {product_images && product_images.length > 0 ? (
          <div
            className="w-full relative transition-transform duration-200 ease-out transform-gpu"
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
              className="w-full h-[500px] object-contain bg-card transition-all duration-500 animate-in fade-in zoom-in-95 duration-300"
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
          <div className="w-full h-[500px] bg-muted rounded-2xl flex items-center justify-center">
            <FileText className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        
        <div onClick={(e) => e.stopPropagation()}>
          <AddToLove
            product_id={product_id || 0}
            className="w-[100px] right-20 top-5 z-20"
          />
        </div>
        
        <div
          className="absolute top-5 right-5 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm z-20 active:scale-90"
          onClick={(e) => {
            e.stopPropagation();
            onOpenImageModal(currentImageIndex);
          }}
          title="View full size image"
        >
          <Eye className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Related Images */}
      <div className="max-w-[80%] mx-auto">
        <div className="flex overflow-x-auto space-x-3 pb-4 pt-2 scrollbar-hide">
          {product_images?.map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageClick(index)}
              className={cn(
                "w-28 h-20 rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer active:scale-95 flex-shrink-0 relative group/thumb",
                index === currentImageIndex
                  ? "border-accent ring-2 ring-accent/30 scale-102"
                  : "border-border hover:border-accent/40 opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
