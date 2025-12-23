import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    age: 16,
    school: "Lincoln High",
    quote: "I used to eat lunch alone every day. SocioBuddy helped me find friends who actually get me. Now I have a group I hang out with regularly!",
    avatar: "S",
    rating: 5,
  },
  {
    name: "James K.",
    age: 15,
    school: "Westview Academy",
    quote: "The ice breakers made it so easy to start conversations. I'm way more confident now and even joined the debate club!",
    avatar: "J",
    rating: 5,
  },
  {
    name: "Mia C.",
    age: 17,
    school: "Central Prep",
    quote: "Moving to a new school was terrifying, but SocioBuddy connected me with other new students. We became best friends!",
    avatar: "M",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Real Stories from
            <span className="block text-gradient">Real Teens</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from teenagers who transformed their social lives with SocioBuddy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-3xl p-8 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-sunshine text-sunshine" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral-light to-teal flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Age {testimonial.age} • {testimonial.school}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
