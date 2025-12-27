import { Button } from "@/components/ui/button";
import { Heart, Users, Sparkles, ArrowRight, Star, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.png";

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
      {/* Animated background blobs */}
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-coral-light/30 to-sunshine/20 blur-3xl animate-blob" />
      <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-teal/20 to-mint/30 blur-3xl animate-blob" style={{ animationDelay: '-2s' }} />
      <div className="absolute bottom-20 right-1/4 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-sunshine/25 to-lavender/20 blur-3xl animate-blob" style={{ animationDelay: '-4s' }} />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container relative mx-auto px-4 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-5 py-2.5 text-sm font-semibold text-foreground animate-fade-in shadow-soft">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-sunshine" />
                <span>Connect. Grow. Thrive.</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-sunshine text-sunshine" />
                <span className="text-xs">4.9/5 Rating</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Break Free From
              <span className="block text-gradient-animated mt-2">Social Anxiety</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              SocioBuddy connects teenagers studying in school, helping you overcome 
              social anxiety and build meaningful friendships. Your journey to becoming 
              more confident starts here.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate("/auth")}
                className="group shadow-glow hover:shadow-[0_0_60px_hsl(var(--coral)/0.4)] transition-all duration-300"
              >
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Join SocioBuddy
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl" 
                onClick={scrollToHowItWorks}
                className="group"
              >
                <Users className="h-5 w-5" />
                See How It Works
              </Button>
            </div>
            
            {/* Social proof */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-11 w-11 rounded-full border-3 border-background bg-gradient-to-br from-coral-light via-teal to-sunshine flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-extrabold text-2xl text-foreground">10,000+</p>
                  <p className="text-sm text-muted-foreground">Teens already connected</p>
                </div>
              </div>
              
              {/* Trust badges */}
              <div className="flex items-center gap-4 sm:ml-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-teal" />
                  <span>Safe & Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-sunshine" />
                  <span>Free to Start</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right illustration */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            {/* Glow effect */}
            <div className="absolute inset-0 gradient-hero rounded-[2rem] blur-3xl opacity-40 animate-pulse-soft scale-95" />
            
            {/* Main image container */}
            <div className="relative">
              {/* Decorative floating elements */}
              <div className="absolute -top-6 -left-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center shadow-lg animate-float z-10">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-xl bg-gradient-to-br from-sunshine to-accent flex items-center justify-center shadow-lg animate-float-delayed z-10">
                <Heart className="h-8 w-8 text-foreground" />
              </div>
              <div className="absolute top-1/2 -right-8 w-14 h-14 rounded-full bg-gradient-to-br from-coral-light to-coral flex items-center justify-center shadow-lg animate-float-slow z-10">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              
              {/* Main image */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-border/20">
                <img
                  src={heroImage}
                  alt="Diverse teenagers connecting and supporting each other"
                  className="w-full object-cover"
                />
                {/* Shimmer overlay */}
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="hsl(var(--muted) / 0.5)"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
