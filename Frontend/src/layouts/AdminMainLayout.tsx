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
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      {/* Fixed top header with theme border */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl transition-colors duration-300">
        <Header />
      </header>

      {/* Grid container for navigation and main views */}
      <div
        className="grid"
        style={{
          gridTemplateRows: "1fr",
          gridTemplateColumns: "240px 1fr",
        }}
      >
        {/* Sticky sidebar for administration routing */}
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] overflow-y-auto border-r border-border bg-card transition-colors duration-300 md:block">
          <Sidebar />
        </aside>

        {/* Main viewing area with layout background */}
        <main className="pt-16 bg-muted/20">
          <div className="min-h-[calc(100vh-64px)] overflow-y-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
