import { useEffect, useState } from "react";
import { Trophy, Award, ShoppingBag, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatVnd } from "@/lib/money";

interface VictoryVaultRevealProps {
  product_id: number;
  product_name?: string;
  winningPrice?: string | number;
}

export default function VictoryVaultReveal({
  product_id,
  product_name,
  winningPrice,
}: VictoryVaultRevealProps) {
  const navigate = useNavigate();
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    // Generate gold confetti particles
    const list = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      size: 6 + Math.random() * 10,
    }));
    setParticles(list);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-card to-yellow-500/10 border-2 border-amber-500/50 p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] animate-in zoom-in-95 duration-700">
      {/* Floating Gold Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-400 opacity-70 animate-float-particle"
            style={{
              left: `${p.left}%`,
              bottom: "-20px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-4">
        {/* Victory Medallion */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg shadow-amber-500/40 animate-bounce">
          <Trophy className="w-10 h-10 text-black" />
          <div className="absolute -top-1 -right-1 p-1 bg-black rounded-full border border-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Award className="w-3.5 h-3.5" /> AUCTION WON!
          </span>
          <h3 className="text-2xl font-extrabold text-foreground font-heading">
            Congratulations! You won {product_name || "this item"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Winning Bid Amount: <strong className="text-amber-400 font-bold">{formatVnd(winningPrice)} VND</strong>
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate(`/winner-order?product_id=${product_id}`)}
            className="group relative w-full sm:w-auto px-8 py-3.5 cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
          >
            <ShoppingBag className="w-5 h-5 text-black" />
            <span>CLAIM & CONFIRM ORDER</span>
          </button>
        </div>
      </div>
    </div>
  );
}
