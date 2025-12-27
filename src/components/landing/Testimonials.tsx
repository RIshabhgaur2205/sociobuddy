import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    age: 16,
    school: "Lincoln High",
    quote: "I used to eat lunch alone every day. SocioBuddy helped me find friends who actually get me. Now I have a group I hang out with regularly!",
    avatar: "S",
    rating: 5,
    gradient: "from-coral-light to-coral",
  },
  {
    name: "James K.",
    age: 15,
    school: "Westview Academy",
    quote: "The ice breakers made it so easy to start conversations. I'm way more confident now and even joined the debate club!",
    avatar: "J",
    rating: 5,
    gradient: "from-teal to-teal-light",
  },
  {
    name: "Mia C.",
    age: 17,
    school: "Central Prep",
    quote: "Moving to a new school was terrifying, but SocioBuddy connected me with other new students. We became best friends!",
    avatar: "M",
    rating: 5,
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
            <Star className="h-4 w-4 fill-sunshine text-sunshine" />
            <span>Loved by Teens</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Real Stories from
            <span className="block text-gradient mt-2">Real Teens</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Hear from teenagers who transformed their social lives with SocioBuddy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative glass-card rounded-3xl p-8 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote icon */}
              <div className={`absolute -top-4 right-8 w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                <Quote className="h-6 w-6 text-primary-foreground" />
              </div>
              
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-sunshine text-sunshine" />
                ))}
              </div>

              <p className="text-foreground mb-8 leading-relaxed text-lg italic">"{testimonial.quote}"</p>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Age {testimonial.age} • {testimonial.school}
                  </p>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${testimonial.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
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
