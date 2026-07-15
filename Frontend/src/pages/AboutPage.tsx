import React from "react";
import { Code, Server, Award, Github, Mail, Zap, Radio, CreditCard, ShoppingBag, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

const HeaderSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`relative bg-gradient-to-b from-background via-accent/5 to-background py-20 md:py-28 overflow-hidden transition-all duration-1000 ease-out ${
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
      }`}
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-glass border border-accent/30 rounded-full mb-6 shadow-gold-glow">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-[10px] font-bold text-accent font-syne uppercase tracking-[0.25em]">
            Elite Auction Platform
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-foreground mb-6 leading-tight tracking-tight">
          Crafting The Future of <br className="hidden md:inline" />
          <span className="animate-text-shimmer bg-gradient-to-r from-accent via-amber-200 to-accent bg-clip-text text-transparent">
            Digital Luxury Trading
          </span>
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          An elite online auction platform meticulously engineered by a visionary team, delivering a highly secure, transparent, and prestigious trading ecosystem.
        </p>
      </div>
    </div>
  );
};

const ProjectOverview = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  const features = [
    {
      icon: Zap,
      title: "Smart Auto-Bidding",
      description: "Pre-set maximum bid limits; our system dynamically outbids competitors in real-time.",
      color: "from-accent via-amber-500 to-amber-600",
    },
    {
      icon: Radio,
      title: "Real-Time Updates",
      description: "Sub-millisecond socket connections ensure instant bid notifications and live updates.",
      color: "from-amber-400 via-amber-500 to-accent",
    },
    {
      icon: CreditCard,
      title: "Prestigious Checkouts",
      description: "Seamless and secure transaction gateways protected by enterprise-grade cryptographic layers.",
      color: "from-accent via-yellow-500 to-amber-500",
    },
    {
      icon: Github,
      title: "Transparent Source",
      description: "Our complete architecture is open on GitHub, welcoming security audits and contributions.",
      color: "from-neutral-400 via-neutral-500 to-neutral-600",
    },
    {
      icon: ShoppingBag,
      title: "Premium Catalogs",
      description: "Curated collections and verified items aggregated from the most trusted global catalogs.",
      color: "from-accent via-amber-300 to-yellow-500",
    },
    {
      icon: CheckCircle2,
      title: "KYC Verification",
      description: "Rigorous seller and bidder verification processes ensuring a fraud-free ecosystem.",
      color: "from-yellow-500 via-amber-500 to-accent",
    },
  ];

  return (
    <div
      ref={ref}
      className={`max-w-5xl mx-auto px-4 py-16 transition-all duration-1000 ease-out ${
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-foreground mb-4 tracking-tight">
          The MIRACLE Architecture
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-4"></div>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          An assembly of state-of-the-art features engineered to redefine the excitement and security of real-time online bidding.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Glowing Timeline Bar */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/5 via-accent/30 to-accent/5 transform -translate-x-1/2"></div>

        <div className="relative space-y-16">
          {features.map((feature, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex items-center ${isLeft ? "flex-row" : "flex-row-reverse"} gap-6`}
              >
                {/* Feature Card */}
                <div
                  className={`w-5/12 group relative bg-glass/30 rounded-2xl p-6 border border-border/40 hover:border-accent/40 hover:shadow-gold-glow/10 transition-all duration-500 hover:-translate-y-1.5 ${
                    isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Subtle hover glow backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  
                  <div className="relative flex flex-col sm:flex-row items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
                      <div className={`relative w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg border border-white/10 group-hover:rotate-6 transition-transform duration-300`}>
                        <feature.icon className="w-5.5 h-5.5 text-black font-bold" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground mb-1.5 tracking-tight group-hover:text-accent transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connector Dot with pulses */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-br ${feature.color} shadow-lg border-2 border-background flex items-center justify-center ${
                      isIntersecting ? "scale-100" : "scale-0"
                    } transition-all duration-500`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-background animate-ping"></div>
                  </div>
                </div>

                {/* Branch Line */}
                <div className={`w-5/12 h-[1px] ${isLeft ? "mr-auto" : "ml-auto"}`}>
                  <div
                    className={`h-full bg-gradient-to-${isLeft ? "r" : "l"} from-accent/30 to-transparent ${
                      isIntersecting ? "opacity-100" : "opacity-0"
                    } transition-opacity duration-700`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TechnologiesSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`max-w-5xl mx-auto px-4 py-12 transition-all duration-1000 ease-out ${
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Frontend Technologies info panel */}
        <div className="group relative bg-glass/30 rounded-2xl border border-border/40 p-8 text-center hover:border-accent/40 hover:shadow-gold-glow/10 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-md opacity-30 mx-auto w-14 h-14"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-accent to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <Code className="w-6 h-6 text-black" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1.5 tracking-tight">Vibrant Frontend</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed font-light">
              Crafted using React 19, TypeScript, Tailwind CSS, and optimized with custom high-performance rendering.
            </p>
            <div className="inline-flex items-center px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
              <span className="text-accent font-semibold text-xs tracking-wider font-syne">React + TypeScript</span>
            </div>
          </div>
        </div>

        {/* Backend Technologies info panel */}
        <div className="group relative bg-glass/30 rounded-2xl border border-border/40 p-8 text-center hover:border-accent/40 hover:shadow-gold-glow/10 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
          <div className="absolute -left-16 -top-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>

          <div className="relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-md opacity-30 mx-auto w-14 h-14"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <Server className="w-6 h-6 text-black" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1.5 tracking-tight">Robust Backend</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed font-light">
              Powered by Node.js, Express, Knex, PostgreSQL, and Redis to achieve extreme throughput and absolute bid consistency.
            </p>
            <div className="inline-flex items-center px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-amber-400 font-semibold text-xs tracking-wider font-syne">Node.js + Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`max-w-5xl mx-auto px-4 py-12 transition-all duration-1000 ease-out ${
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-foreground mb-4 tracking-tight">
          Development Team
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground font-light">The visionaries behind MIRACLE</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Developer Member 1 */}
        <div className="group relative bg-glass/30 rounded-3xl border border-border/40 p-8 text-center hover:border-accent/40 hover:shadow-gold-glow/15 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="relative mb-6 inline-block">
              {/* Spinning borders effect */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-accent to-amber-500 rounded-full opacity-30 group-hover:opacity-100 group-hover:animate-spin duration-1000 transition-opacity blur-[2px]"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-background">
                <span className="text-3xl font-extrabold text-accent font-heading">LT</span>
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-br from-accent to-amber-500 rounded-full border-2 border-background shadow-md flex items-center justify-center">
                <Award className="w-4 h-4 text-black font-bold" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-1.5 tracking-tight">Lê Tuấn Lộc</h3>
            <div className="inline-flex items-center px-4 py-1 bg-accent/10 border border-accent/20 rounded-full mb-5">
              <span className="text-accent font-semibold text-xs tracking-wider font-syne">Full-Stack Developer</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed max-w-sm mx-auto font-light">
              Specialized in crafting modern, fluid interfaces and ensuring smooth interactive animations.
            </p>
            <div className="flex justify-center space-x-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-neutral-900/50 hover:bg-accent border border-border/50 hover:border-accent rounded-xl text-muted-foreground hover:text-black transition-all cursor-pointer shadow-sm hover:scale-110"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-2.5 bg-neutral-900/50 hover:bg-accent border border-border/50 hover:border-accent rounded-xl text-muted-foreground hover:text-black transition-all cursor-pointer shadow-sm hover:scale-110"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Developer Member 2 */}
        <div className="group relative bg-glass/30 rounded-3xl border border-border/40 p-8 text-center hover:border-accent/40 hover:shadow-gold-glow/15 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          <div className="relative z-10">
            <div className="relative mb-6 inline-block">
              {/* Spinning borders effect */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full opacity-30 group-hover:opacity-100 group-hover:animate-spin duration-1000 transition-opacity blur-[2px]"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-background">
                <span className="text-3xl font-extrabold text-amber-400 font-heading">NT</span>
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full border-2 border-background shadow-md flex items-center justify-center">
                <Award className="w-4 h-4 text-black font-bold" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-1.5 tracking-tight">Nguyễn Thanh Tiến</h3>
            <div className="inline-flex items-center px-4 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-5">
              <span className="text-amber-400 font-semibold text-xs tracking-wider font-syne">Full-Stack Developer</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed max-w-sm mx-auto font-light">
              Expert in highly available backend infrastructures, low latency databases, and security standard optimization.
            </p>
            <div className="flex justify-center space-x-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-neutral-900/50 hover:bg-accent border border-border/50 hover:border-accent rounded-xl text-muted-foreground hover:text-black transition-all cursor-pointer shadow-sm hover:scale-110"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-2.5 bg-neutral-900/50 hover:bg-accent border border-border/50 hover:border-accent rounded-xl text-muted-foreground hover:text-black transition-all cursor-pointer shadow-sm hover:scale-110"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MissionSection = () => {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`max-w-5xl mx-auto px-4 py-16 transition-all duration-1000 ease-out ${
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div className="relative bg-glass/30 rounded-3xl p-8 md:p-14 text-center border border-accent/25 shadow-gold-glow overflow-hidden">
        {/* Glow rings in backend */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-40 mx-auto w-16 h-16"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-accent to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-white/10">
              <ShieldCheck className="w-8 h-8 text-black" />
            </div>
          </div>

          <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-4 tracking-tight">
            Our Elite Mission
          </h3>
          <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            To build the world’s most secure and luxurious online bidding arena. Through decentralized transparency, premium styling, and flawless engineering, we strive to make online trading a thrilling and trusted journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen pb-12 transition-colors duration-300">
      <HeaderSection />
      <ProjectOverview />
      <TechnologiesSection />
      <TeamSection />
      <MissionSection />
    </div>
  );
}
