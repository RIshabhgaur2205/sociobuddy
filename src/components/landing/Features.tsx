import { Shield, Zap, Globe, MessageSquare, GraduationCap, Trophy, Sparkles } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Private",
    description: "Your privacy matters. All chats are secure and monitored to ensure a safe environment for teens.",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Get matched with like-minded teens instantly based on your interests and personality.",
  },
  {
    icon: Globe,
    title: "School Communities",
    description: "Connect with students from your school or discover friends from schools nearby.",
  },
  {
    icon: GraduationCap,
    title: "Expert Mentorship",
    description: "Connect with verified mentors who can guide you in building confidence and social skills.",
  },
  {
    icon: MessageSquare,
    title: "Ice Breakers",
    description: "Not sure what to say? Our fun conversation starters make chatting easy and stress-free.",
  },
  {
    icon: Trophy,
    title: "Social Challenges",
    description: "Complete fun challenges to step out of your comfort zone and earn achievement badges.",
  },
];

const Features = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/4 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full neon-border px-4 py-2 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Packed with Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Everything You Need to
            <span className="block text-gradient mt-2">Build Confidence</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Designed specifically for teenagers, with features that make social connections feel natural and fun.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative neon-border rounded-3xl p-8 hover-lift animate-fade-in bg-card/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>

              <h3 className="relative text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="relative text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
