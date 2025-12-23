import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Check, X, ArrowLeft, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MatchWithProfile {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  compatibility_score: number;
  created_at: string;
  profile: {
    id: string;
    username: string;
    bio: string | null;
    school: string | null;
    interests: string[];
  } | null;
}

const Matches = () => {
  const [pendingMatches, setPendingMatches] = useState<MatchWithProfile[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<MatchWithProfile[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "accepted">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchMatches();
    }
  }, [user, loading, navigate]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Fetch pending matches where current user is user2 (received requests)
      const { data: pending, error: pendingError } = await supabase
        .from("matches")
        .select("*, profile:profiles!matches_user1_id_fkey(id, username, bio, school, interests)")
        .eq("user2_id", user.id)
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      // Fetch accepted matches
      const { data: accepted, error: acceptedError } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (acceptedError) throw acceptedError;

      // Get profiles for accepted matches
      const acceptedWithProfiles = await Promise.all(
        (accepted || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, bio, school, interests")
            .eq("id", otherUserId)
            .single();

          return { ...match, profile };
        })
      );

      setPendingMatches(pending || []);
      setAcceptedMatches(acceptedWithProfiles);
    } catch (err) {
      console.error("Error fetching matches:", err);
      toast.error("Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "accepted" })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Connection accepted! You can now chat.");
      fetchMatches();
    } catch (err) {
      console.error("Error accepting match:", err);
      toast.error("Failed to accept connection");
    }
  };

  const handleReject = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "rejected" })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Connection declined");
      fetchMatches();
    } catch (err) {
      console.error("Error rejecting match:", err);
      toast.error("Failed to decline connection");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Matches - SocioBuddy</title>
        <meta name="description" content="View and manage your connections on SocioBuddy." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/discover" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold">My Matches</h1>
            </div>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({pendingMatches.length})
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "accepted"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Connected ({acceptedMatches.length})
            </button>
          </div>

          {/* Pending Matches */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingMatches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-mint mx-auto flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    Connection requests will appear here
                  </p>
                </div>
              ) : (
                pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-coral-light to-teal flex items-center justify-center text-primary-foreground font-bold text-xl">
                      {match.profile?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{match.profile?.username}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.profile?.school || "Looking to connect"}
                      </p>
                      <p className="text-xs text-primary font-medium">
                        {match.compatibility_score}% match
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(match.id)}
                        className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleAccept(match.id)}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-coral-dark transition-colors"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Accepted Matches */}
          {activeTab === "accepted" && (
            <div className="space-y-4">
              {acceptedMatches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-mint mx-auto flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="font-semibold mb-2">No Connections Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start discovering people to make connections
                  </p>
                  <Link to="/discover">
                    <Button>Discover People</Button>
                  </Link>
                </div>
              ) : (
                acceptedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-coral-light to-teal flex items-center justify-center text-primary-foreground font-bold text-xl">
                      {match.profile?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{match.profile?.username}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.profile?.school || "Connected"}
                      </p>
                      {match.profile?.interests && match.profile.interests.length > 0 && (
                        <div className="flex gap-1 mt-1 overflow-hidden">
                          {match.profile.interests.slice(0, 2).map((interest) => (
                            <span
                              key={interest}
                              className="text-xs bg-muted px-2 py-0.5 rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link to="/chat">
                      <Button size="sm" variant="secondary">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Matches;
