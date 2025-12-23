import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-coral-light/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="gradient-hero rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Inner decorative circles */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-foreground/5" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-foreground/5" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card/20 backdrop-blur-sm mb-8 animate-bounce-gentle">
              <Rocket className="h-10 w-10 text-foreground" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground">
              Ready to Make New Friends?
            </h2>

            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-10">
              Join thousands of teenagers who are building confidence and making 
              meaningful connections every day. Your journey starts with one click.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-lg">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl" className="border-foreground/30 text-foreground hover:bg-foreground/10">
                Download App
              </Button>
            </div>

            <p className="mt-6 text-sm text-foreground/60">
              Free to join • No credit card required • Age 13-19 only
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
