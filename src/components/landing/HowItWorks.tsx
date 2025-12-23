import { MessageCircle, Users, Heart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Create Your Profile",
    description: "Share your interests, hobbies, and what you're looking for in a friend. No pressure, just be yourself!",
    color: "bg-coral-light",
  },
  {
    icon: MessageCircle,
    title: "Get Matched",
    description: "Our smart matching connects you with teens who share your interests and understand what you're going through.",
    color: "bg-teal",
  },
  {
    icon: Heart,
    title: "Build Friendships",
    description: "Start chatting, join group activities, and gradually build confidence in a supportive environment.",
    color: "bg-sunshine",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            How <span className="text-gradient">SocioBuddy</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to start your journey towards more meaningful connections
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-coral-light via-teal to-sunshine" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-3xl p-8 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="h-8 w-8 text-foreground" />
                </div>
                
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-24 h-8 w-8 text-muted-foreground/30" />
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
