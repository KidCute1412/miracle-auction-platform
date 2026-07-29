/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import FilterBar from "@/components/admin/FilterBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFilters } from "@/hooks/useFilters";
import { slugify } from "@/utils/make_slug";
import Loading from "@/components/common/Loading";
import PaginationComponent from "@/components/common/Pagination";
import { userService } from "@/services/user.service";
import UserAvatar from "@/components/common/UserAvatar";

type UserItem = {
  user_id: number;
  full_name: string;
  avatar: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

const LIMIT = 10;

export default function UserListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  
  const {
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    resetFilters,
  } = useFilters();

  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    if (!search) {
      setLocalSearch("");
    }
  }, [search]);

  const handleSearchSubmit = () => {
    const slugified = slugify(localSearch);
    if (slugified !== search) {
      handleSearchChange(slugified);
    }
  };

  useEffect(() => {
    // Fetch user counts to set total pages
    userService.adminGetTotal({ search, status: statusFilter })
      .then((data) => {
        if (data.code === "success") {
          const total = data.total as number;
          setTotalPages(Math.ceil(total / LIMIT));
          const newTotalPages = Math.ceil(total / LIMIT);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setSearchParams((prev) => ({
              ...Object.fromEntries(prev),
              page: "1",
            }));
          }
        } else {
          setTotalPages(1);
        }
      });
  }, [search, statusFilter]);

  useEffect(() => {
    // Fetch users listings
    userService.adminList({
      search,
      page: currentPage,
      limit: LIMIT,
      status: statusFilter,
    })
      .then((data) => {
        if (data.code === "success") {
          setItems(data.list);
          setIsLoading(false);
          setIsPageLoading(false);
        }
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
        setIsPageLoading(false);
      });
  }, [search, currentPage, statusFilter]);

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 0) return "?";
    const lastWord = words[words.length - 1];
    return lastWord.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-foreground bg-background">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="font-heading font-bold text-xl sm:text-2xl mb-4 text-foreground">
          Manage Users
        </h2>

        <FilterBar
          showStatusFilter
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          statusOptions={[
            { value: "all", label: "Status" },
            { value: "user", label: "User" },
            { value: "seller", label: "Seller" },
          ]}
          search={localSearch}
          setSearch={setLocalSearch}
          onSearchSubmit={handleSearchSubmit}
          onResetFilters={resetFilters}
        />

        {/* Desktop Table View - Hidden on screens < 1280px */}
        <div className="mt-5 bg-card rounded-xl border border-border overflow-hidden hidden xl:block transition-colors duration-300">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    User Role
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted"></div>
                            <div className="h-4 bg-muted rounded w-32"></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="h-8 w-8 bg-muted rounded mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  : items.map((user) => {
                      return (
                        <tr
                          key={user.user_id}
                          className="hover:bg-muted/20 transition-colors duration-150"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar src={user.avatar} name={user.full_name} size="md" />
                              <span className="font-medium text-foreground text-sm">
                                {user.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-foreground">
                            <div className="max-w-[200px] mx-auto truncate">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-foreground">
                            {user.role === "user"
                              ? "User"
                              : user.role === "seller"
                              ? "Seller"
                              : user.role === "admin"
                              ? "Administrator"
                              : user.role}
                          </td>

                          <td className="px-4 py-3 text-center text-sm">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                className="cursor-pointer p-1.5 hover:bg-muted text-accent rounded-lg transition-colors"
                                onClick={() =>
                                  navigate(`/admin/user/detail/${user.user_id}`)
                                }
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          {!isLoading && items.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No users match the filters
            </div>
          )}
        </div>

        {/* Tablet/Mobile Card View - Show on screens < 1280px */}
        <div className="mt-5 grid grid-row-1 sm:grid-row-2 gap-4 xl:hidden">
          {isLoading ? (
            <Loading className="ml-[240px] bg-transparent"></Loading>
          ) : (
            items.map((user) => {
              return (
                <div
                  key={user.user_id}
                  className="bg-card rounded-xl border border-border p-4 shadow-sm text-foreground transition-colors duration-300"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <UserAvatar src={user.avatar} name={user.full_name} size="lg" />
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-base mb-1">
                        {user.full_name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground break-all">
                        {user.email}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">User Role:</span>
                      <span className="font-medium text-foreground">
                        {user.role === "user"
                          ? "User"
                          : user.role === "seller"
                          ? "Seller"
                          : user.role === "admin"
                          ? "Administrator"
                          : user.role}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-border/55">
                    <button
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-muted/30 hover:bg-muted text-accent rounded-lg text-sm transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/user/detail/${user.user_id}`)
                      }
                    >
                      <Pencil size={14} className="shrink-0" />
                      <span className="font-medium">Edit</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!isLoading && items.length === 0 && (
            <div className="col-span-full bg-card rounded-xl border border-border py-8 text-center text-muted-foreground text-sm">
              No users match the filters
            </div>
          )}
        </div>

        <PaginationComponent numberOfPages={totalPages} currentPage={currentPage} controlPage={setCurrentPage}></PaginationComponent>
      </div>
    </div>
  );
}
