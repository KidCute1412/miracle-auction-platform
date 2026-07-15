import { useState } from "react";
import { Link } from "react-router-dom";
import CatagoriseButton from "@/components/common/CategoriesMenu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import { LucideSearch, Heart, Plus, UserPlus, Sun, Moon } from "lucide-react";
import ProfileDropdown from "@/components/common/ProfileDropdown";
import { useTheme } from "@/contexts/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
        {/* Brand logo and name */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <img
            src="/favicon.png"
            alt="logo"
            className="h-10 w-10 object-cover rounded-full hover:rotate-12 transition-transform duration-300"
          />
          <span className="font-heading font-extrabold text-2xl tracking-wider bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            Miracle
          </span>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 flex-1 justify-end md:justify-between ml-4">
          <div className="hidden md:flex items-center gap-2">
            <CatagoriseButton />
          </div>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted text-foreground transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {!auth ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/accounts/login"
                  className="text-sm font-semibold hover:text-accent transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/accounts/register"
                  className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all duration-200 shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/my-products"
                  title="Favorites"
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <Heart size={20} />
                </Link>

                {auth.role === "user" ? (
                  <Link
                    to="/register-seller"
                    title="Become a Seller"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <UserPlus size={20} />
                  </Link>
                ) : (
                  <Link
                    to="/products/post"
                    title="Add new product"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <Plus size={20} />
                  </Link>
                )}
                <ProfileDropdown />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full text-sm relative">
      <LucideSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-full outline-none focus:border-accent focus:bg-background/80 transition-all duration-200"
        />
      </form>
    </div>
  );
}
