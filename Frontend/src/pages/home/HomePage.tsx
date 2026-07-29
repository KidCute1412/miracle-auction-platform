import Section1 from "@/pages/home/sections/Section1";
import SectionCategoryQuickNav from "@/pages/home/sections/SectionCategoryQuickNav";
import Section3DPedestal from "@/pages/home/sections/Section3DPedestal";
import SectionLiveTerminal from "@/pages/home/sections/SectionLiveTerminal";
import Section2 from "@/pages/home/sections/Section2";
import SectionVault3D from "@/pages/home/sections/SectionVault3D";

function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Continuous Ambient Cosmic Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-accent/[0.04] dark:bg-accent/[0.02] rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-0 w-[800px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[160px]" />
        <div className="absolute top-[70%] left-0 w-[800px] h-[500px] bg-accent/[0.03] rounded-full blur-[160px]" />
      </div>

      {/* Main Continuous Page Flow */}
      <div className="relative z-10 space-y-4">
        <Section1 />
        <SectionCategoryQuickNav />
        <Section3DPedestal />
        <SectionLiveTerminal />
        <Section2 />
        <SectionVault3D />
      </div>
    </div>
  );
}

export default Home;
