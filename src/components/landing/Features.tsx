import { Shield, Zap, Globe, MessageSquare, GraduationCap, Trophy, Sparkles } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Private",
    description: "Your privacy matters. All chats are secure and monitored to ensure a safe environment for teens.",
    gradient: "from-coral-light to-coral",
    bgGradient: "from-coral/5 to-coral-light/10",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Get matched with like-minded teens instantly based on your interests and personality.",
    gradient: "from-teal to-teal-light",
    bgGradient: "from-teal/5 to-teal-light/10",
  },
  {
    icon: Globe,
    title: "School Communities",
    description: "Connect with students from your school or discover friends from schools nearby.",
    gradient: "from-sunshine to-accent",
    bgGradient: "from-sunshine/5 to-accent/10",
  },
  {
    icon: GraduationCap,
    title: "Expert Mentorship",
    description: "Connect with verified mentors who can guide you in building confidence and social skills.",
    gradient: "from-lavender to-coral-light",
    bgGradient: "from-lavender/10 to-coral-light/5",
  },
  {
    icon: MessageSquare,
    title: "Ice Breakers",
    description: "Not sure what to say? Our fun conversation starters make chatting easy and stress-free.",
    gradient: "from-mint to-teal",
    bgGradient: "from-mint/20 to-teal/5",
  },
  {
    icon: Trophy,
    title: "Social Challenges",
    description: "Complete fun challenges to step out of your comfort zone and earn achievement badges.",
    gradient: "from-coral to-sunshine",
    bgGradient: "from-coral/5 to-sunshine/10",
  },
];

const Features = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-80 h-80 rounded-full bg-mint/30 blur-3xl" />
      <div className="absolute top-1/4 -right-40 w-80 h-80 rounded-full bg-lavender/30 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary mb-6">
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
              className="group relative glass-card rounded-3xl p-8 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
              
              {/* Icon */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <feature.icon className="h-8 w-8 text-primary-foreground" />
              </div>

              <h3 className="relative text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="relative text-muted-foreground leading-relaxed">{feature.description}</p>
              
              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-[100px] rounded-tr-3xl`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
