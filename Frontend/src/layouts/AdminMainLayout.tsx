// MainLayout.tsx (React Router)
import { Outlet } from "react-router-dom";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import {useEffect} from "react"
export default function MainLayout() {
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300">
      {/* Fixed top header with champagne gold subtle border */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-amber-500/20 bg-[#0F1420]/80 backdrop-blur-xl shadow-lg shadow-black/40 transition-colors duration-300">
        <Header />
      </header>

      {/* Grid container for navigation and main views */}
      <div
        className="grid"
        style={{
          gridTemplateRows: "1fr",
          gridTemplateColumns: "250px 1fr",
        }}
      >
        {/* Sticky sidebar for administration routing */}
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] overflow-y-auto border-r border-amber-500/10 bg-[#0F1420]/60 backdrop-blur-xl transition-colors duration-300 md:block">
          <Sidebar />
        </aside>

        {/* Main viewing area with ambient obsidian backdrop */}
        <main className="pt-16 bg-[#0B0F17] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.05),rgba(255,255,255,0))]">
          <div className="min-h-[calc(100vh-64px)] overflow-y-auto p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
