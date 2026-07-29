import { useEffect, useState } from "react";
import FilterBar from "@/components/admin/FilterBar";
import { Pencil, Trash2, FolderTree, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatToVN } from "@/utils/format_time";
import type { CategoryItem } from "@/interface/category.interface";
import { useFilters } from "@/hooks/useFilters";
import { slugify } from "@/utils/make_slug";
import { toast } from "sonner";
import Loading from "@/components/common/Loading";
import PaginationComponent from "@/components/common/Pagination";
import { categoryService } from "@/services/category.service";

const LIMIT = 10;

export default function CategoryList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CategoryItem[]>([]);
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
    statusFilter,
    creatorFilter,
    dateFrom,
    dateTo,
    search: searchFromUrl,
    handleStatusFilterChange,
    handleCreatorFilterChange,
    handleDateFromChange,
    handleDateToChange,
    handleSearchChange,
    resetFilters,
  } = useFilters();

  const [localSearch, setLocalSearch] = useState("");
  const [creatorOptions, setCreatorOptions] = useState<string[]>([]);

  useEffect(() => {
    categoryService.getCreators()
      .then((data) => {
        setCreatorOptions(data);
      })
      .catch(() => {
        setCreatorOptions([]);
      });
  }, []);

  const fetchItems = () => {
    setIsPageLoading(true);

    categoryService
      .list({
        page: currentPage,
        limit: LIMIT,
        status: statusFilter,
        creator: creatorFilter,
        dateFrom,
        dateTo,
        search: slugify(searchFromUrl),
        deleted: false,
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
    categoryService
      .getTotal({
        status: statusFilter,
        creator: creatorFilter,
        dateFrom,
        dateTo,
        search: slugify(searchFromUrl),
        deleted: false,
      })
      .then((data) => {
        const total = data.total;
        setTotalCount(total);
        setTotalPages(Math.ceil(total / LIMIT));
        const newTotalPages = Math.ceil(total / LIMIT);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setSearchParams((prev) => ({
            ...Object.fromEntries(prev),
            page: "1",
          }));
        }
      })
      .catch(() => {
        setTotalPages(1);
      });
  };

  useEffect(() => {
    if (!searchFromUrl) {
      setLocalSearch("");
    }
  }, [searchFromUrl]);

  const handleSearchSubmit = () => {
    const slugified = slugify(localSearch);
    if (slugified !== searchFromUrl) {
      handleSearchChange(slugified);
    }
  };

  useEffect(() => {
    fetchTotal();
  }, [statusFilter, creatorFilter, dateFrom, dateTo, searchFromUrl]);

  useEffect(() => {
    fetchItems();
  }, [currentPage, statusFilter, creatorFilter, dateFrom, dateTo, searchFromUrl]);

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    categoryService
      .delete(id)
      .then((data) => {
        if (data.code === "success") {
          toast.success(data.message || "Category deleted successfully!");
          fetchItems();
          fetchTotal();
        } else {
          toast.error(data.message || "Failed to delete category!");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to delete category!");
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
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Manage Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Total: {totalCount} categories listed</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${import.meta.env.VITE_PATH_ADMIN}/category/trash`)}
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-muted/40 hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-semibold rounded-xl text-sm transition-all"
          >
            View Trash Bin
          </button>
          <button
            onClick={() => navigate(`/${import.meta.env.VITE_PATH_ADMIN}/category/create`)}
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
        <FilterBar
          showStatusFilter
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          statusOptions={[
            { value: "all", label: "Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          creatorFilter={creatorFilter}
          setCreatorFilter={handleCreatorFilterChange}
          creatorOptions={creatorOptions}
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
                <th className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground w-20">
                  ID
                </th>
                <th className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category Name
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground w-36">
                  Status
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Created By
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Updated By
                </th>
                <th className="px-6 py-4.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors duration-150">
                  <td className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                    #{item.id}
                  </td>
                  <td className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-semibold text-xs border ${
                        item.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {item.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <div className="font-medium text-foreground">{item.created_by || "Unknown"}</div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">{formatToVN(item.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <div className="font-medium text-foreground">{item.updated_by || "Unknown"}</div>
                    <div className="text-muted-foreground text-[10px] mt-0.5">{formatToVN(item.updated_at)}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Edit category"
                        className="cursor-pointer p-2 hover:bg-accent/10 text-accent rounded-xl transition-all"
                        onClick={() => navigate(`/${import.meta.env.VITE_PATH_ADMIN}/category/edit/${item.id}`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Move to trash"
                        onClick={() => handleDelete(item.id)}
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
            No categories found matching the filters
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
            key={item.id}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm text-foreground space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">ID: #{item.id}</span>
                <h3 className="font-bold text-foreground text-sm mt-0.5">{item.name}</h3>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  item.status === "active"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {item.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/10 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-muted-foreground block">Created:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{item.created_by || "Unknown"}</span>
                <span className="text-muted-foreground text-[10px] block mt-0.5">{formatToVN(item.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Updated:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{item.updated_by || "Unknown"}</span>
                <span className="text-muted-foreground text-[10px] block mt-0.5">{formatToVN(item.updated_at)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-border/50">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold rounded-xl transition-all cursor-pointer"
                onClick={() => navigate(`/${import.meta.env.VITE_PATH_ADMIN}/category/edit/${item.id}`)}
              >
                <Pencil size={14} />
                <span>Edit Category</span>
              </button>

              <button
                onClick={() => handleDelete(item.id)}
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
            No categories found matching the filters
          </div>
        )}
      </div>

      <div className="pt-2">
        <PaginationComponent numberOfPages={totalPages} currentPage={currentPage} controlPage={setCurrentPage} />
      </div>
    </div>
  );
}
