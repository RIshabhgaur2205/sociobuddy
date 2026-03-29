import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import CheatCodesSection from "@/components/landing/CheatCodesSection";
import SocialGymSection from "@/components/landing/SocialGymSection";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>SocioBuddy - Help Teens Overcome Social Anxiety & Make Friends</title>
        <meta 
          name="description" 
          content="SocioBuddy connects teenagers studying in school, helping them overcome social anxiety and build meaningful friendships. Join 10,000+ teens already connected!" 
        />
        <meta name="keywords" content="teen social anxiety, make friends, student connections, school friends, overcome shyness" />
        <link rel="canonical" href="https://sociobuddy.com" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <section id="how-it-works">
            <HowItWorks />
          </section>
          <section id="cheat-codes">
            <CheatCodesSection />
          </section>
          <section id="social-gym">
            <SocialGymSection />
          </section>
          <section id="features">
            <Features />
          </section>
          <section id="testimonials">
            <Testimonials />
          </section>
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
