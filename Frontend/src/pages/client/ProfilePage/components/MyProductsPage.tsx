import React, { useEffect, useState } from "react";
import PaginationComponent from "@/components/common/Pagination";
import ProductCard from "@/components/common/ProductCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Loading from "@/components/common/Loading";
import { Heart, Package, ShoppingCart, Trophy, TrendingUp, Archive } from "lucide-react";
import LoginRequest from "@/components/common/LoginRequest";
import { useAuth } from "@/routes/ProtectedRouter";
import { productService } from "@/services/product.service.ts";

type Products = {
  product_id: number;
  product_images: string[];
  product_name: string;
  current_price: number;
  buy_now_price: number;
  start_time: any;
  end_time: any;
  price_owner_username: string;
  price_owner_id: number;
  bid_turns: string;
};

type TabItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

export default function MyProductsPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "my-favorites");

  const allTabs: TabItem[] = [
    {
      id: "my-favorites",
      label: "Favorites",
      icon: <Heart size={18} />,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
    },
    {
      id: "my-selling",
      label: "Selling",
      icon: <Package size={18} />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "my-inventory",
      label: "Inventory",
      icon: <Archive size={18} />,
      color: "text-slate-500",
      bgColor: "bg-slate-500/10"
    },
    {
      id: "my-sold",
      label: "Sold",
      icon: <ShoppingCart size={18} />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      id: "my-bidding",
      label: "Bidding",
      icon: <TrendingUp size={18} />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "my-won",
      label: "Won",
      icon: <Trophy size={18} />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const tabs = allTabs.filter(tab => {
    if (auth?.role !== "seller" && auth?.role !== "admin") {
      const sellerOnlyTabs = ["my-selling", "my-inventory", "my-sold"];
      return !sellerOnlyTabs.includes(tab.id);
    }
    return true;
  });

  const getActiveTabInfo = () => {
    return tabs.find(tab => tab.id === activeTab) || tabs[0];
  };

  const [currentPage, setCurrentPage] = useState(searchParams.get("page") ? parseInt(searchParams.get("page") as string) : 1);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [quantity, setQuantity] = useState(0);

  const [products, setProducts] = useState<Products[]>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const getData = async() => {
      try {
        setLoading(true);
        const page = searchParams.get("page") ? parseInt(searchParams.get("page") as string) : 1;
        const type = searchParams.get("type") || "my-favorites";
        const response = await productService.getMyProducts({ type, page });
        const data = response;

        if (!data || data.status === "error") {
          setLoading(false);
          return;
        }
        setLoading(false);
        setProducts(data.data);
        setNumberOfPages(data.numberOfPages);
        setQuantity(data.quantity);
      } catch(e) {
        toast.error("Server connection error");
        setLoading(false);
      }
    };

    getData();
  }, [searchParams, navigate, auth]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSearchParams({ type: tabId });
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const activeTabInfo = getActiveTabInfo();
  if (!auth) return <LoginRequest />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-2">
              My Products
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage and track your products
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  activeTab === tab.id
                    ? `${tab.color} ${tab.bgColor} shadow-sm border border-border`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {quantity ? (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${activeTabInfo.color} ${activeTabInfo.bgColor} border border-border`}>
            {activeTabInfo.icon}
            <span className="font-medium">{activeTabInfo.label}</span>
            {products && products.length > 0 && (
              <span className="text-sm opacity-75">({quantity} products)</span>
            )}
          </div>
        ) : null}

        {/* Products Grid */}
        {isLoading ? (
          <Loading />
        ) : quantity > 0 && products ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((item, index) => (
                <div key={index} className="flex justify-center">
                  <ProductCard
                    className="w-full max-w-sm scale-90 hover:scale-95 transition-transform duration-300"
                    product_image={item.product_images ? item.product_images[0] : ""}
                    product_id={item.product_id}
                    product_name={item.product_name}
                    current_price={item.current_price}
                    buy_now_price={item.buy_now_price}
                    start_time={item.start_time}
                    end_time={item.end_time}
                    price_owner_username={item.price_owner_username}
                    price_owner_id={item.price_owner_id}
                    bid_turns={item.bid_turns}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <PaginationComponent
                numberOfPages={numberOfPages}
                currentPage={currentPage}
                controlPage={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground text-sm">
                {activeTab === "my-favorites" && "You haven't added any products to your favorites list yet."}
                {activeTab === "my-selling" && "You haven't posted any products for sale yet."}
                {activeTab === "my-inventory" && "You have no inventory products yet."}
                {activeTab === "my-sold" && "You haven't sold any products yet."}
                {activeTab === "my-bidding" && "You haven't participated in any auctions yet."}
                {activeTab === "my-won" && "You haven't won any auctions yet."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}