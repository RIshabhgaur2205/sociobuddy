import { MessageCircle, Users, Heart, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Create Your Profile",
    description: "Share your interests, hobbies, and what you're looking for in a friend. No pressure, just be yourself!",
    features: ["Quick 2-min setup", "Privacy protected", "Edit anytime"],
  },
  {
    icon: MessageCircle,
    title: "Get Matched",
    description: "Our smart matching connects you with teens who share your interests and understand what you're going through.",
    features: ["AI-powered matching", "Common interests", "School nearby"],
  },
  {
    icon: Heart,
    title: "Build Friendships",
    description: "Start chatting, join group activities, and gradually build confidence in a supportive environment.",
    features: ["Safe messaging", "Group activities", "Expert mentors"],
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 bg-card/30 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full neon-border px-4 py-2 text-sm font-medium text-primary mb-6">
            <span>Simple & Easy</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            How <span className="text-gradient">SocioBuddy</span> Works
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Three simple steps to start your journey towards more meaningful connections
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute top-32 left-[20%] right-[20%] h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="neon-border rounded-3xl p-8 hover-lift h-full bg-card/50">
                <div className="absolute -top-4 left-8 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-neon">
                  {index + 1}
                </div>
                
                <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mb-8 mt-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>

                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>
                
                <ul className="space-y-3">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-6 top-32 h-8 w-8 text-primary/40 z-10" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
