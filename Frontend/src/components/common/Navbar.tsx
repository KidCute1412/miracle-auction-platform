import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CatagoriseButton from "@/components/common/CategoriesMenu";
import { useAuth } from "@/routes/ProtectedRouter";
import {
  LucideSearch,
  Heart,
  Plus,
  UserPlus,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Home,
  LogIn,
  User,
  Lock,
  LogOut,
  Sparkles,
} from "lucide-react";
import ProfileDropdown from "@/components/common/ProfileDropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { categoryService } from "@/services/category.service";
import { accountService } from "@/services/account.service";
import { slugify } from "@/utils/make_slug";
import { toast } from "sonner";

interface CategoryChild {
  id: number;
  name: string;
  cat_image?: string;
}

interface CategoryItem {
  id: number;
  name: string;
  children: CategoryChild[];
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isHomePage = location.pathname === "/";

  // Auto close mobile drawer & search when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleHover = (action: string) => {
    if (isHomePage) {
      window.dispatchEvent(new CustomEvent("miracle:navbar-hover", { detail: { action } }));
    }
  };

  const handleLogout = () => {
    accountService
      .logout()
      .then(() => {
        setAuth(null);
        setMobileMenuOpen(false);
        navigate("/");
      })
      .catch(() => {
        toast.error("Unable to connect to the server for logout!");
      });
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-background/85 backdrop-blur-md border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-2">
          {/* Left section: Hamburger button (mobile) + Brand logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu size={22} />
            </button>

            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
              onClick={() => navigate("/")}
            >
              <img
                src="/favicon.png"
                alt="logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-full hover:rotate-12 transition-transform duration-300 shrink-0"
              />
              <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-wider bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Miracle
              </span>
            </div>
          </div>

          {/* Center section: Categories button & Search bar (Desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl mx-4">
            <CatagoriseButton />
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
          </div>

          {/* Right section: Actions & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile search toggle button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle mobile search"
            >
              {mobileSearchOpen ? <X size={20} className="text-accent" /> : <LucideSearch size={20} />}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted text-foreground transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            {!auth ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  to="/accounts/login"
                  onMouseEnter={() => handleHover("signin")}
                  onMouseLeave={() => handleHover("leave")}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold hover:text-accent transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/accounts/register"
                  onMouseEnter={() => handleHover("signup")}
                  onMouseLeave={() => handleHover("leave")}
                  className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all duration-200 shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/my-products"
                  onMouseEnter={() => handleHover("heart")}
                  onMouseLeave={() => handleHover("leave")}
                  title="Favorites"
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <Heart size={19} />
                </Link>

                {auth.role === "user" ? (
                  <Link
                    to="/register-seller"
                    title="Become a Seller"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <UserPlus size={19} />
                  </Link>
                ) : (
                  <Link
                    to="/products/post"
                    onMouseEnter={() => handleHover("plus")}
                    onMouseLeave={() => handleHover("leave")}
                    title="Add new product"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <Plus size={19} />
                  </Link>
                )}

                <div
                  onMouseEnter={() => handleHover("profile")}
                  onMouseLeave={() => handleHover("leave")}
                >
                  <ProfileDropdown />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-3 animate__animated animate__fadeInDown animate__faster">
            <SearchBar autoFocus onSearchSubmitted={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </header>

      {/* Mobile Drawer (Sidebar Sheet) */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        auth={auth}
        onLogout={handleLogout}
      />
    </>
  );
}

export default Navbar;

function SearchBar({
  autoFocus = false,
  onSearchSubmitted,
}: {
  autoFocus?: boolean;
  onSearchSubmitted?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      onSearchSubmitted?.();
    }
  };

  return (
    <div className="w-full text-sm relative">
      <LucideSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search products..."
          autoFocus={autoFocus}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border rounded-full outline-none focus:border-accent focus:bg-background/90 transition-all duration-200 text-sm"
        />
      </form>
    </div>
  );
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auth: any;
  onLogout: () => void;
}

function MobileDrawer({ isOpen, onClose, auth, onLogout }: MobileDrawerProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      setLoadingCats(true);
      categoryService
        .getAllClient()
        .then((res) => {
          setCategories(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to load categories in mobile drawer:", err);
        })
        .finally(() => {
          setLoadingCats(false);
        });
    }
  }, [isOpen, categories.length]);

  if (!isOpen) return null;

  const toggleCategory = (catId: number) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  const handleSelectCat1 = (cat: CategoryItem) => {
    const slug = slugify(cat.name);
    navigate(`/categories/${slug}-${cat.id}`);
    onClose();
  };

  const handleSelectCat2 = (childId: number) => {
    navigate(`/products?cat2_id=${childId}&page=1`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate__animated animate__fadeIn animate__faster"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-[85%] max-w-[340px] bg-background border-r border-border h-full shadow-2xl flex flex-col z-50 animate__animated animate__slideInLeft animate__faster overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => {
              navigate("/");
              onClose();
            }}
          >
            <img src="/favicon.png" alt="logo" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-heading font-extrabold text-xl bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
              Miracle
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search inside Drawer */}
        <div className="p-4 border-b border-border/60 bg-muted/10">
          <SearchBar onSearchSubmitted={onClose} />
        </div>

        {/* Navigation Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Main Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                navigate("/");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Home size={18} className="text-accent" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                navigate("/categories");
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Grid3X3 size={18} className="text-accent" />
                <span>All Categories</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Categories Accordion */}
          <div className="pt-2 border-t border-border/60">
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-accent" />
              <span>Browse Categories</span>
            </div>

            {loadingCats ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Loading categories...
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isExpanded = expandedCat === cat.id;
                  const hasChildren = cat.children && cat.children.length > 0;

                  return (
                    <div key={cat.id} className="rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors">
                        <button
                          onClick={() => handleSelectCat1(cat)}
                          className="flex-1 text-left font-medium truncate"
                        >
                          {cat.name}
                        </button>
                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(cat.id);
                            }}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Expand category"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-accent" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Subcategories list */}
                      {isExpanded && hasChildren && (
                        <div className="pl-6 pr-2 py-1 space-y-1 bg-muted/20 rounded-lg my-1 animate__animated animate__fadeIn animate__faster">
                          {cat.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleSelectCat2(child.id)}
                              className="w-full text-left py-1.5 px-2 text-xs text-muted-foreground hover:text-accent hover:bg-muted/40 rounded-md transition-colors truncate block"
                            >
                              • {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Account Shortcuts */}
          <div className="pt-2 border-t border-border/60">
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account & Activity
            </div>

            {auth ? (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate("/my-products");
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Heart size={18} className="text-muted-foreground" />
                  <span>Favorite Products</span>
                </button>

                {auth.role === "user" ? (
                  <button
                    onClick={() => {
                      navigate("/register-seller");
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <UserPlus size={18} className="text-accent" />
                    <span>Become a Seller</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/products/post");
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus size={18} className="text-accent" />
                    <span>Post New Product</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigate(`/profile/${auth?.username}_${auth?.user_id}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User size={18} className="text-muted-foreground" />
                  <span>Profile Overview</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/profile/change-password");
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Lock size={18} className="text-muted-foreground" />
                  <span>Change Password</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-1 pt-1">
                <Link
                  to="/accounts/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm border border-border bg-background hover:bg-muted transition-colors"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/accounts/register"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        {auth && (
          <div className="p-3 border-t border-border bg-muted/20">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
