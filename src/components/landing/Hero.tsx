import { Button } from "@/components/ui/button";
import { Heart, Users, Sparkles } from "lucide-react";
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
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-coral-light/20 blur-3xl animate-float" />
      <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-teal/10 blur-3xl animate-float-delayed" />
      <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-sunshine/20 blur-3xl animate-float-slow" />
      
      <div className="container relative mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-medium text-teal">
              <Sparkles className="h-4 w-4" />
              <span>Connect. Grow. Thrive.</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Break Free From
              <span className="block text-gradient">Social Anxiety</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              SocioBuddy connects teenagers studying in school, helping you overcome 
              social anxiety and build meaningful friendships. Your journey to becoming 
              more confident starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
                <Heart className="h-5 w-5" />
                Join SocioBuddy
              </Button>
              <Button variant="hero-outline" size="xl" onClick={scrollToHowItWorks}>
                <Users className="h-5 w-5" />
                See How It Works
              </Button>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-coral-light to-teal flex items-center justify-center text-primary-foreground text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Teens already connected</p>
              </div>
            </div>
          </div>
          
          {/* Right illustration */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 gradient-hero rounded-3xl blur-2xl opacity-30 animate-pulse-soft" />
            <img
              src={heroImage}
              alt="Diverse teenagers connecting and supporting each other"
              className="relative rounded-3xl shadow-card w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
