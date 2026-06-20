import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { useAuth } from "@/routes/ProtectedRouter";
import PlayBidSection from "./components/PlayBidSection";
import BuyNowSection from "./components/BuyNowSection";
import BidHistorySection from "./components/BidHistorySection";
import QASection from "./components/QASection";
import ProductDescriptionSection from "./components/ProductDescriptionSection";
import RelatedProductsSection from "./components/RelatedProductsSection";
import ProductImageGallery from "./components/ProductImageGallery";
import { Clock, Calendar, User, Star, Award, TrendingUp } from "lucide-react";
import useSocketBidding from "@/hooks/useSocketBidding";
import PreviewImage from "./components/PreviewProductModal";
import Loading from "@/components/common/Loading";
import { slugify } from "@/utils/make_slug";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { productService } from "@/services/product.service.ts";
import { categoryService } from "@/services/category.service.ts";

type ProductType = {
  product_id: number;
  product_name: string;
  product_images: string[];

  seller_id: number;
  seller_username: string;
  seller_rating: number;
  seller_avatar?: string;

  current_price: number;
  step_price: number;
  buy_now_price?: number;

  price_owner_id?: number;
  price_owner_username?: string;
  price_owner_rating?: number;
  price_owner_avatar?: string;

  start_time: string;
  end_time: string;
  description: string;
  auto_extended?: boolean;

  cat2_id: number;
};

