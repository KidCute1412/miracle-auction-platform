import React, { Suspense, lazy, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/ProtectedRouter";
import Section1 from "@/pages/home/sections/Section1";
import SectionCategoryQuickNav from "@/pages/home/sections/SectionCategoryQuickNav";

// Lazy-loaded below-the-fold components
const Section3DPedestal = lazy(() => import("@/pages/home/sections/Section3DPedestal"));
const SectionLiveTerminal = lazy(() => import("@/pages/home/sections/SectionLiveTerminal"));
const Section2 = lazy(() => import("@/pages/home/sections/Section2"));
const SectionVault3D = lazy(() => import("@/pages/home/sections/SectionVault3D"));

// Loading skeleton fallback helper
const SectionFallback = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="h-64 rounded-3xl bg-card/20 border border-accent/10 animate-pulse" />
  </div>
);

export const ADMIN_INITIAL_REDIRECT_KEY = "admin_initial_redirect_done";

function Home() {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (auth?.role === "admin") {
      try {
        const hasRedirected = sessionStorage.getItem(ADMIN_INITIAL_REDIRECT_KEY);
        if (!hasRedirected) {
          sessionStorage.setItem(ADMIN_INITIAL_REDIRECT_KEY, "true");
          navigate("/admin/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Failed to read/write sessionStorage for admin redirect guard:", err);
      }
    }
  }, [auth, loading, navigate]);

  // Prevent flash of storefront content when admin enters root initially in this session
  const isFirstAdminSessionVisit =
    !loading &&
    auth?.role === "admin" &&
    typeof window !== "undefined" &&
    !sessionStorage.getItem(ADMIN_INITIAL_REDIRECT_KEY);

  if (isFirstAdminSessionVisit) {
    return null;
  }
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Continuous Ambient Cosmic Mesh Background (responsive GPU optimization) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] md:w-[900px] h-[250px] md:h-[450px] bg-accent/[0.04] dark:bg-accent/[0.02] rounded-full blur-[60px] md:blur-[80px]" />
        <div className="hidden sm:block absolute top-[35%] right-0 w-[600px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[80px]" />
        <div className="hidden sm:block absolute top-[70%] left-0 w-[600px] h-[400px] bg-accent/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* Main Continuous Page Flow */}
      <div className="relative z-10 space-y-4">
        <Section1 />
        <SectionCategoryQuickNav />
        <Suspense fallback={<SectionFallback />}>
          <Section3DPedestal />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SectionLiveTerminal />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Section2 />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SectionVault3D />
        </Suspense>
      </div>
    </div>
  );
}

export default Home;
