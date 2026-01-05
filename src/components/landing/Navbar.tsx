import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, User, LogOut, GraduationCap, Shield, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SocioBuddy Logo" className="w-10 h-10 rounded-xl object-cover" />
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
            <Link to="/mentors" className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Mentors
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/discover">
                  <Button variant="ghost">Discover</Button>
                </Link>
                <Link to="/matches">
                  <Button variant="ghost">
                    <Heart className="h-4 w-4 mr-1" />
                    Matches
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-primary">
                        <Shield className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/mentors" className="cursor-pointer">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Mentor Applications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          User Management
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/referral-codes" className="cursor-pointer">
                          <Gift className="h-4 w-4 mr-2" />
                          Referral Codes
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/auth">
                  <Button>Join Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
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
              <Link to="/mentors" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Mentors
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Pricing
              </Link>

              {user ? (
                <>
                  <Link to="/discover" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                    Discover
                  </Link>
                  <Link to="/matches" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                    My Matches
                  </Link>
                  <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                    Profile
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="pt-2 pb-1">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      </div>
                      <Link to="/admin/mentors" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 pl-2">
                        Mentor Applications
                      </Link>
                      <Link to="/admin/users" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 pl-2">
                        User Management
                      </Link>
                      <Link to="/admin/referral-codes" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 pl-2">
                        Referral Codes
                      </Link>
                    </>
                  )}
                  <div className="pt-4 border-t border-border/50">
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-4 pt-4 border-t border-border/50">
                  <Link to="/auth" className="flex-1">
                    <Button variant="ghost" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/auth" className="flex-1">
                    <Button className="w-full">Join Now</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;