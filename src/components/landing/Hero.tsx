import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, MessageSquare, AlertTriangle, Users, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-gaming.png";

const features = [
  { icon: Gamepad2, label: "Life Cheat Codes" },
  { icon: MessageSquare, label: "Social Gym" },
  { icon: AlertTriangle, label: "SOS Panic Room" },
  { icon: Users, label: "Community" },
  { icon: ShieldCheck, label: "Mentor Support" },
];

const Hero = () => {
  const navigate = useNavigate();
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated background effects */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl animate-blob" />
      <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-blob" style={{ animationDelay: '-2s' }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(120_100%_45%/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(120_100%_45%/0.05)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container relative mx-auto px-4 pt-28 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.1] animate-fade-in uppercase tracking-tight">
              <span className="text-gradient-animated">SocioBuddy.in:</span>
              <span className="block text-foreground mt-1">Your Digital</span>
              <span className="block text-foreground">Wingman.</span>
            </h1>
            
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground animate-fade-in uppercase tracking-wide" style={{ animationDelay: '0.1s' }}>
              Stressed? Anxious?<br />
              Find Your Crew Here.
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Feeling Stuck? SocioBuddy.in is Where Your People Live. Connect, Chill, 
              & Grow—Exactly What You Need. We're the community for Teens where 
              you find support, life cheat codes, and your vibe. Join thousands 
              building confidence and real friendships.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate("/auth")} 
                className="group shadow-neon hover:shadow-[0_0_60px_hsl(120_100%_50%/0.4)] transition-all duration-300 uppercase font-bold tracking-wider"
              >
                Find Your Crew (Free!)
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl" 
                onClick={scrollToHowItWorks} 
                className="group uppercase font-bold tracking-wider"
              >
                Explore Features
              </Button>
            </div>
          </div>
          
          {/* Right illustration */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-3xl opacity-40 animate-pulse-soft scale-95" />
            
            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden">
                <img 
                  src={heroImage} 
                  alt="Two teens doing a fist bump in gaming style" 
                  className="w-full max-h-[400px] object-cover object-top" 
                  width={1024}
                  height={1024}
                />
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className="neon-border rounded-2xl p-4 md:p-6 flex flex-col items-center gap-3 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <feature.icon className="h-8 w-8 text-primary group-hover:drop-shadow-[0_0_8px_hsl(120_100%_50%/0.8)] transition-all" />
              <span className="text-xs md:text-sm font-bold text-foreground uppercase tracking-wider text-center">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
