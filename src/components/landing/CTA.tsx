import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-blob" style={{ animationDelay: '-3s' }} />

      <div className="container relative mx-auto px-4">
        <div className="relative rounded-[2.5rem] overflow-hidden neon-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-primary/10" />
          
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-sm" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-sm" />
          
          <div className="absolute top-10 left-10 w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-float">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div className="absolute bottom-10 right-10 w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-float-delayed">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>

          <div className="relative p-12 md:p-20 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 border border-primary/30 mb-10 animate-bounce-gentle">
              <Rocket className="h-12 w-12 text-primary" />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-foreground leading-tight">
              Ready to Find<br />Your Crew?
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Join thousands of teenagers who are building confidence and making 
              meaningful connections every day. Your journey starts with one click.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button 
                size="xl" 
                onClick={() => navigate("/auth")}
                className="shadow-neon hover:scale-105 transition-all duration-300 group text-lg px-8 uppercase font-bold tracking-wider"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl" 
                className="text-lg px-8 uppercase font-bold tracking-wider"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </Button>
            </div>

            <p className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              Free to join • No credit card required • Age 13-19 only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
