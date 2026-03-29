import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const characters = [
  { emoji: "😎", name: "Cool Crush", desc: "Practice flirting" },
  { emoji: "😡", name: "Rude Cashier", desc: "Handle difficult people" },
  { emoji: "👨‍🏫", name: "Strict Teacher", desc: "Speak up in class" },
  { emoji: "🤝", name: "Stranger at Party", desc: "Make small talk" },
];

const SocialGymSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full neon-border px-4 py-2 text-sm font-medium text-primary mb-6">
            <Dumbbell className="h-4 w-4" />
            <span>AI Battle Mode</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight">
            Social <span className="text-gradient">Gym</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Level up your social skills in 60 seconds. Practice real conversations with AI characters.
          </p>
        </div>

        {/* Character cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto mb-10">
          {characters.map((char, i) => (
            <div
              key={i}
              className="neon-border rounded-2xl p-6 bg-card/50 backdrop-blur-sm text-center hover:shadow-[0_0_30px_hsl(120_100%_50%/0.2)] transition-all duration-300 hover:scale-[1.03] group cursor-pointer"
              onClick={() => navigate("/social-gym")}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{char.emoji}</div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{char.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{char.desc}</p>
            </div>
          ))}
        </div>

        {/* Gamification teaser */}
        <div className="flex justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Confidence Score</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">🏆</span>
            <span>Level Up System</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">🔄</span>
            <span>Retry & Improve</span>
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/social-gym")}
            className="group uppercase font-bold tracking-wider"
          >
            Enter the Gym
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SocialGymSection;
