import { Outlet, Link } from 'react-router-dom';
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
        <div className="absolute top-20 left-16 w-32 h-32 border border-accent/20 rounded-full opacity-30 animate-float-y"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-border rotate-45 opacity-20 animate-float-drift"></div>
        <div className="absolute bottom-32 left-24 w-28 h-28 border border-accent/10 rounded-lg opacity-20 animate-float-drift-reverse"></div>
        <div className="absolute bottom-20 right-16 w-20 h-20 bg-accent/5 rounded-full opacity-30 animate-float-y"></div>

        {/* Floating tech icons */}
        <div className="absolute top-1/4 left-[15%] text-accent opacity-20 animate-float-drift">
          <Shield size={44} />
        </div>
        <div className="absolute top-1/3 right-[20%] text-muted-foreground opacity-15 animate-float-y">
          <Crown size={38} />
        </div>
        <div className="absolute bottom-1/4 left-[30%] text-accent opacity-25 animate-float-drift-reverse">
          <Award size={40} />
        </div>
        <div className="absolute bottom-1/3 right-[15%] text-accent opacity-30 animate-float-y">
          <Sparkles size={32} />
        </div>

        {/* Shooting Stars / Ray Lights */}
        {/* Group 1: Starts immediately */}
        <div className="absolute top-[2%] right-[5%] w-[250px] h-[2px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-1 pointer-events-none"></div>
        <div className="absolute top-[10%] right-[25%] w-[200px] h-[1.5px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-1 pointer-events-none"></div>
        
        {/* Group 2: Delay 3s */}
        <div className="absolute top-[15%] right-[20%] w-[180px] h-[1.5px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-2 pointer-events-none"></div>
        <div className="absolute top-[5%] right-[45%] w-[220px] h-[2px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-2 pointer-events-none"></div>
        
        {/* Group 3: Delay 7s */}
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[2.5px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-3 pointer-events-none"></div>
        <div className="absolute top-[18%] right-[50%] w-[170px] h-[1.2px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-3 pointer-events-none"></div>
        
        {/* Group 4: Delay 11s */}
        <div className="absolute top-[8%] right-[40%] w-[200px] h-[1.5px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-4 pointer-events-none"></div>
        <div className="absolute top-[25%] right-[15%] w-[280px] h-[2.2px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-4 pointer-events-none"></div>
        
        {/* Group 5: Delay 15s */}
        <div className="absolute top-[22%] right-[35%] w-[220px] h-[2px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-5 pointer-events-none"></div>
        <div className="absolute top-[12%] right-[60%] w-[190px] h-[1.5px] bg-gradient-to-r from-accent to-transparent opacity-0 origin-right animate-shooting-5 pointer-events-none"></div>
      </div>

      {/* Primary body view */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center group">
              <img
                src="/favicon.png"
                alt="Miracle Logo"
                className="h-20 w-20 object-cover hover:rotate-12 transition-transform duration-300"
              />
              <h1 className="font-heading text-5xl font-bold text-foreground mt-3 group-hover:text-accent transition-colors duration-300">
                Miracle
              </h1>
            </Link>
            <p className="text-muted-foreground text-sm font-medium mt-1">Leading Online Auction Platform</p>
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

      {/* Floating and spinning side decorators */}
      <div className="absolute top-1/2 left-8 text-accent/15 animate-float-y pointer-events-none">
        <div className="animate-spin" style={{animationDuration: '20s'}}>
          <Zap size={26} />
        </div>
      </div>
      <div className="absolute top-1/2 right-8 text-accent/15 animate-float-drift pointer-events-none">
        <div className="animate-spin" style={{animationDuration: '25s'}}>
          <Award size={30} />
        </div>
      </div>
    </div>
  );
}
