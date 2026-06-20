import { useEffect, useState } from "react";
import { Eye, Trash2, ShoppingBag, Plus } from "lucide-react";
import FilterBar from "@/components/admin/FilterBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatToVN } from "@/utils/format_time";
import { formatPrice } from "@/utils/format_price";
import { useFilters } from "@/hooks/useFilters";
import { toast } from "sonner";
import Loading from "@/components/common/Loading";
import PaginationComponent from "@/components/common/Pagination";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";

const LIMIT = 10;

type ProductItem = {
  product_id: number;
  product_name: string;
  is_removed: boolean;
  seller_id: string;
  creator_name?: string;
  created_at: string;
  edited_at?: string;
  start_time: string;
  end_time: string;
  bid_turns: number;
  current_price: number;
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  const pageParam = searchParams.get("page");
  useEffect(() => {
    setCurrentPage(parseInt(pageParam || "1", 10));
  }, [pageParam]);

  const {
    dateFrom,
    dateTo,
    search: searchFromUrl,
    handleDateFromChange,
    handleDateToChange,
    handleSearchChange,
    resetFilters,
  } = useFilters();

  const [localSearch, setLocalSearch] = useState("");

  const fetchItems = () => {
    setIsPageLoading(true);

    productService
      .adminList({
        page: currentPage,
        limit: LIMIT,
        dateFrom,
        dateTo,
        search: searchFromUrl,
        is_removed: false,
      })
      .then((data) => {
        setItems(data.list);
        setIsLoading(false);
        setIsPageLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
        setIsPageLoading(false);
      });
  };

  const fetchTotal = () => {
    productService
      .adminGetTotal({
        dateFrom,
        dateTo,
        search: searchFromUrl,
        is_removed: false,
      })
      .then((data) => {
        const total = data.total as number;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / LIMIT));
        const newTotalPages = Math.ceil(total / LIMIT);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setSearchParams((prev) => ({
            ...Object.fromEntries(prev),
            page: "1",
          }));
        }
      });
  };

  useEffect(() => {
    if (!searchFromUrl) {
      setLocalSearch("");
    }
  }, [searchFromUrl]);

  const handleSearchSubmit = () => {
    if (localSearch.trim() !== searchFromUrl) {
      handleSearchChange(localSearch.trim());
    }
  };

  useEffect(() => {
    fetchTotal();
  }, [dateFrom, dateTo, searchFromUrl]);

  useEffect(() => {
    fetchItems();
  }, [currentPage, dateFrom, dateTo, searchFromUrl]);

  const handleView = (id: number) => {
    navigate(`/${import.meta.env.VITE_PATH_ADMIN}/product/detail/${id}`);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to remove this product from active listings?")) {
      return;
    }
    productService
      .adminDelete(id)
      .then((data) => {
        if (data.code === "success") {
          fetchItems();
          fetchTotal();
          toast.success("Product moved to trash successfully");
        } else {
          toast.error(data.message || "Failed to remove product");
        }
      })
      .catch(() => {
        toast.error("An error occurred while removing product");
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading className="bg-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 text-accent rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Active Products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Total: {totalCount} active items</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/${import.meta.env.VITE_PATH_ADMIN}/product/trash`)}
          className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-semibold rounded-xl text-sm transition-all"
        >
          View Trash Bin
        </button>
      </div>

      {/* Styled filter bar without useless bulk action actions */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
        <FilterBar
          showStatusFilter={false}
          dateFrom={dateFrom}
          setDateFrom={handleDateFromChange}
          dateTo={dateTo}
          setDateTo={handleDateToChange}
          search={localSearch}
          setSearch={setLocalSearch}
          onSearchSubmit={handleSearchSubmit}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Desktop Table View */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden hidden lg:block relative shadow-sm transition-colors duration-300">
        {isPageLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex justify-center items-center z-10 animate-in fade-in duration-200">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/10">
              <tr>
                <th className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground w-16">
                  ID
                </th>
                <th className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Product Name
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Creator Name
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Start Time
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  End Time
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Bid Turns
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Price
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.map((item) => (
                <tr key={item.product_id} className="hover:bg-muted/10 transition-colors duration-150">
                  <td className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    #{item.product_id}
                  </td>
                  <td className="px-6 py-4 text-left font-semibold text-foreground text-sm max-w-sm truncate">
                    <span title={item.product_name}>{item.product_name}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                    {item.creator_name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {formatToVN(item.start_time)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {formatToVN(item.end_time)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                    {item.bid_turns ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-accent">
                    {formatPrice(item.current_price)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="View details"
                        className="cursor-pointer p-2 hover:bg-accent/10 text-accent rounded-xl transition-all"
                        onClick={() => handleView(item.product_id)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Move to trash"
                        onClick={() => handleDelete(item.product_id)}
                        className="cursor-pointer p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No products found matching the filters
          </div>
        )}
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="space-y-4 lg:hidden relative">
        {isPageLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex justify-center items-center z-10 rounded-2xl animate-in fade-in duration-200">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.product_id}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm text-foreground space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">ID: #{item.product_id}</span>
                <h3 className="font-bold text-foreground text-sm mt-0.5" title={item.product_name}>
                  {item.product_name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/10 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-muted-foreground block">Creator:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{item.creator_name || "Unknown"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Current Price:</span>
                <span className="font-bold text-accent mt-0.5 block">{formatPrice(item.current_price)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Start Time:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{formatToVN(item.start_time)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">End Time:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{formatToVN(item.end_time)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block">Bid Turns:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{item.bid_turns ?? 0}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold rounded-xl transition-all cursor-pointer"
                onClick={() => handleView(item.product_id)}
              >
                <Eye size={14} />
                <span>View Details</span>
              </button>

              <button
                onClick={() => handleDelete(item.product_id)}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold rounded-xl transition-all"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="bg-card rounded-2xl border border-border py-16 text-center text-muted-foreground text-sm shadow-sm">
            No products found matching the filters
          </div>
        )}
      </div>

      <div className="pt-2">
        <PaginationComponent numberOfPages={totalPages} currentPage={currentPage} controlPage={setCurrentPage} />
      </div>
    </div>
  );
}
