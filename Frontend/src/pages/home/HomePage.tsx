import Section1 from "@/pages/home/sections/Section1";
import SectionCategoryQuickNav from "@/pages/home/sections/SectionCategoryQuickNav";
import Section3DPedestal from "@/pages/home/sections/Section3DPedestal";
import SectionLiveTerminal from "@/pages/home/sections/SectionLiveTerminal";
import Section2 from "@/pages/home/sections/Section2";
import SectionVault3D from "@/pages/home/sections/SectionVault3D";

function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Section1 />
      <SectionCategoryQuickNav />
      <Section3DPedestal />
      <SectionLiveTerminal />
      <Section2 />
      <SectionVault3D />
    </div>
  );
}

export default Home;
