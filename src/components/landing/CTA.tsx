import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-coral-light/20 blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-teal/20 blur-3xl animate-blob" style={{ animationDelay: '-3s' }} />

      <div className="container relative mx-auto px-4">
        <div className="relative rounded-[2.5rem] overflow-hidden">
          {/* Gradient background with animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-coral via-coral-light to-sunshine animate-gradient-shift" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--teal-light)/0.3),transparent_50%)]" />
          
          {/* Inner decorative circles */}
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-foreground/5 blur-sm" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-foreground/5 blur-sm" />
          
          {/* Floating icons */}
          <div className="absolute top-10 left-10 w-12 h-12 rounded-xl bg-card/20 backdrop-blur-sm flex items-center justify-center animate-float">
            <Heart className="h-6 w-6 text-foreground" />
          </div>
          <div className="absolute bottom-10 right-10 w-12 h-12 rounded-xl bg-card/20 backdrop-blur-sm flex items-center justify-center animate-float-delayed">
            <Sparkles className="h-6 w-6 text-foreground" />
          </div>

          <div className="relative p-12 md:p-20 text-center">
            {/* Rocket icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-card/20 backdrop-blur-sm mb-10 animate-bounce-gentle shadow-xl">
              <Rocket className="h-12 w-12 text-foreground" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-foreground leading-tight">
              Ready to Make<br />New Friends?
            </h2>

            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Join thousands of teenagers who are building confidence and making 
              meaningful connections every day. Your journey starts with one click.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button 
                size="xl" 
                onClick={() => navigate("/auth")}
                className="bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-xl transition-all duration-300 group text-lg px-8"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl" 
                className="border-foreground/30 text-foreground hover:bg-foreground/10 text-lg px-8"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>

            <p className="mt-8 text-sm text-foreground/60 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal animate-pulse" />
              Free to join • No credit card required • Age 13-19 only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
