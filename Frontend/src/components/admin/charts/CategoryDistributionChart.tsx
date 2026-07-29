import { PieChart } from "lucide-react";

export interface CategorySegment { name: string; value: number; color: string; }
export function CategoryDistributionChart({ data }: { data: CategorySegment[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <section className="bg-card border border-border/80 rounded-2xl p-5 shadow-md space-y-4">
      <header className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold flex items-center gap-2"><PieChart className="w-4 h-4 text-amber-500" />Auction Category Distribution</h3>
        <span className="text-[10px] font-mono text-amber-500">{data.length} CATEGORIES</span>
      </header>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No auctions in this range.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const share = total ? (item.value / total) * 100 : 0;
            return <div key={item.name}>
              <div className="flex justify-between text-xs mb-1"><span>{item.name}</span><span className="font-mono">{item.value} ({share.toFixed(1)}%)</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: item.color }} /></div>
            </div>;
          })}
        </div>
      )}
    </section>
  );
}
