import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import {
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  User,
  Image as ImageIcon,
  XCircle,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/routes/ProtectedRouter";
import Swal from "sweetalert2";
import { orderService } from "@/services/order.service.ts";

type OrderInfo = {
  order_id: number;
  product_id: number;
  product_name: string;
  product_images: string[];
  buy_now_price: number;
  end_time: string;
  payment_proof_image_url: string;
  phone_number: string;
  shipping_address: string;
  order_status: string;
  winner_id: number;
  winner_name: string;
  winner_email: string;
  winner_username: string;
  winner_avatar?: string;
  shipping_label_image?: string;
};

export default function SellerOrderPage() {
  const [searchParams] = useSearchParams();
  const product_id = searchParams.get("product_id");
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = useAuth();
  const [shippingLabelImage, setShippingLabelImage] = useState<File | null>(null);
  const [shippingLabelPreview, setShippingLabelPreview] = useState<string>("");

  useEffect(() => {
    async function fetchOrderData() {
      if (!product_id || !auth) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await orderService.getSellerOrderView({ product_id });

        if (data.status === "error" || !data.data) {
          toast.error(data.message || "No orders yet for this product");
          setOrderInfo(null);
        } else {
          setOrderInfo(data.data);
          if (data.data.shipping_label_image) {
            setShippingLabelPreview(data.data.shipping_label_image);
          }
        }
      } catch (e) {
        toast.error("An error occurred while loading order information");
      }
      setIsLoading(false);
    }
    fetchOrderData();
  }, [product_id, auth]);

  const handleShippingLabelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        return;
      }
      setShippingLabelImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setShippingLabelPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveShippingLabel = () => {
    setShippingLabelImage(null);
    setShippingLabelPreview("");
  };

  const handleApproveOrder = async () => {
    if (!shippingLabelImage && !orderInfo?.shipping_label_image) {
      toast.error("Please upload a shipping label image");
      return;
    }

    Swal.fire({
      title: "Confirm order?",
      text: "You confirm that you have received payment and will ship the product",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const formData = new FormData();
          formData.append("product_id", product_id!);
          if (shippingLabelImage) {
            formData.append("shipping_label", shippingLabelImage);
          }

          const data = await orderService.approveOrder(String(orderInfo!.order_id), formData);
          if (data.status === "success") {
            toast.success("Order confirmed successfully!");
            window.location.reload();
          } else {
            toast.error(data.message || "An error occurred while confirming the order");
          }
        } catch (error) {
          toast.error("An error occurred while confirming the order");
        }
      }
    });
  };

  const handleRejectOrder = () => {
    Swal.fire({
      title: "Reject order?",
      text: "Are you sure you want to reject this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = await orderService.rejectOrder(String(orderInfo!.order_id), {});
          if (data.status === "success") {
            toast.success("Order rejected successfully");
            navigate(-1);
          } else {
            toast.error(data.message || "An error occurred while rejecting the order");
          }
        } catch (error) {
          toast.error("An error occurred while rejecting the order");
        }
      }
    });
  };

  if (isLoading || !auth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-2">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Order ID: <span className="font-semibold text-foreground">#{orderInfo.order_id}</span>
          </p>
          <div className="mt-2">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                orderInfo.order_status === "pending"
                  ? "bg-yellow-500/15 text-yellow-600"
                  : orderInfo.order_status === "finished"
                  ? "bg-emerald-500/15 text-emerald-500"
                  : orderInfo.order_status === "rejected"
                  ? "bg-red-500/15 text-red-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {orderInfo.order_status === "pending"
                ? "Pending Approval"
                : orderInfo.order_status === "finished"
                ? "Completed"
                : orderInfo.order_status === "rejected"
                ? "Rejected"
                : "Unknown"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-md border border-border p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Package className="text-accent" size={24} />
                Product Information
              </h2>

              <div className="mb-4">
                <img
                  src={orderInfo.product_images[0]}
                  alt={orderInfo.product_name}
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
              </div>

              <h3 className="font-semibold text-lg mb-3 text-foreground">
                {orderInfo.product_name}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign size={18} className="text-emerald-500" />
                  <span>Selling Price:</span>
                  <NumericFormat
                    value={orderInfo.buy_now_price}
                    displayType="text"
                    thousandSeparator=","
                    suffix=" VND"
                    className="font-bold text-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={18} className="text-accent" />
                  <span>End Time:</span>
                  <span className="font-medium text-foreground">
                    {new Date(orderInfo.end_time).toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Winner Info */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <User className="text-accent" size={24} />
                Buyer Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={orderInfo.winner_name}
                    readOnly
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={orderInfo.winner_email}
                    readOnly
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={orderInfo.phone_number}
                    readOnly
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    value={orderInfo.shipping_address}
                    readOnly
                    rows={2}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Proof */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <ImageIcon className="text-accent" size={24} />
                Payment Proof from Buyer
              </h2>

              {orderInfo.payment_proof_image_url ? (
                <div className="border border-border rounded-lg p-4 bg-muted/20">
                  <img
                    src={orderInfo.payment_proof_image_url}
                    alt="Payment proof"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/50">
                  <ImageIcon className="mx-auto mb-4 text-muted-foreground/30" size={48} />
                  <p className="text-foreground font-medium mb-2">
                    Buyer has not uploaded payment proof yet
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please wait for the buyer to complete payment and upload proof.
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Label Upload */}
            {orderInfo.order_status === "pending" && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Upload className="text-accent" size={24} />
                  Upload Shipping Label
                </h2>

                <div className="mb-4">
                  <p className="text-muted-foreground mb-4">
                    Please upload the shipping label image to confirm the order and send it to the buyer.
                  </p>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/20">
                    {!shippingLabelPreview ? (
                      <div className="text-center">
                        <ImageIcon
                          className="mx-auto mb-4 text-muted-foreground/30"
                          size={48}
                        />
                        <label
                          htmlFor="shipping-label"
                          className="cursor-pointer inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          <Upload size={20} className="mr-2" />
                          Choose Shipping Label Image
                        </label>
                        <input
                          id="shipping-label"
                          type="file"
                          accept="image/*"
                          onChange={handleShippingLabelUpload}
                          className="hidden"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          PNG, JPG, JPEG (max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={shippingLabelPreview}
                          alt="Shipping label"
                          className="w-full max-h-96 object-contain rounded-lg"
                        />
                        {!orderInfo.shipping_label_image && (
                          <button
                            onClick={handleRemoveShippingLabel}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleRejectOrder}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Reject Order
                  </button>
                  <button
                    onClick={handleApproveOrder}
                    disabled={!shippingLabelImage && !orderInfo.shipping_label_image}
                    className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Confirm Order
                  </button>
                </div>
              </div>
            )}

            {/* Order Completed */}
            {orderInfo.order_status === "finished" && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/15 rounded-full">
                  <CheckCircle className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Order has been confirmed and shipped successfully!
                </h3>
                <p className="text-muted-foreground">
                  The shipping label has been sent to the buyer.
                </p>

                {orderInfo.shipping_label_image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Shipping label image:
                    </p>
                    <img
                      src={orderInfo.shipping_label_image}
                      alt="Shipping label"
                      className="mx-auto max-w-md max-h-64 object-contain rounded-lg border border-border"
                    />
                  </div>
                )}

                <button
                  onClick={() =>
                    navigate(`/rating/${orderInfo.winner_name}_${orderInfo.winner_id}`)
                  }
                  className="w-full px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                  Rate Buyer
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            )}

            {/* Order Rejected */}
            {orderInfo.order_status === "rejected" && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/15 rounded-full">
                  <XCircle className="text-red-500" size={40} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Order Rejected
                </h3>
                <p className="text-muted-foreground">
                  You have rejected this order. The buyer will be notified.
                </p>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