function DetailProductPage() {
  const navigator = useNavigate();
  const { auth } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [products, setProduct] = useState<ProductType>();
  const { slugid } = useParams();
  let product_id: number | undefined;
  let product_slug: string;
  if (slugid) {
    const parts = slugid.split("-");
    product_id = Number(parts.pop());
    product_slug = parts.join("-");
  }
  const socket = useSocketBidding(product_id || null);

  const [formattedStartTime, setFormatStartTime] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(true);

  const [isLoading, setLoading] = useState(true);
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const data = await productService.getDetail(product_id!);
        setProduct(data.data);
      } catch (e) {
        toast.error("Error connecting to server");
        console.log(e);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slugid]);

  useEffect(() => {
    async function fetchBreadCrumbs() {
      if (!products?.cat2_id) return;
      categoryService.getClientCat2(products.cat2_id)
        .then((data) => {
          setBreadcrumbs([
            { label: "Home", path: "/" },
            { label: "Categories", path: "/categories" },
            {
              label: data.data.cat1_name,
              path: `/categories/${slugify(data.data.cat1_name)}-${
                data.data.cat1_id
              }`,
            },
            {
              label: data.data.cat2_name,
              path: `/products?cat2_id=${data.data.cat2_id}`,
            },
            {
              label: products?.product_name || "Product Details",
              path: null,
            },
          ]);
        })
        .catch((error) => {
          toast.error(error.message || "Server connection error");
        });
    }
    if (products) {
      fetchBreadCrumbs();
    }
  }, [products]);

  useEffect(() => {
    if (auth && products) {
      setIsSeller(auth.user_id === products.seller_id);
    }
  }, [auth, products]);

  useEffect(() => {
    if (!socket) return;
    socket.on("new_bid", (data: any) => {
      console.log("Received new bid data via socket: ", data.data);
      setProduct(data.data);
    });
    return () => {
      if (socket) {
        socket.off("new_bid");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (products) {
      formatStartTime(
        DateTime.fromISO(products.start_time).setZone("Asia/Ho_Chi_Minh")
      );
      const end = DateTime.fromISO(products.end_time).setZone(
        "Asia/Ho_Chi_Minh"
      );
      formatEndTime(end);
      const interval = setInterval(() => {
        const end = DateTime.fromISO(products.end_time).setZone(
          "Asia/Ho_Chi_Minh"
        );
        formatEndTime(end);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [products]);

  const formatStartTime = (start_time: DateTime) => {
    if (start_time) {
      setFormatStartTime(start_time.toFormat("dd-MM-yyyy HH:mm"));
    }
  };

  const formatEndTime = (end_time: DateTime) => {
    if (!end_time) return;

    const present_time = DateTime.now().setZone("Asia/Ho_Chi_Minh");
    const diff = end_time
      .diff(present_time, ["days", "hours", "minutes", "seconds"])
      .toObject();

    const days = diff.days ?? 0;
    const hours = diff.hours ?? 0;
    const minutes = diff.minutes ?? 0;
    const seconds = diff.seconds ?? 0;
    let result;
    if (days >= 1) {
      result = `${Math.floor(days)}d ${Math.floor(hours)}h left`;
      setIsExpired(false);
    } else if (hours >= 1) {
      result = `${Math.floor(hours)}h ${Math.floor(minutes)}m left`;
      setIsExpired(false);
    } else if (minutes >= 0 && seconds >= 0) {
      result = `${Math.floor(minutes)}m ${Math.floor(seconds)}s left`;
      setIsExpired(false);
    } else {
      result = "Expired";
      setIsExpired(true);
    }
    setTimeLeft(result);
  };

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setImageModalOpen(true);
  };

  const maskName = (name: string) => {
    const len = name.length;
    const thirdLen = Math.floor(len / 2);
    return name.substring(0, len - thirdLen) + "*****";
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="mx-auto px-4 py-8 bg-background text-foreground transition-colors duration-300">
      {/* Product Name */}
      <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-6">
        {products?.product_name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] gap-8">
        <ProductImageGallery
          product_id={products?.product_id}
          product_name={products?.product_name}
          product_images={products?.product_images}
          onOpenImageModal={openImageModal}
        />

        {/* Product Details - Right Column */}
        <div className="space-y-4">
          {/* Pricing Section */}
          <div className="bg-card border border-border p-5 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">
                Pricing Details
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Current Price:
                </span>
                <span className="text-2xl font-bold text-accent">
                  {products?.current_price?.toLocaleString()} VND
                </span>
              </div>
              {products?.buy_now_price && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">
                    Buy Now Price:
                  </span>
                  <span className="text-lg font-bold text-rose-500">
                    {products.buy_now_price?.toLocaleString()} VND
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Auction Timing */}
          <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-accent" />
              <h4 className="text-lg font-semibold text-foreground">
                Auction Schedule
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedStartTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Time Left</p>
                  <p className="text-lg font-bold text-red-500">{timeLeft ?? "Waiting..."}</p>
                </div>
              </div>
              {products?.auto_extended && (
                <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <p className="text-xs font-medium text-accent">
                      Auto Extended Enable
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-indigo-500" />
              <h4 className="text-lg font-semibold text-foreground">Seller</h4>
            </div>
            <Link
              to={`/profile/${products?.seller_username}_${products?.seller_id}`}
              className="flex items-center gap-3"
            >
              <div className="relative">
                {products?.seller_avatar ? (
                  <img
                    src={products.seller_avatar}
                    alt={products.seller_username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {products?.seller_username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
              </div>
              <div className="flex-1">
                <h5 className="text-base font-semibold text-foreground mb-1">
                  {products?.seller_username}
                </h5>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(products?.seller_rating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {products?.seller_rating?.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Highest Bidder Info */}
          {products?.price_owner_username && (
            <div className={`bg-card rounded-lg border p-5 shadow-sm ${
              products.price_owner_id === auth?.user_id 
                ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-amber-500/5' 
                : 'border-border'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h4 className="text-lg font-semibold text-foreground">
                  Highest Bidder
                </h4>
                {products.price_owner_id === auth?.user_id && (
                  <div className="ml-auto flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    <Award className="w-4 h-4" />
                    <span>You are leading!</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {isSeller ? (
                    <Link
                      to={`/profile/${products.price_owner_username}_${products.price_owner_id}`}
                    >
                      {products?.price_owner_avatar ? (
                        <img
                          src={products.price_owner_avatar}
                          alt={products.price_owner_username}
                          className="w-12 h-12 rounded-full object-cover"
                        />  
                      ) : (
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {products.price_owner_username
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {products.price_owner_username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-card flex items-center justify-center">
                    <Award className="w-3 h-3 text-black" />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-base font-semibold text-foreground mb-1">
                    {products.price_owner_id === auth?.user_id 
                      ? products.price_owner_username 
                      : maskName(products.price_owner_username)}
                  </h5>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(products?.price_owner_rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {products?.price_owner_rating?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              {products.price_owner_id === auth?.user_id && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-500 font-semibold text-center flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" />
                    You currently hold the highest bid
                  </p>
                </div>
              )}
              {products.price_owner_id === auth?.user_id &&
                new Date(products.end_time).getTime() < Date.now() && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        navigator(
                          `/winner-order?product_id=${products.product_id}`
                        );
                      }}
                      className="cursor-pointer w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Confirm Order
                    </button>
                  </div>
                )}
              {products.seller_id === auth?.user_id &&
                new Date(products.end_time).getTime() < Date.now() &&
                products.price_owner_id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        navigator(
                          `/seller-order?product_id=${products.product_id}`
                        );
                      }}
                      className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      View Invoice
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Bid Section - Full Width */}
      {!isExpired && (
        <div className="mt-8 bg-card border border-border rounded-lg shadow-sm animate__animated animate__fadeIn">
          <PlayBidSection
            product_id={products?.product_id}
            current_price={products?.current_price}
            step_price={products?.step_price}
            buy_now_price={products?.buy_now_price} 
          />
          {products?.buy_now_price && (
            <BuyNowSection
              product_id={products?.product_id}
              buy_now_price={products?.buy_now_price}
              product_name={products?.product_name}
            />
          )}
        </div>
      )}

      {/* Tab Section */}
      <TabSection products={products} isSeller={isSeller} isExpired={isExpired} />

      {/* Related Products */}
      <RelatedProductsSection
        category_id={products?.cat2_id}
        product_id={products?.product_id}
      />

      {/* Image Preview Modal */}
      {imageModalOpen && products?.product_images && (
        <PreviewImage
          images={products.product_images}
          name={products.product_name}
          modalImageIndex={modalImageIndex}
          setModalImageIndex={setModalImageIndex}
          setImageModalOpen={setImageModalOpen}
        />
      )}
    </div>
  );
}

function TabSection({
  products,
  isSeller,
  isExpired,
}: {
  products?: ProductType;
  isSeller?: boolean;
  isExpired?: boolean;
}) {
  const authUser = useAuth();
  const [activeTab, setActiveTab] = useState<
    "description" | "bidHistory" | "qa"
  >("description");

  return (
    <>
      <div className="mt-8">
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
              activeTab === "description"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("bidHistory")}
            className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
              activeTab === "bidHistory"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bid History
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
              activeTab === "qa"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Q&A
          </button>
        </div>

        <div className="min-h-fit pb-20">
          {activeTab === "description" && products?.description && (
            <ProductDescriptionSection
              description={products.description}
              isSeller={isSeller}
              isExpired={isExpired}
            />
          )}
          {activeTab === "bidHistory" && authUser && (
            <div className="bg-card py-2 px-2 rounded-lg">
              <BidHistorySection product={products} isSeller={isSeller} isExpired={isExpired} />
            </div>
          )}
          {activeTab === "qa" && (
            <div className="bg-card py-2 px-2 rounded-lg">
              <QASection
                seller_id={products?.seller_id}
                product_id={products?.product_id}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DetailProductPage;

