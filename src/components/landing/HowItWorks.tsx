import { MessageCircle, Users, Heart, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Create Your Profile",
    description: "Share your interests, hobbies, and what you're looking for in a friend. No pressure, just be yourself!",
    color: "from-coral-light to-coral",
    features: ["Quick 2-min setup", "Privacy protected", "Edit anytime"],
  },
  {
    icon: MessageCircle,
    title: "Get Matched",
    description: "Our smart matching connects you with teens who share your interests and understand what you're going through.",
    color: "from-teal to-teal-light",
    features: ["AI-powered matching", "Common interests", "School nearby"],
  },
  {
    icon: Heart,
    title: "Build Friendships",
    description: "Start chatting, join group activities, and gradually build confidence in a supportive environment.",
    color: "from-sunshine to-accent",
    features: ["Safe messaging", "Group activities", "Expert mentors"],
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-coral-light/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-teal/10 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
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
          {/* Connection line */}
          <div className="hidden md:block absolute top-32 left-[20%] right-[20%] h-1 bg-gradient-to-r from-coral-light via-teal to-sunshine rounded-full" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="glass-card rounded-3xl p-8 hover-lift h-full">
                {/* Step number */}
                <div className="absolute -top-4 left-8 w-10 h-10 bg-gradient-to-br from-primary to-coral-dark rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-8 mt-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>

                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>
                
                {/* Features list */}
                <ul className="space-y-3">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-6 top-32 h-8 w-8 text-muted-foreground/40 z-10" />
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
