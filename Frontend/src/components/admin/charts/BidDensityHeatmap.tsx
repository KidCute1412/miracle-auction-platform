import { Clock } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const slots = ["00–04", "04–08", "08–12", "12–16", "16–20", "20–24"];

export function BidDensityHeatmap({ rangeLabel, data }: {
  rangeLabel: string;
  data: Array<{ day: number; hour: number; bids: number }>;
}) {
  const matrix = days.map((_, day) => slots.map((__, slot) =>
    data.filter((point) => point.day === day && Math.floor(point.hour / 4) === slot)
      .reduce((sum, point) => sum + point.bids, 0)));
  const max = Math.max(1, ...matrix.flat());
  return (
    <section className="bg-card border border-border/80 rounded-2xl p-5 shadow-md space-y-4">
      <header className="border-b border-border pb-3">
        <h3 className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />Bidding Traffic Density</h3>
        <p className="text-[11px] text-muted-foreground mt-1">PostgreSQL bid volume by weekday and hour ({rangeLabel}).</p>
      </header>
      <div className="overflow-x-auto">
        <div className="min-w-[520px] grid grid-cols-7 gap-1 text-[10px] font-mono">
          <span />
          {slots.map((slot) => <span key={slot} className="text-center text-muted-foreground">{slot}</span>)}
          {matrix.flatMap((row, day) => [
            <span key={`d-${day}`} className="font-bold self-center">{days[day]}</span>,
            ...row.map((value, slot) => <span
              key={`${day}-${slot}`}
              title={`${days[day]} ${slots[slot]}: ${value} bids`}
              className="h-8 rounded flex items-center justify-center border border-accent/20"
              style={{ backgroundColor: `oklch(0.78 0.09 75 / ${0.06 + (value / max) * 0.84})` }}
            >{value}</span>),
          ])}
        </div>
      </div>
    </section>
  );
}
