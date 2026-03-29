import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOSPanicSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-destructive/5" />
      <div className="absolute -top-20 right-0 h-[300px] w-[300px] rounded-full bg-destructive/10 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/30 bg-destructive/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-destructive">Emergency Support</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-foreground">
            SOS <span className="text-destructive">Panic Room</span>
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Stuck in an awkward situation? Having a panic attack? Being bullied? Get instant AI-powered guidance to help you through any social crisis — right now.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            {["Panic Attacks", "Bullying", "Social Anxiety", "Friend Drama", "Loneliness"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>

          <Button
            onClick={() => navigate("/sos-panic-room")}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase tracking-wider group"
            size="lg"
          >
            Enter Panic Room
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SOSPanicSection;
