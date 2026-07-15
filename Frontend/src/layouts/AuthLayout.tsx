import { Outlet } from 'react-router-dom';
import {
  Shield,
  Star,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Heart,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from "@/contexts/ThemeContext";

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        type="button"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors duration-200 cursor-pointer shadow-sm"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Elegant background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-gradient-to-br from-accent/25 to-transparent"></div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-16 w-32 h-32 border border-accent/20 rounded-full opacity-30"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-border rotate-45 opacity-20"></div>
        <div className="absolute bottom-32 left-24 w-28 h-28 border border-accent/10 rounded-lg opacity-20"></div>
        <div className="absolute bottom-20 right-16 w-20 h-20 bg-accent/5 rounded-full opacity-30"></div>

        {/* Floating tech icons */}
        <div className="absolute top-1/4 left-[15%] text-accent opacity-20">
          <Shield size={44} />
        </div>
        <div className="absolute top-1/3 right-[20%] text-muted-foreground opacity-15">
          <Crown size={38} />
        </div>
        <div className="absolute bottom-1/4 left-[30%] text-accent opacity-25">
          <Award size={40} />
        </div>
        <div className="absolute bottom-1/3 right-[15%] text-accent opacity-30 animate-pulse">
          <Sparkles size={32} />
        </div>
      </div>

      {/* Primary body view */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl">
          {/* Brand header */}
          <div className="text-center mb-6">
            <h1 className="font-heading text-3xl font-bold text-foreground mt-3">Miracle</h1>
            <p className="text-muted-foreground text-sm font-medium">Leading Online Auction Platform</p>
          </div>

          {/* Form wrapper */}
          <div className="mx-auto overflow-hidden">
            <Outlet />

            {/* Quality indicators */}
            <div className="py-4 border-t border-border mt-6 bg-card/20 rounded-xl max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  <span>Trustworthy</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  <span>Reputable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium rating tag */}
          <div className="text-center mt-6">
            <div className="flex justify-center space-x-1 mb-2">
              <Star className="w-3.5 h-3.5 text-accent fill-current" />
              <Star className="w-3.5 h-3.5 text-accent fill-current" />
              <Star className="w-3.5 h-3.5 text-accent fill-current" />
              <Star className="w-3.5 h-3.5 text-accent fill-current" />
              <Star className="w-3.5 h-3.5 text-accent fill-current" />
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
              Vietnam's Premium Auction Platform
            </p>
          </div>
        </div>
      </div>

      {/* Spinning side decorators */}
      <div className="absolute top-1/2 left-8 text-accent/15 animate-spin pointer-events-none" style={{animationDuration: '20s'}}>
        <Zap size={26} />
      </div>
      <div className="absolute top-1/2 right-8 text-accent/15 animate-spin pointer-events-none" style={{animationDuration: '25s'}}>
        <Award size={30} />
      </div>
    </div>
  );
}
