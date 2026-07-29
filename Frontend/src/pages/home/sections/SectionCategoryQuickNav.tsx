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
  slug: string;
}

const categories: CategoryItem[] = [
  {
    id: "watches",
    title: "Precision Horology",
    subtitle: "Patek, Rolex, Audemars",
    count: "142 Lots",
    icon: Watch,
    slug: "horology-watches",
  },
  {
    id: "art",
    title: "Fine Art & Masters",
    subtitle: "Oil paintings, Sculptures",
    count: "98 Lots",
    icon: Palette,
    slug: "fine-art",
  },
  {
    id: "jewelry",
    title: "Estate High Jewels",
    subtitle: "Rare diamonds, Emeralds",
    count: "76 Lots",
    icon: Gem,
    slug: "estate-jewelry",
  },
  {
    id: "antiques",
    title: "Imperial Antiques",
    subtitle: "Porcelain, Bronze, Relics",
    count: "115 Lots",
    icon: Landmark,
    slug: "antiques-relics",
  },
  {
    id: "digital",
    title: "Rare Collectibles",
    subtitle: "Certified provenance",
    count: "54 Lots",
    icon: Sparkles,
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
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
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

      {/* Categories Grid with Silky 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card3DTilt key={cat.id} maxTiltDeg={6} scale={1.02}>
              <Link
                to={`/products?category=${cat.slug}`}
                className="group relative flex flex-col justify-between p-5 h-44 rounded-2xl bg-card/40 border border-accent/20 hover:border-accent/50 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_10px_25px_rgba(226,184,59,0.08)] overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60 text-accent group-hover:scale-105 group-hover:border-accent/40 transition-all duration-300">
                      <Icon className="w-4 h-4" />
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

                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-accent uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
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
