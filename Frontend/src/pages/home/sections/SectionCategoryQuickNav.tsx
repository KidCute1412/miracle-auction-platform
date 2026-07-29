import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Watch, Palette, Gem, Landmark, Sparkles, ChevronRight, Tag } from "lucide-react";
import Card3DTilt from "@/components/common/Card3DTilt";
import { categoryService } from "@/services/category.service.ts";
import { slugify } from "@/utils/make_slug";

interface RealCategory {
  category_id: number;
  category_name: string;
  slug?: string;
  product_count?: number;
}

export const SectionCategoryQuickNav: React.FC = () => {
  const [categories, setCategories] = useState<RealCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoryService.getLevel1();
        const list = Array.isArray(response) ? response : (response?.data || []);
        setCategories(list.slice(0, 5)); // Top 5 categories
      } catch (err) {
        console.error("Failed to load level 1 categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("watch") || lower.includes("đồng hồ") || lower.includes("horology")) return Watch;
    if (lower.includes("art") || lower.includes("tranh") || lower.includes("hội họa")) return Palette;
    if (lower.includes("jewel") || lower.includes("trang sức") || lower.includes("gem")) return Gem;
    if (lower.includes("antique") || lower.includes("cổ vật") || lower.includes("history")) return Landmark;
    return Sparkles;
  };

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
          to="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:text-accent/80 transition-all hover:translate-x-1 mt-3 md:mt-0"
        >
          <span>View All Departments</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-card/20 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.category_name);
            const slug = cat.slug || slugify(cat.category_name);
            const targetUrl = `/categories/${slug}-${cat.category_id}`;

            return (
              <Card3DTilt key={cat.category_id} maxTiltDeg={6} scale={1.02}>
                <Link
                  to={targetUrl}
                  className="group relative flex flex-col justify-between p-5 h-44 rounded-2xl bg-card/40 border border-accent/20 hover:border-accent/50 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_10px_25px_rgba(226,184,59,0.08)] overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-card border border-border/60 text-accent group-hover:scale-105 group-hover:border-accent/40 transition-all duration-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                        <Tag size={10} />
                        VERIFIED
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors font-heading line-clamp-1">
                      {cat.category_name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 font-mono">
                      Department #{cat.category_id}
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
      ) : (
        <div className="text-center py-8 text-xs font-mono text-muted-foreground">
          No categories currently loaded
        </div>
      )}
    </section>
  );
};

export default SectionCategoryQuickNav;
