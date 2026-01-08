import { Star, Quote, Heart } from "lucide-react";

const founderStories = [
  {
    name: "Divyank Mehra",
    role: "Founder",
    quote: "In my life, I have many male as well as female friends who trust me deeply and feel comfortable sharing anything with me, knowing I never judge them. This trust allows them to open up, lighten their hearts, and heal. Realizing how much my own supportive background helped me, I understood that many others also need someone to listen. That's why I created SociBuddy.",
    avatar: "D",
    gradient: "from-coral-light to-coral",
  },
  {
    name: "Surjesh Pal",
    role: "Co-Founder",
    quote: "The purpose of SociBuddy is to create a safe and trustworthy platform where people can freely share their emotions without fear. SociBuddy connects individuals who genuinely want to help, allowing people to open up and communicate openly.",
    avatar: "S",
    gradient: "from-teal to-teal-light",
  },
  {
    name: "Aditya Kaushik",
    role: "Co-Founder",
    quote: "During personal and family problem, we often feel overwhelmed with emotions and need someone who can offer understanding and support, reminding us that it's all part of life. This is at the core of why SociBuddy was created—to help people heal and find comfort.",
    avatar: "A",
    gradient: "from-sunshine to-accent",
  },
];

const Testimonials = () => {
  return (
    <section className="py-28 bg-muted/30 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-coral-light/15 blur-3xl" />
      <div className="absolute bottom-10 left-20 w-64 h-64 rounded-full bg-teal/15 blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-sunshine/10 px-4 py-2 text-sm font-medium text-foreground mb-6">
            <Heart className="h-4 w-4 fill-coral text-coral" />
            <span>Our Story</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Meet the
            <span className="block text-gradient mt-2">Founders</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            The vision and heart behind SociBuddy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {founderStories.map((founder, index) => (
            <div
              key={index}
              className="group relative glass-card rounded-3xl p-8 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote icon */}
              <div className={`absolute -top-4 right-8 w-12 h-12 rounded-xl bg-gradient-to-br ${founder.gradient} flex items-center justify-center shadow-lg`}>
                <Quote className="h-6 w-6 text-primary-foreground" />
              </div>

              <p className="text-foreground mb-8 leading-relaxed text-lg italic">"{founder.quote}"</p>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${founder.gradient} flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {founder.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{founder.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {founder.role}
                  </p>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${founder.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>
        
        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Friendships Made" },
            { value: "4.9", label: "App Rating" },
            { value: "98%", label: "Happy Teens" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-card/50 animate-fade-in" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
              <p className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
