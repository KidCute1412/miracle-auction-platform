import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TinyMCEEditor from "@/components/editor/TinyMCEEditor";
import { Package, DollarSign, Calendar, Tag, Save, ArrowLeft, Check, X } from "lucide-react";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/routes/ProtectedRouter";
import { productService } from "@/services/product.service.ts";

interface ProductDetail {
  product_id: number;
  product_name: string;
  product_images: string[];
  current_price: number;
  start_price: number;
  step_price: number;
  buy_now_price: number;
  start_time: string;
  end_time: string;
  description: string;
  cat2_id: number;
  bid_turns: number;
  auto_extended: boolean;
}

export default function EditProductPage() {
  const { auth } = useAuth();
  const { slugid } = useParams();
  const navigate = useNavigate();
  const [product_id, setProductId] = useState<number | null>(null);
  const [product_slug, setProductSlug] = useState<string>("");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (auth && product) {
      if (auth.user_id === (product as any).seller_id) {
        setIsSeller(true);
      } else {
        navigate(-1);
      }
    }
  }, [auth, product]);

  useEffect(() => {
    if (slugid) {
      const parts = slugid.split("-");
      if (parts.length > 1) {
        const id = Number(parts[parts.length - 1]);
        const slug = parts.slice(0, parts.length - 1).join("-");
        if (product_id !== id) {
          setProductId(id);
        }
        if (product_slug !== slug) {
          setProductSlug(slug);
        }
      }
    }
  }, [slugid]);
   
  const handleEditorChange = (content: string) => {
    setNewDescription(content);
  };
  const editorRef = React.useRef<any>(null);
  
  useEffect(() => {
    if (product_id && product_slug) {
      fetchProductDetail();
    }
  }, [product_id, product_slug]);

  const fetchProductDetail = async () => {
    try {
      const data = await productService.getDetail(product_id!);
      setProduct(data.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load product details");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDescription = async () => {
    if (!newDescription.trim()) {
      toast.error("Please enter the description content");
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date();
      const timestamp = now.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      
      const timestampDiv = `<div style="background: linear-gradient(135deg, rgba(239, 246, 255, 0.1) 0%, rgba(219, 238, 254, 0.1) 100%); padding: 12px 16px; border-radius: 8px; margin: 24px 0 12px; border-left: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);">
          <p style="margin: 0; color: #3b82f6; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">
              <strong style="color: #2563eb;">⏱ Updated at:</strong> ${timestamp}
          </p>
      </div>`;
      
      const updatedDescription = (product?.description || "") + timestampDiv + newDescription;
      
      await productService.updateDescription(product_id!, { description: updatedDescription });

      toast.success("Description updated successfully!");
      setProduct(product ? { ...product, description: updatedDescription } : null);
      setNewDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update description");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !product || !isSeller) {
    return <Loading />;
  }   

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-heading font-extrabold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-2">Update your product description details</p>
        </div>

        {/* Product Images */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            Product Images
          </h3>
          <div className="grid grid-cols-5 gap-4 max-h-[400px] overflow-y-auto p-2">
            {product?.product_images?.map((image, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-border hover:border-accent transition-colors shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Name and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Product Name
            </h3>
            <div className="bg-muted px-4 py-3 rounded-lg border border-border">
              <p className="text-foreground font-semibold text-lg">{product?.product_name}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent" />
              Auction Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
                <span className="text-muted-foreground font-medium">Total Bid Turns:</span>
                <span className="font-bold text-accent text-lg">{product?.bid_turns ?? 0}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/50 px-4 py-2 rounded-lg">
                <span className="text-muted-foreground font-medium">Auto Extended:</span>
                <span className={`font-semibold flex items-center gap-1 ${product?.auto_extended ? "text-emerald-500" : "text-muted-foreground/30"}`}>
                  {product?.auto_extended ? (
                    <>
                      <Check className="w-4 h-4" />
                      Yes
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      No
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price and Time Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              Pricing Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Starting Price
                </label>
                <div className="bg-muted px-4 py-2 rounded-lg border border-border">
                  <p className="text-foreground font-semibold">{product?.start_price?.toLocaleString()} VND</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Current Price
                </label>
                <div className="bg-emerald-500/10 px-4 py-2 rounded-lg border-2 border-emerald-500/30">
                  <p className="text-emerald-500 font-bold text-lg">{product?.current_price?.toLocaleString()} VND</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Step Price
                </label>
                <div className="bg-muted px-4 py-2 rounded-lg border border-border">
                  <p className="text-foreground font-semibold">{product?.step_price?.toLocaleString()} VND</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Buy Now Price
                </label>
                <div className="bg-muted px-4 py-2 rounded-lg border border-border">
                  <p className="text-foreground font-semibold">{product?.buy_now_price?.toLocaleString()} VND</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Auction Timing
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Start Time
                </label>
                <div className="bg-muted px-4 py-2 rounded-lg border border-border">
                  <p className="text-foreground text-sm">{product?.start_time ? new Date(product.start_time).toLocaleString("en-US") : "N/A"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  End Time
                </label>
                <div className="bg-muted px-4 py-2 rounded-lg border border-border">
                  <p className="text-foreground text-sm">{product?.end_time ? new Date(product.end_time).toLocaleString("en-US") : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Description */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Current Description
          </h3>
          <div 
            className="prose max-w-none bg-muted px-4 py-3 rounded-lg border border-border max-h-96 overflow-y-auto text-foreground text-sm"
            dangerouslySetInnerHTML={{ __html: product?.description || "No description yet" }}
          />
        </div>

        {/* Add New Description */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Add New Description
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The new content will be appended to the end of the current description. You cannot modify or delete previous descriptions.
          </p>
          <div className="mb-4">
            <TinyMCEEditor editorRef={editorRef} onEditChange={handleEditorChange} />
          </div>
          <button
            onClick={handleAddDescription}
            disabled={isSaving || !newDescription.trim()}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer font-heading"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Saving..." : "Add Description"}
          </button>
        </div>
      </div>
    </div>
  );
}
