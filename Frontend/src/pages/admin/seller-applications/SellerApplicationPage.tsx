import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import FilterBar from "@/components/admin/FilterBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFilters } from "@/hooks/useFilters";
import { formatToVN } from "@/utils/format_time";
import { slugify } from "@/utils/make_slug";
import Loading from "@/components/common/Loading";
import PaginationComponent from "@/components/common/Pagination";
import { userService } from "@/services/user.service";

type BidderForm = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
  status: "pending" | "accepted" | "rejected";
};

const LIMIT = 10;

export default function BidderFormListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState<BidderForm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  const {
    statusFilter,
    dateFrom,
    dateTo,
    search: searchFromUrl,
    handleStatusFilterChange,
    handleDateFromChange,
    handleDateToChange,
    handleSearchChange,
    resetFilters,
  } = useFilters();

  const [localSearch, setLocalSearch] = useState("");

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
    // Fetch total number of applications for pagination
    userService
      .adminGetFormsTotal({
        status: statusFilter,
        dateFrom,
        dateTo,
        search: searchFromUrl,
      })
      .then((data) => {
        const total = data.total as number;
        setTotalPages(Math.ceil(total / LIMIT));
        const newTotalPages = Math.ceil(total / LIMIT);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setSearchParams((prev) => ({
            ...Object.fromEntries(prev),
            page: "1",
          }));
        }
      });
  }, [statusFilter, dateFrom, dateTo, searchFromUrl]);

  useEffect(() => {
    // Fetch list of application forms
    userService
      .adminListApplications({
        page: currentPage,
        limit: LIMIT,
        status: statusFilter,
        dateFrom,
        dateTo,
        search: searchFromUrl,
      })
      .then((data) => {
        if (data.code === "success") {
          setList(data.list);
        } else {
          setList([]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage, statusFilter, dateFrom, dateTo, searchFromUrl]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-foreground bg-background">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="font-heading font-bold text-xl sm:text-2xl mb-4 text-foreground">
          Seller Applications
        </h2>

        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          statusOptions={[
            { value: "all", label: "Status" },
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ]}
          search={localSearch}
          setSearch={setLocalSearch}
          onSearchSubmit={handleSearchSubmit}
          dateFrom={dateFrom}
          setDateFrom={handleDateFromChange}
          dateTo={dateTo}
          setDateTo={handleDateToChange}
          onResetFilters={resetFilters}
          bulkActionOptions={[
            { value: "accepted", label: "Accept" },
            { value: "rejected", label: "Reject" },
          ]}
        />

        {isLoading ? (
          <Loading className="ml-[240px] bg-transparent"></Loading>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="mt-5 bg-card rounded-xl border border-border overflow-hidden hidden lg:block transition-colors duration-300">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Full Name
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Submitted Date
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {list.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/20 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
                            {item.full_name}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-foreground">
                            <div className="max-w-[200px] mx-auto truncate">
                              {item.email}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center text-sm text-foreground">
                            {formatToVN(item.created_at)}
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold min-w-[90px] ${
                                item.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                  : item.status === "accepted"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-destructive/10 text-destructive border border-destructive/20"
                              }`}
                            >
                              {item.status === "pending"
                                ? "Pending"
                                : item.status === "accepted"
                                ? "Accepted"
                                : "Rejected"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                className="cursor-pointer p-1.5 hover:bg-muted text-accent rounded-lg transition-colors"
                                onClick={() =>
                                  navigate(
                                    `/admin/seller/application/detail/${item.id}`
                                  )
                                }
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {list.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No applications found
                </div>
              )}
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {list.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="bg-card rounded-xl border border-border p-4 shadow-sm text-foreground transition-colors duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mt-0.5 rounded text-accent bg-card border-border focus:ring-accent cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-base mb-1">
                            {item.full_name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                              item.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                : item.status === "accepted"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}
                          >
                            {item.status === "pending"
                              ? "Pending"
                              : item.status === "accepted"
                              ? "Accepted"
                              : "Rejected"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground break-all">
                          {item.email}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-muted-foreground">Submitted date:</span>
                        <span className="text-muted-foreground">
                          {formatToVN(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-border/55">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/seller/application/detail/${item.id}`
                          )
                        }
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-muted/30 hover:bg-muted text-accent text-sm rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye size={14} className="shrink-0" />
                        <span className="font-medium">View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {list.length === 0 && (
                <div className="col-span-full bg-card rounded-xl border border-border py-8 text-center text-muted-foreground text-sm">
                  No applications found
                </div>
              )}
            </div>
          </>
        )}

        <PaginationComponent numberOfPages={totalPages} currentPage={currentPage} controlPage={setCurrentPage} />
      </div>
    </div>
  );
}
