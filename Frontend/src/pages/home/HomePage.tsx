import React, { Suspense, lazy } from "react";
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

function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Continuous Ambient Cosmic Mesh Background (responsive GPU optimization) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1200px] h-[300px] md:h-[600px] bg-accent/[0.04] dark:bg-accent/[0.02] rounded-full blur-[80px] md:blur-[140px]" />
        <div className="hidden sm:block absolute top-[35%] right-0 w-[800px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[160px]" />
        <div className="hidden sm:block absolute top-[70%] left-0 w-[800px] h-[500px] bg-accent/[0.03] rounded-full blur-[160px]" />
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
