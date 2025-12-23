import { Shield, Zap, Globe, MessageSquare, GraduationCap, Trophy } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Safe & Private",
    description: "Your privacy matters. All chats are secure and monitored to ensure a safe environment for teens.",
    gradient: "from-coral-light to-coral",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Get matched with like-minded teens instantly based on your interests and personality.",
    gradient: "from-teal to-teal-light",
  },
  {
    icon: Globe,
    title: "School Communities",
    description: "Connect with students from your school or discover friends from schools nearby.",
    gradient: "from-sunshine to-accent",
  },
  {
    icon: GraduationCap,
    title: "Expert Mentorship",
    description: "Connect with verified mentors who can guide you in building confidence and social skills.",
    gradient: "from-lavender to-coral-light",
  },
  {
    icon: MessageSquare,
    title: "Ice Breakers",
    description: "Not sure what to say? Our fun conversation starters make chatting easy and stress-free.",
    gradient: "from-mint to-teal",
  },
  {
    icon: Trophy,
    title: "Social Challenges",
    description: "Complete fun challenges to step out of your comfort zone and earn achievement badges.",
    gradient: "from-coral to-sunshine",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Everything You Need to
            <span className="block text-gradient">Build Confidence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Designed specifically for teenagers, with features that make social connections feel natural and fun.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-3xl p-8 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-foreground" />
              </div>

              <h3 className="relative text-xl font-bold mb-3">{feature.title}</h3>
              <p className="relative text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
