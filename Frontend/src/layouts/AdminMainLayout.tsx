// MainLayout.tsx (React Router)
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import Loading from "@/components/common/Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import { useEffect, useState } from "react";
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const { auth, loading } = useAuth();
  const route = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!auth) {
      route("/");
      return;
    }

    if (auth.role !== "admin") {
      route("/");
      return;
    }
  }, [auth, loading, route]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <ScrollRestoration />
      {/* Fixed top header with theme border */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl transition-colors duration-300">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      </header>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Mobile Drawer Off-Canvas Navigation */}
      <aside
        aria-label="Mobile Navigation"
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl pt-16 transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Grid container for desktop navigation and main views */}
      <div
        className={`grid transition-all duration-300 grid-cols-1 ${
          sidebarOpen ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-[0_1fr]"
        }`}
      >
        {/* Sticky desktop sidebar for administration routing */}
        <aside
          aria-hidden={!sidebarOpen}
          className={`sticky top-16 hidden h-[calc(100vh-64px)] overflow-y-auto border-r border-border bg-card transition-all duration-300 md:block ${
            sidebarOpen ? "opacity-100" : "pointer-events-none -translate-x-full opacity-0"
          }`}
        >
          <Sidebar />
        </aside>

        {/* Main viewing area with layout background */}
        <main className="pt-16 bg-muted/20 min-w-0">
          <div className="min-h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
