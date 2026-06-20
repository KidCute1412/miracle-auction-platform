import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import {
  Package,
  Calendar,
  DollarSign,
  Upload,
  CheckCircle,
  User,
  Phone,
  Mail,
  Image as ImageIcon,
  X,
  XCircle,
} from "lucide-react";
import { orderService } from "@/services/order.service.ts";
import { productService } from "@/services/product.service.ts";

type ProductInfo = {
  product_id: number;
  product_name: string;
  product_image: string;
  final_price: number;
  end_time: string;
  seller_name: string;
  seller_email: string;
  seller_phone?: string;
  winner_name: string;
  winner_address: string;
  winner_phone: string;
  winner_email: string;
  buy_now_price: number;
  product_images: string[];
};

export default function WinnerOrderCompletionPage() {
  const [searchParams] = useSearchParams();
  const product_id = searchParams.get("product_id");
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<ProductInfo | null>(null);
  const [infoUser, setInfoUser] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentProofImage, setPaymentProofImage] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      if (!product_id || !auth) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setPhoneNumber(auth?.phone_number || "");
        setAddress(auth?.address || "");

        const data = await productService.getDetailForWinner(product_id!);

        if (data.status === "error") {
          setOrderInfo(null);
          setInfoUser(null);
        } else {
          setOrderInfo(data.data);
          setInfoUser(data.infoSeller);
        }

        const orderDataResult = await orderService.getOrderDetail({ product_id });  // still using query params

        if (orderDataResult.status === "success" && orderDataResult.data) {
          setOrderData(orderDataResult.data);
          if (orderDataResult.data.order_status === "pending") {
            setCurrentStep(2);
            if (orderDataResult.data.payment_proof_image_url) {
              setPaymentProofPreview(orderDataResult.data.payment_proof_image_url);
            }
            if (orderDataResult.data.phone_number) {
              setPhoneNumber(orderDataResult.data.phone_number);
            }
            if (orderDataResult.data.shipping_address) {
              setAddress(orderDataResult.data.shipping_address);
            }
          } else if (orderDataResult.data.order_status === "finished") {
            setCurrentStep(3);
            if (orderDataResult.data.payment_proof_image) {
              setPaymentProofPreview(orderDataResult.data.payment_proof_image);
            }
            if (orderDataResult.data.phone_number) {
              setPhoneNumber(orderDataResult.data.phone_number);
            }
            if (orderDataResult.data.shipping_address) {
              setAddress(orderDataResult.data.shipping_address);
            }
          } else if (orderDataResult.data.order_status === "rejected") {
            setCurrentStep(4);
            if (orderDataResult.data.payment_proof_image_url) {
              setPaymentProofPreview(orderDataResult.data.payment_proof_image_url);
            }
            if (orderDataResult.data.phone_number) {
              setPhoneNumber(orderDataResult.data.phone_number);
            }
            if (orderDataResult.data.shipping_address) {
              setAddress(orderDataResult.data.shipping_address);
            }
          } else {
            setCurrentStep(1);
          }
        } else {
          setCurrentStep(1);
        }
      } catch (e) {
        console.log(e);
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [product_id, auth]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPaymentProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPaymentProofImage(null);
    setPaymentProofPreview("");
  };

  const handleSubmitPaymentProof = async () => {
    if (!paymentProofImage) {
      toast.error("Please upload a payment proof image");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter your shipping address");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product_id", product_id!);
      formData.append("phone_number", phoneNumber.trim());
      formData.append("shipping_address", address.trim());
      formData.append("payment_proof", paymentProofImage);

      const data = await orderService.createOrder(formData);
      if (data.status === "success") {
        toast.success("Order created successfully!");
        setCurrentStep(2);
      } else {
        toast.error(data.message || "An error occurred while creating the order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("An error occurred while creating the order");
    }
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
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 cursor-pointer"
          >
            Back to Home
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
            Order Completion
          </h1>
          <p className="text-muted-foreground">
            Product ID: <span className="font-semibold text-foreground">#{product_id}</span>
          </p>
        </div>

        {/* Wizard Steps */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center justify-center min-w-[600px] py-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1 ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <CheckCircle size={20} /> : "1"}
              </div>
              <span className={`ml-2 font-medium text-sm ${currentStep >= 1 ? "text-accent" : "text-muted-foreground"}`}>
                Upload Payment Proof
              </span>
            </div>

            <div className={`w-16 md:w-32 h-1 mx-4 ${currentStep >= 2 ? "bg-accent" : "bg-muted"}`}></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2 ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? <CheckCircle size={20} /> : "2"}
              </div>
              <span className={`ml-2 font-medium text-sm ${currentStep >= 2 ? "text-accent" : "text-muted-foreground"}`}>
                Awaiting Shipping Label
              </span>
            </div>

            <div className={`w-16 md:w-32 h-1 mx-4 ${currentStep >= 3 ? "bg-accent" : "bg-muted"}`}></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 3 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep >= 3 ? <CheckCircle size={20} /> : "3"}
              </div>
              <span className={`ml-2 font-medium text-sm ${currentStep >= 3 ? "text-emerald-500" : "text-muted-foreground"}`}>
                Completed
              </span>
            </div>
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
                  <span>Winning Price:</span>
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

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold mb-3 text-foreground">Seller Information</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground/50" />
                    <span className="text-foreground">{infoUser?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground/50" />
                    <span className="text-foreground">{infoUser?.email}</span>
                  </div>
                  {orderInfo.seller_phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground/50" />
                      <span className="text-foreground">{orderInfo.seller_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recipient Information */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <User className="text-accent" size={24} />
                Recipient Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={auth?.full_name || ""}
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
                    value={auth?.email || ""}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter shipping address"
                    rows={2}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-accent focus:border-accent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Proof Upload Card */}
            {currentStep === 1 && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Upload className="text-accent" size={24} />
                  Upload Payment Proof Image
                </h2>

                <div className="mb-4">
                  <p className="text-muted-foreground mb-4">
                    Please upload the confirmation image of your bank transfer to the seller. The seller will verify and upload the shipping label.
                  </p>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/20">
                    {!paymentProofPreview ? (
                      <div className="text-center">
                        <ImageIcon
                          className="mx-auto mb-4 text-muted-foreground/30"
                          size={48}
                        />
                        <label
                          htmlFor="payment-proof"
                          className="cursor-pointer inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          <Upload size={20} className="mr-2" />
                          Select Image
                        </label>
                        <input
                          id="payment-proof"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          PNG, JPG, JPEG (max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={paymentProofPreview}
                          alt="Payment proof"
                          className="w-full max-h-96 object-contain rounded-lg"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitPaymentProof}
                    disabled={!paymentProofImage}
                    className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Confirm Bank Transfer
                  </button>
                </div>
              </div>
            )}

            {/* Waiting for Shipping */}
            {currentStep === 2 && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/15 rounded-full">
                  <Package className="text-accent" size={40} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Payment proof uploaded successfully!
                </h3>
                <p className="text-muted-foreground">
                  The seller is verifying your payment and preparing the shipment. <br />
                  You will be notified when the shipping label is uploaded.
                </p>

                {paymentProofPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Your payment proof image:
                    </p>
                    <img
                      src={paymentProofPreview}
                      alt="Payment proof"
                      className="mx-auto max-w-md max-h-64 object-contain rounded-lg border border-border"
                    />
                  </div>
                )}

                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            )}

            {/* Completion */}
            {currentStep === 3 && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/15 rounded-full">
                  <CheckCircle className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Order completed!
                </h3>
                <p className="text-muted-foreground">
                  Thank you for using our service.
                </p>

                <button
                  onClick={() =>
                    navigate(`/rating/${infoUser?.username}_${infoUser?.user_id}`)
                  }
                  className="w-full px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                  Rate Seller
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors cursor-pointer font-semibold"
                >
                  Back
                </button>
              </div>
            )}

            {/* Rejected */}
            {currentStep === 4 && (
              <div className="bg-card rounded-xl shadow-md border border-border p-6 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/15 rounded-full">
                  <XCircle className="text-red-500" size={40} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Order has been rejected by the seller
                </h3>
                <p className="text-muted-foreground">
                  Unfortunately, the seller has rejected your order. <br />
                  Please contact the seller for further details.
                </p>

                {paymentProofPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Uploaded payment proof image:
                    </p>
                    <img
                      src={paymentProofPreview}
                      alt="Payment proof"
                      className="mx-auto max-w-md max-h-64 object-contain rounded-lg border border-border"
                    />
                  </div>
                )}

                <button
                  onClick={() => navigate("/")}
                  className="w-full px-6 py-3 border border-border text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
