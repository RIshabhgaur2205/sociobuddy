import { Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-primary/10 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SocioBuddy Logo" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xl font-extrabold text-foreground">SocioBuddy<span className="text-primary">.in</span></span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Helping teenagers overcome social anxiety and build meaningful friendships since 2024.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="/#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="/#testimonials" className="hover:text-primary transition-colors">Success Stories</a></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><Link to="/community-guidelines" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-primary transition-colors">Safety Tips</Link></li>
              <li><Link to="/mentors" className="hover:text-primary transition-colors">Talk to Mentors</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} SocioBuddy. Made with 💚 for teenagers everywhere.
          </p>

          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/sociobuddyofficial?igsh=dWFkeTMwbG5uMG1u" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all"
            >
              <Instagram className="h-5 w-5 text-primary" />
            </a>
            <a 
              href="https://www.youtube.com/@sociobuddyofficial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all"
            >
              <Youtube className="h-5 w-5 text-primary" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
