import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Trash2, Eye, ImageIcon } from "lucide-react";

interface UploadImageProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxFiles?: number;
}

export default function UploadImage({
  images,
  onImagesChange,
  maxFiles = 10,
}: UploadImageProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (images.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews: string[] = [];
    let loadedCount = 0;

    images.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews[index] = e.target.result as string;
          loadedCount++;

          if (loadedCount === images.length) {
            setPreviews([...newPreviews]);
          }
        }
      };
      reader.onerror = () => {
        console.error(`Error reading file: ${file.name}`);
        loadedCount++;
        if (loadedCount === images.length) {
          setPreviews([...newPreviews.filter((p) => p)]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && imageModalOpen) {
        setImageModalOpen(false);
      }
    };

    if (imageModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [imageModalOpen]);

  useEffect(() => {
    const currentPreviews = previews;
    return () => {
      currentPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = maxFiles - images.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      onImagesChange([...images, ...filesToAdd]);
    },
    [images, onImagesChange, maxFiles]
  );

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      },
      maxFiles: maxFiles - images.length,
      disabled: images.length >= maxFiles,
    });

  return (
    <div className="w-full">
      {/* Dropzone container */}
      <div
        {...getRootProps()}
        className={`
          relative p-6 border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-300 ease-in-out
          ${
            isDragActive && !isDragReject
              ? "border-accent bg-accent/5 scale-[1.01] shadow-gold-glow"
              : isDragReject
              ? "border-destructive bg-destructive/5"
              : images.length >= maxFiles
              ? "border-border bg-muted/20 cursor-not-allowed opacity-80"
              : "border-border hover:border-accent/40 hover:bg-muted/20"
          }
        `}
      >
        <input {...getInputProps()} />

        {(images.length === 0 || isDragActive) && (
          <div className="text-center py-8">
            <div
              className={`
              w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 mb-4
              ${
                isDragActive && !isDragReject
                  ? "bg-accent text-primary-foreground"
                  : isDragReject
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              }
            `}
            >
              {isDragReject ? <X className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>

            <div>
              {isDragActive && !isDragReject ? (
                <p className="text-accent font-semibold font-heading">
                  Drop images here!
                </p>
              ) : isDragReject ? (
                <p className="text-destructive font-semibold font-heading">
                  Only image files are accepted!
                </p>
              ) : images.length >= maxFiles ? (
                <p className="text-muted-foreground font-heading">
                  Limit of {maxFiles} images reached
                </p>
              ) : (
                <>
                  <p className="text-foreground font-semibold font-heading mb-2">
                    Drag and drop images here, or{" "}
                    <span className="text-accent">click to browse</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: JPG, PNG, GIF, WEBP (Max {maxFiles} files)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {images.length > 0 && !isDragActive && (
          <div className="space-y-4">
            {/* Grid Header Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <ImageIcon className="w-4 h-4 mr-2 text-accent" />
                <span className="font-semibold text-foreground">{images.length}</span>
                <span className="mx-1">/</span>
                <span>{maxFiles} images</span>
                <span className="ml-2 text-xs opacity-60">• Click to add more</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete all ${images.length} images?`)) {
                    onImagesChange([]);
                  }
                }}
                className="flex items-center cursor-pointer hover:scale-105 space-x-1 px-3 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-xs font-semibold transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative group select-none">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted/40 cursor-pointer relative">
                    {previews[index] ? (
                      <>
                        <img
                          src={previews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(previews[index]);
                            setImageModalOpen(true);
                          }}
                        />

                        {/* Interactive overlays */}
                        <div className="absolute top-1.5 right-1.5 flex flex-col space-y-1.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedImage(previews[index]);
                              setImageModalOpen(true);
                            }}
                            className="p-1.5 bg-background/80 hover:bg-background text-foreground cursor-pointer rounded-full shadow-sm hover:scale-105 transition-transform duration-200 md:opacity-0 md:group-hover:opacity-100"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (window.confirm("Delete this image?")) {
                                removeImage(index);
                              }
                            }}
                            className="p-1.5 bg-destructive hover:bg-destructive/90 text-white cursor-pointer rounded-full shadow-sm hover:scale-105 transition-transform duration-200 md:opacity-0 md:group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                      </div>
                    )}

                    {/* Numeric tags */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="bg-accent text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {index + 1}
                      </span>
                    </div>

                    {index === 0 && (
                      <div className="absolute bottom-1.5 left-1.5">
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Main
                        </span>
                      </div>
                    )}
                  </div>

                  <p
                    className="mt-1 text-xs text-muted-foreground truncate text-center"
                    title={images[index]?.name}
                  >
                    {images[index]?.name}
                  </p>
                </div>
              ))}

              {/* Add items slot */}
              {images.length < maxFiles && (
                <div className="aspect-square rounded-lg border border-dashed border-border bg-muted/10 hover:border-accent/40 hover:bg-muted/30 cursor-pointer transition-all duration-200 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-medium text-muted-foreground">Add image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Popover Preview Overlay */}
      {imageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-full bg-card rounded-2xl border border-border shadow-gold-glow overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <h3 className="text-lg font-heading font-semibold text-foreground flex items-center">
                <Eye className="w-5 h-5 mr-2 text-accent" />
                Image Preview
              </h3>
              <button
                onClick={() => setImageModalOpen(false)}
                className="p-1.5 bg-transparent hover:bg-muted text-foreground cursor-pointer rounded-full transition-colors duration-200"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Popover Content */}
            <div className="p-6 bg-background/30">
              <div className="relative bg-card rounded-lg p-2 border border-border shadow-sm">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-[65vh] object-contain mx-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
