import { Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SocioBuddy Logo" className="w-10 h-10 rounded-xl object-cover" />
              <span className="text-xl font-extrabold">SocioBuddy</span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed">
              Helping teenagers overcome social anxiety and build meaningful friendships since 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li><a href="/#how-it-works" className="hover:text-background transition-colors">How It Works</a></li>
              <li><a href="/#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="/#testimonials" className="hover:text-background transition-colors">Success Stories</a></li>
              <li><Link to="/auth" className="hover:text-background transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li><Link to="/community-guidelines" className="hover:text-background transition-colors">Help Center</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-background transition-colors">Safety Tips</Link></li>
              <li><Link to="/mentors" className="hover:text-background transition-colors">Talk to Mentors</Link></li>
              <li><Link to="/contact" className="hover:text-background transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-background/60 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-background transition-colors">Cookie Policy</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-background transition-colors">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © {currentYear} SocioBuddy. Made with ❤️ for teenagers everywhere.
          </p>

          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/sociobuddyofficial?igsh=dWFkeTMwbG5uMG1u" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://www.youtube.com/@sociobuddyofficial" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
