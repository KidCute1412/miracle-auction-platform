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

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4 min-w-0">
      {/* Main Image */}
      <div className="flex justify-center relative min-w-0 rounded-2xl border border-border bg-card overflow-hidden group shadow-gold-glow">
        {product_images && product_images.length > 0 ? (
          <>
            <img
              key={currentImageIndex}
              src={product_images[currentImageIndex]}
              alt={product_name}
              loading="lazy"
              className="w-full h-[500px] object-contain bg-card cursor-pointer transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:brightness-105 animate-in fade-in duration-350"
              onClick={() => onOpenImageModal(currentImageIndex)}
            />
            {/* Metallic shine reflection sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-[shine_1.8s_ease-in-out_infinite] pointer-events-none"></div>
          </>
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
          onClick={() => onOpenImageModal(currentImageIndex)}
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
