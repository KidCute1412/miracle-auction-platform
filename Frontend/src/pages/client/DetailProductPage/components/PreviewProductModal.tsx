import { useState } from "react";
import { Eye, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PreviewImage({ images, name, modalImageIndex, setModalImageIndex, setImageModalOpen }: { images: string[]; name: string; modalImageIndex: number; setModalImageIndex: any; setImageModalOpen: (isOpen: boolean) => void }) {
  const [oldImageIndex, setOldImageIndex] = useState<number | null>(null);
  const [oldImageAnimation, setOldImageAnimation] = useState("");
  const [newImageAnimation, setNewImageAnimation] = useState("");
  
  const animateTransition = (newIndex: number, direction: "left" | "right") => {
    setOldImageIndex(modalImageIndex);
    setOldImageAnimation(direction === "right" ? "animate__animated animate__fadeOutLeft animate__faster" : "animate__animated animate__fadeOutRight animate__faster");
    setNewImageAnimation(direction === "right" ? "animate__animated animate__fadeInRight animate__faster" : "animate__animated animate__fadeInLeft animate__faster");
    setModalImageIndex(newIndex);
    
    setTimeout(() => {
      setOldImageIndex(null);
      setOldImageAnimation("");
      setNewImageAnimation("");
    }, 600);
  };
  
  const nextImage = () => {
    if (images) {
      const newIndex = (modalImageIndex + 1) % images.length;
      animateTransition(newIndex, "right");
    }
  };

  const prevImage = () => {
    if (images) {
      const newIndex = (modalImageIndex - 1 + images.length) % images.length;
      animateTransition(newIndex, "left");
    }
  };
  
  const handleThumbnailClick = (index: number) => {
    if (index === modalImageIndex) return;
    const direction = index > modalImageIndex ? "right" : "left";
    animateTransition(index, direction);
  };

  return (
    <>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm" onClick={() => setImageModalOpen(false)}>
        <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden animate__animated animate__zoomIn" onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-black/40 text-white border-b border-white/10 flex-shrink-0">
            <h3 className="text-lg font-semibold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-accent" />
              {name} ({modalImageIndex + 1}/{images.length})
            </h3>
            <button
              onClick={() => setImageModalOpen(false)}
              className="p-2 hover:bg-red-500/20 rounded-full transition-all duration-200"
              title="Close"
            >
              <X className="w-5 h-5 text-red-500 cursor-pointer" />
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="relative bg-black/20 flex-1 min-h-0 flex flex-col">
            <div className="relative p-4 flex-1 min-h-0 flex items-center justify-center bg-muted/20">
              {oldImageIndex !== null && (
                <img
                  key={`old-${oldImageIndex}`}
                  src={images[oldImageIndex]}
                  alt={`${name} - Image ${oldImageIndex + 1}`}
                  className={`absolute w-full h-full max-w-full max-h-full object-contain rounded-lg shadow-lg ${oldImageAnimation}`}
                />
              )}
              <img
                key={`current-${modalImageIndex}`}
                src={images[modalImageIndex]}
                alt={`${name} - Image ${modalImageIndex + 1}`}
                className={`w-full h-full max-w-full max-h-full object-contain rounded-lg shadow-lg ${newImageAnimation}`}
              />
              
              {/* Navigation Arrows */}
              {images && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute cursor-pointer left-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 backdrop-blur-sm z-10"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 backdrop-blur-sm z-10"
                    title="Next Image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {images && (
              <div className="p-3 bg-black/40 border-t border-white/10 flex justify-center items-center flex-shrink-0">
                <div className="flex flex-wrap justify-center gap-2 py-1 max-w-full">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-14 h-14 object-cover rounded cursor-pointer transition-all duration-200 flex-shrink-0 ${
                        index === modalImageIndex 
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-black" 
                          : "opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}