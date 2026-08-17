import { cn } from "@/lib/utils";

function Block({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded bg-muted", className)} />;
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div aria-label="Loading products" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
          <Block className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5"><Block className="h-5 w-4/5" /><Block className="h-4 w-2/5" /><Block className="h-7 w-3/5" /><Block className="h-10 w-full rounded-xl" /></div>
        </article>
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-label="Loading categories" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card"><Block className="aspect-[16/9] w-full rounded-none" /><div className="space-y-3 p-5"><Block className="h-5 w-3/5" /><Block className="h-4 w-4/5" /></div></div>)}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main aria-label="Loading product details" className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <section className="space-y-4"><Block className="aspect-square w-full rounded-2xl" /><div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }, (_, index) => <Block key={index} className="aspect-square" />)}</div></section>
      <section className="space-y-5"><Block className="h-4 w-1/4" /><Block className="h-10 w-4/5" /><Block className="h-5 w-2/5" /><div className="space-y-3 rounded-2xl border border-border bg-card p-5"><Block className="h-8 w-1/2" /><Block className="h-12 w-full rounded-xl" /><Block className="h-12 w-full rounded-xl" /></div><Block className="h-28 w-full rounded-2xl" /></section>
    </main>
  );
}

export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return <div aria-label="Loading section" className="space-y-3 rounded-2xl border border-border bg-card p-5">{Array.from({ length: rows }, (_, index) => <div key={index} className="space-y-2"><Block className="h-4 w-1/4" /><Block className={cn("h-4", index % 2 === 0 ? "w-full" : "w-4/5")} /></div>)}</div>;
}

export function AdminTableSkeleton({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <div aria-label="Loading admin records" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="hidden lg:block"><div className="grid gap-5 border-b border-border bg-muted/20 p-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }, (_, index) => <Block key={index} className="h-3" />)}</div>{Array.from({ length: rows }, (_, row) => <div key={row} className="grid gap-5 border-b border-border/50 p-5 last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }, (_, column) => <Block key={column} className={cn("h-5", column === 0 ? "w-4/5" : "w-full")} />)}</div>)}</div>
      <div className="space-y-4 p-4 lg:hidden">{Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-3 rounded-xl border border-border p-4"><Block className="h-5 w-3/5" /><Block className="h-4 w-full" /><Block className="h-4 w-4/5" /><Block className="h-9 w-full rounded-lg" /></div>)}</div>
    </div>
  );
}

export function AdminDetailSkeleton() {
  return <div aria-label="Loading admin details" className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8"><Block className="h-9 w-1/3" /><div className="grid gap-6 lg:grid-cols-[12rem_1fr]"><Block className="aspect-square w-full rounded-2xl" /><div className="space-y-4 rounded-2xl border border-border bg-card p-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex justify-between gap-6"><Block className="h-4 w-1/4" /><Block className="h-4 w-1/2" /></div>)}</div></div></div>;
}

export function DashboardSkeleton() {
  return <main aria-label="Loading dashboard" className="space-y-6 p-4 sm:p-8"><div className="flex justify-between"><div className="space-y-3"><Block className="h-4 w-28" /><Block className="h-9 w-56" /></div><Block className="h-10 w-40 rounded-xl" /></div><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-3 rounded-2xl border border-border bg-card p-5"><Block className="h-5 w-5" /><Block className="h-4 w-2/5" /><Block className="h-8 w-3/5" /></div>)}</section><div className="h-80 rounded-2xl border border-border bg-card p-6"><Block className="h-5 w-2/5" /><Block className="mt-5 h-56 w-full rounded-xl" /></div></main>;
}
