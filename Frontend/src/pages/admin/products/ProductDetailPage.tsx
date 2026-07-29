import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatToVN } from "@/utils/format_time";
import { productService } from "@/services/product.service";
import Loading from "@/components/common/Loading";
import {
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Tag,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProductDetail = {
  product_id: number;
  product_name: string;
  is_removed: boolean;
  seller_id: string;
  seller_name?: string;
  step_price: number;
  start_price: number;
  current_price: number;
  start_time: string;
  end_time: string;
  product_images: string;
  description: string;
  created_at: string;
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    // Fetch product details
    productService
      .adminDetail(Number(id))
      .then((data) => {
        if (data.code === "success") {
          setProduct(data.product);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleToggleRemove = async () => {
    if (!product) return;
    try {
      if (product.is_removed) {
        const res = await productService.adminRestore(product.product_id);
        if (res.code === "success") {
          toast.success("Product restored successfully");
          setProduct({ ...product, is_removed: false });
        } else {
          toast.error(res.message || "Failed to restore product");
        }
      } else {
        const res = await productService.adminDelete(product.product_id);
        if (res.code === "success") {
          toast.success("Product removed successfully");
          setProduct({ ...product, is_removed: true });
        } else {
          toast.error(res.message || "Failed to remove product");
        }
      }
    } catch {
      toast.error("An error occurred while updating product status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading className="bg-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-foreground max-w-4xl mx-auto mt-10">
        <div className="text-center bg-card border border-destructive/20 rounded-2xl p-12 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Product Not Found</h3>
          <p className="text-sm text-muted-foreground mb-6">The product you are trying to view does not exist or has been deleted.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  let productImages: string[] = [];
  if (product.product_images) {
    if (Array.isArray(product.product_images)) {
      productImages = product.product_images;
    } else if (typeof product.product_images === "string") {
      try {
        const parsed = JSON.parse(product.product_images);
        productImages = Array.isArray(parsed) ? parsed : [product.product_images];
      } catch {
        productImages = product.product_images.split(",").filter((img) => img.trim());
      }
    }
  }

  // Calculate elapsed progress percent
  const now = new Date();
  const start = new Date(product.start_time);
  const end = new Date(product.end_time);
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  let progressPercent = 0;
  if (totalDuration > 0) {
    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  // Determine active status of auction
  let auctionStatus = "Active";
  let statusColorClass = "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30";
  if (now < start) {
    auctionStatus = "Upcoming";
    statusColorClass = "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30";
  } else if (now > end) {
    auctionStatus = "Ended";
    statusColorClass = "from-zinc-500/20 to-slate-500/20 text-zinc-400 border-zinc-500/30";
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-md border border-border p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer p-3 hover:bg-muted rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{product.product_name}</h2>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border bg-gradient-to-r", statusColorClass)}>
                {auctionStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Product ID: {product.product_id}</p>
          </div>
        </div>

        {/* Administration Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleToggleRemove}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95 shadow-sm",
              product.is_removed
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-500"
                : "bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive"
            )}
          >
            {product.is_removed ? (
              <>
                <RefreshCw className="w-4 h-4" /> Restore Product
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" /> Remove Product
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Viewer and Pricing */}
        <div className="lg:col-span-5 space-y-6">
          {/* Product Gallery Images display */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-accent" />
                <span>Product Images</span>
              </label>

              <div className="border border-border/60 rounded-xl bg-muted/5 p-3">
                {productImages.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {/* Large Main Display Image */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-border bg-muted/10 group shadow-inner flex-shrink-0 flex items-center justify-center">
                      <img
                        key={activeImageIndex}
                        src={productImages[activeImageIndex].trim()}
                        alt={`${product.product_name} - Main`}
                        className="w-full h-full object-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                      />
                    </div>

                    {/* Thumbnails Row */}
                    <div className="flex flex-wrap gap-2.5 pr-1 max-h-32 overflow-y-auto">
                      {productImages.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 relative group",
                            index === activeImageIndex
                              ? "border-accent ring-2 ring-accent/30 scale-95"
                              : "border-border/60 hover:border-accent/40 opacity-70 hover:opacity-100"
                          )}
                        >
                          <img
                            src={img.trim()}
                            alt={`${product.product_name} - Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <ImageIcon className="w-12 h-12 opacity-30" />
                    <span className="text-xs font-medium">No images available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Info Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-accent" />
              <span>Pricing details</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Start Price</span>
                <p className="text-sm font-bold text-foreground">{product.start_price.toLocaleString()} VND</p>
              </div>
              <div className="space-y-1 bg-accent/5 p-3 rounded-xl border border-accent/20">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Current Price</span>
                <p className="text-base font-extrabold text-accent">{product.current_price.toLocaleString()} VND</p>
              </div>
              <div className="space-y-1 bg-muted/10 p-3 rounded-xl border border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Step Price</span>
                <p className="text-sm font-bold text-foreground">{product.step_price.toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            {/* Title Section */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Product Title</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">{product.product_name}</h1>
            </div>

            <hr className="border-border/60" />

            {/* Row: Seller & Timeline Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Seller Information</span>
                    <span className="text-sm font-semibold text-foreground block mt-0.5">{product.seller_name || "Unknown"}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Seller ID: {product.seller_id}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Auction Timeline</span>
                    <div className="text-xs space-y-1.5 mt-1.5">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Starts:</span>
                        <span className="font-medium text-foreground">{formatToVN(product.start_time)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Ends:</span>
                        <span className="font-medium text-foreground">{formatToVN(product.end_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Progress Bar indicator */}
            <div className="space-y-2 bg-muted/5 p-4 rounded-xl border border-border/50">
              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Auction Timeline Progress
                </span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Detailed Product Description panel */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Description</span>
              <div className="border border-border/60 rounded-2xl bg-muted/5 p-5 transition-colors">
                <div
                  className={cn(
                    "relative transition-all duration-300 text-sm leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none",
                    !isDescriptionExpanded && "overflow-hidden"
                  )}
                  style={{
                    maxHeight: isDescriptionExpanded ? "none" : "180px",
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
                  {!isDescriptionExpanded && product.description && product.description.length > 300 && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                  )}
                </div>
                {product.description && product.description.length > 300 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-xl transition-all cursor-pointer"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
