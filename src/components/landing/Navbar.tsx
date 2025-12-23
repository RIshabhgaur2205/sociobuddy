import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ChatBox from "@/components/chat/ChatBox";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-light to-coral flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold text-foreground">SocioBuddy</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                How It Works
              </a>
              <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Features
              </a>
              <a href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Stories
              </a>
              <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(true)}
                className="relative"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </Button>
              <Button variant="ghost">Log In</Button>
              <Button>Join Now</Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(true)}
                className="relative"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </Button>
              <button
                className="p-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-border/50">
              <div className="flex flex-col gap-4">
                <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                  How It Works
                </a>
                <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                  Features
                </a>
                <a href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                  Stories
                </a>
                <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Community Chat
                </Link>
                <div className="flex gap-4 pt-4 border-t border-border/50">
                  <Button variant="ghost" className="flex-1">Log In</Button>
                  <Button className="flex-1">Join Now</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Navbar;
