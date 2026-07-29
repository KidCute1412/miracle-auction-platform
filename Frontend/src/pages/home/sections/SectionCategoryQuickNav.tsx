import React from "react";
import { Link } from "react-router-dom";
import { Watch, Palette, Gem, Landmark, Sparkles, ChevronRight } from "lucide-react";
import Card3DTilt from "@/components/common/Card3DTilt";

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  count: string;
  icon: React.ElementType;
  gradient: string;
  slug: string;
}

const categories: CategoryItem[] = [
  {
    id: "watches",
    title: "Precision Horology",
    subtitle: "Patek, Rolex, Audemars",
    count: "142 Active Lots",
    icon: Watch,
    gradient: "from-amber-500/20 to-yellow-600/10 border-amber-500/30",
    slug: "horology-watches",
  },
  {
    id: "art",
    title: "Fine Art & Masters",
    subtitle: "Oil paintings, Sculptures",
    count: "98 Active Lots",
    icon: Palette,
    gradient: "from-purple-500/20 to-indigo-600/10 border-purple-500/30",
    slug: "fine-art",
  },
  {
    id: "jewelry",
    title: "Estate High Jewels",
    subtitle: "Rare diamonds, Emeralds",
    count: "76 Active Lots",
    icon: Gem,
    gradient: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30",
    slug: "estate-jewelry",
  },
  {
    id: "antiques",
    title: "Imperial Antiques",
    subtitle: "Porcelain, Bronze, Relics",
    count: "115 Active Lots",
    icon: Landmark,
    gradient: "from-amber-700/20 to-orange-900/10 border-amber-700/30",
    slug: "antiques-relics",
  },
  {
    id: "digital",
    title: "Rare Collectibles",
    subtitle: "Certified provenance",
    count: "54 Active Lots",
    icon: Sparkles,
    gradient: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30",
    slug: "rare-collectibles",
  },
];

export const SectionCategoryQuickNav: React.FC = () => {
  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-accent uppercase">
              CURATED DEPARTMENTS
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tight text-foreground uppercase">
            Explore Masterpiece Categories
          </h2>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:text-accent/80 transition-all hover:translate-x-1 mt-3 md:mt-0"
        >
          <span>View All Departments</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Categories Grid with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card3DTilt key={cat.id} maxTiltDeg={8} scale={1.03}>
              <Link
                to={`/products?category=${cat.slug}`}
                className={`group relative flex flex-col justify-between p-5 h-44 rounded-2xl bg-card/60 backdrop-blur-xl border transition-all duration-300 ${cat.gradient} hover:shadow-[0_12px_30px_rgba(226,184,59,0.12)] overflow-hidden`}
              >
                {/* Background radial glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-accent group-hover:scale-110 group-hover:border-accent/40 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors font-heading">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <span>Browse Department</span>
                  <ChevronRight size={12} />
                </div>
              </Link>
            </Card3DTilt>
          );
        })}
      </div>
    </section>
  );
};

export default SectionCategoryQuickNav;
