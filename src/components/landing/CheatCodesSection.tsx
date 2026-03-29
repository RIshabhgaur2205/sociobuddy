import { useNavigate } from "react-router-dom";
import { Zap, Copy, Laugh, Flame, Heart, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tones = [
  { icon: Laugh, label: "Funny", color: "text-yellow-400" },
  { icon: Flame, label: "Savage", color: "text-red-400" },
  { icon: Heart, label: "Polite", color: "text-pink-400" },
  { icon: Shield, label: "Confident", color: "text-primary" },
];

const scenarios = [
  { emoji: "👋", title: "Reply to \"Hey\" without being boring" },
  { emoji: "💬", title: "Leave a boring group chat politely" },
  { emoji: "💀", title: "Restart a dead conversation" },
  { emoji: "💘", title: "Text your crush confidently" },
];

const CheatCodesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full neon-border px-4 py-2 text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            <span>Instant Scripts</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight">
            Social <span className="text-gradient">Cheat Codes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Never feel stuck or awkward again. Ready-made scripts for every real-life situation.
          </p>
        </div>

        {/* Tone chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tones.map((tone) => (
            <div
              key={tone.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border text-sm font-bold uppercase tracking-wider"
            >
              <tone.icon className={`h-4 w-4 ${tone.color}`} />
              <span className="text-foreground">{tone.label}</span>
            </div>
          ))}
        </div>

        {/* Scenario preview cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto mb-10">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className="neon-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(120_100%_50%/0.2)] transition-all duration-300 hover:scale-[1.03] group cursor-pointer"
              onClick={() => navigate("/social-cheat-codes")}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{s.emoji}</div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{s.title}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Copy className="h-3 w-3" /> Copy & use
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/social-cheat-codes")}
            className="group uppercase font-bold tracking-wider"
          >
            View All Cheat Codes
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CheatCodesSection;
