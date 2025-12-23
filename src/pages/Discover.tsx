import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, X, MessageCircle, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  school: string | null;
  age: number | null;
  interests: string[];
  looking_for: string | null;
  avatar_url: string | null;
}

const Discover = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchMyProfile();
      fetchMatchCount();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (myProfile) {
      fetchProfiles();
    }
  }, [myProfile]);

  const fetchMyProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, bio, school, age, interests, looking_for, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      setMyProfile(data);
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      // Get existing matches to exclude
      const { data: existingMatches } = await supabase
        .from("matches")
        .select("user2_id")
        .eq("user1_id", user.id);

      const excludeIds = [user.id, ...(existingMatches?.map(m => m.user2_id) || [])];

      // Fetch profiles excluding current user and already matched
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio, school, age, interests, looking_for, avatar_url")
        .eq("is_visible", true)
        .not("id", "in", `(${excludeIds.join(",")})`)
        .limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      toast.error("Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatchCount = async () => {
    if (!user) return;

    const { count } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("status", "accepted");

    setMatchCount(count || 0);
  };

  const calculateCompatibility = (otherProfile: Profile): number => {
    if (!myProfile) return 50;

    let score = 0;
    let maxScore = 0;

    // 1. Shared interests (up to 50 points)
    const myInterests = myProfile.interests || [];
    const theirInterests = otherProfile.interests || [];
    const sharedInterests = myInterests.filter(i => theirInterests.includes(i));
    
    if (myInterests.length > 0 || theirInterests.length > 0) {
      const totalUniqueInterests = new Set([...myInterests, ...theirInterests]).size;
      const interestScore = totalUniqueInterests > 0 
        ? (sharedInterests.length / totalUniqueInterests) * 50 
        : 0;
      score += interestScore;
      maxScore += 50;
    }

    // 2. School match (25 points for same school)
    if (myProfile.school && otherProfile.school) {
      const mySchoolLower = myProfile.school.toLowerCase().trim();
      const theirSchoolLower = otherProfile.school.toLowerCase().trim();
      
      if (mySchoolLower === theirSchoolLower) {
        score += 25; // Exact match
      } else if (mySchoolLower.includes(theirSchoolLower) || theirSchoolLower.includes(mySchoolLower)) {
        score += 15; // Partial match
      }
      maxScore += 25;
    }

    // 3. Age similarity (up to 25 points)
    if (myProfile.age && otherProfile.age) {
      const ageDiff = Math.abs(myProfile.age - otherProfile.age);
      if (ageDiff === 0) {
        score += 25;
      } else if (ageDiff === 1) {
        score += 20;
      } else if (ageDiff === 2) {
        score += 15;
      } else if (ageDiff <= 4) {
        score += 10;
      } else if (ageDiff <= 6) {
        score += 5;
      }
      maxScore += 25;
    }

    // 4. Looking for compatibility (bonus points)
    if (myProfile.looking_for && otherProfile.looking_for) {
      if (myProfile.looking_for === otherProfile.looking_for) {
        score += 10;
      }
      maxScore += 10;
    }

    // Calculate final percentage (minimum 30%, maximum 99%)
    if (maxScore === 0) return 50;
    
    const percentage = Math.round((score / maxScore) * 100);
    return Math.max(30, Math.min(99, percentage));
  };

  const handleLike = async (profileId: string) => {
    if (!user) return;

    try {
      const compatibilityScore = calculateCompatibility(profiles[currentIndex]);
      const { error } = await supabase.from("matches").insert({
        user1_id: user.id,
        user2_id: profileId,
        status: "pending",
        compatibility_score: compatibilityScore,
      });

      if (error) throw error;

      toast.success("Connection request sent!");
      
      // Send push notification to the liked user (fire and forget)
      supabase.functions.invoke("send-push-notification", {
        body: {
          userId: profileId,
          title: "New connection request!",
          body: "Someone wants to connect with you 💜",
          url: "/matches",
        },
      }).catch(console.error);
      
      nextProfile();
    } catch (err) {
      console.error("Error creating match:", err);
      toast.error("Failed to send connection request");
    }
  };

  const handleSkip = () => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
    }
  };

  const currentProfile = profiles[currentIndex];

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
        <title>Discover Friends - SocioBuddy</title>
        <meta name="description" content="Find and connect with other teenagers who share your interests on SocioBuddy." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-light to-coral flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold">SocioBuddy</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/matches">
                <Button variant="ghost" className="relative">
                  <MessageCircle className="h-5 w-5" />
                  {matchCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs text-primary-foreground flex items-center justify-center">
                      {matchCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg">
          {!currentProfile ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-mint mx-auto flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-teal" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No More Profiles</h2>
              <p className="text-muted-foreground mb-8">
                You've seen all available profiles for now. Check back later or update your interests!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/matches">
                  <Button>View Your Matches</Button>
                </Link>
                <Link to="/onboarding">
                  <Button variant="outline">Update Profile</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-scale-in">
              {/* Profile Card */}
              <div className="bg-card rounded-3xl shadow-card overflow-hidden">
                {/* Avatar */}
                <div className="h-64 gradient-hero flex items-center justify-center relative">
                  {currentProfile.avatar_url ? (
                    <img
                      src={currentProfile.avatar_url}
                      alt={`${currentProfile.username}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center text-5xl font-bold text-primary">
                      {currentProfile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{currentProfile.username}</h2>
                      <p className="text-muted-foreground">
                        {currentProfile.age && `${currentProfile.age} years old`}
                        {currentProfile.school && ` • ${currentProfile.school}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        {calculateCompatibility(currentProfile)}%
                      </span>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                  </div>

                  {currentProfile.bio && (
                    <p className="text-foreground mb-4">{currentProfile.bio}</p>
                  )}

                  {currentProfile.looking_for && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Looking for:</p>
                      <span className="inline-block bg-mint text-teal px-3 py-1 rounded-full text-sm font-medium">
                        {currentProfile.looking_for}
                      </span>
                    </div>
                  )}

                  {currentProfile.interests && currentProfile.interests.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="bg-muted px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-6 mt-8">
                <button
                  onClick={handleSkip}
                  className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors shadow-card"
                >
                  <X className="h-8 w-8" />
                </button>
                <button
                  onClick={() => handleLike(currentProfile.id)}
                  className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-coral-dark transition-colors shadow-glow"
                >
                  <Heart className="h-8 w-8" />
                </button>
              </div>

              <p className="text-center text-muted-foreground text-sm mt-4">
                {profiles.length - currentIndex - 1} more profiles to discover
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Discover;
