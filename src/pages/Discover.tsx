import { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, MessageCircle, Sparkles, User, Heart, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpeg";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const AnimatedParticles = lazy(() => import("@/components/ui/AnimatedParticles"));

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"left" | "right" | null>(null);
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
      const { data: existingMatches } = await supabase
        .from("matches")
        .select("user2_id")
        .eq("user1_id", user.id);

      const excludeIds = [user.id, ...(existingMatches?.map(m => m.user2_id) || [])];

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

    if (myProfile.school && otherProfile.school) {
      const mySchoolLower = myProfile.school.toLowerCase().trim();
      const theirSchoolLower = otherProfile.school.toLowerCase().trim();
      
      if (mySchoolLower === theirSchoolLower) {
        score += 25;
      } else if (mySchoolLower.includes(theirSchoolLower) || theirSchoolLower.includes(mySchoolLower)) {
        score += 15;
      }
      maxScore += 25;
    }

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

    if (myProfile.looking_for && otherProfile.looking_for) {
      if (myProfile.looking_for === otherProfile.looking_for) {
        score += 10;
      }
      maxScore += 10;
    }

    if (maxScore === 0) return 50;
    
    const percentage = Math.round((score / maxScore) * 100);
    return Math.max(30, Math.min(99, percentage));
  };

  const handleLike = async (profileId: string) => {
    if (!user || isAnimating) return;

    setAnimationDirection("right");
    setIsAnimating(true);

    try {
      const compatibilityScore = calculateCompatibility(profiles[currentIndex]);
      const { error } = await supabase.from("matches").insert({
        user1_id: user.id,
        user2_id: profileId,
        status: "pending",
        compatibility_score: compatibilityScore,
      });

      if (error) throw error;

      toast.success("💜 Connection request sent!");
      
      
      setTimeout(() => {
        nextProfile();
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 300);
    } catch (err) {
      console.error("Error creating match:", err);
      toast.error("Failed to send connection request");
      setIsAnimating(false);
      setAnimationDirection(null);
    }
  };

  const handleSkip = () => {
    if (isAnimating) return;
    setAnimationDirection("left");
    setIsAnimating(true);
    setTimeout(() => {
      nextProfile();
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setProfiles([]);
    }
  };

  const currentProfile = profiles[currentIndex];
  const compatibility = currentProfile ? calculateCompatibility(currentProfile) : 0;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-pink-400 animate-pulse flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Finding awesome people...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Discover Friends - SocioBuddy</title>
        <meta name="description" content="Find and connect with other teenagers who share your interests on SocioBuddy." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-teal-50 relative overflow-hidden">
        {/* 3D Particles Background */}
        <Suspense fallback={null}>
          <AnimatedParticles />
        </Suspense>

        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl" />

        {/* Header */}
        <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/20 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <img src={logo} alt="SocioBuddy Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                SocioBuddy
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/matches">
                <Button variant="ghost" className="relative group hover:bg-pink-100/50 rounded-2xl">
                  <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {matchCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg animate-bounce">
                      {matchCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="hover:bg-teal-100/50 rounded-2xl">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg relative z-10">
          {!currentProfile ? (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto flex items-center justify-center mb-6 shadow-2xl">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
                All Caught Up! 🎉
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                You've seen all profiles for now. Check back soon!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/matches">
                  <Button className="rounded-2xl px-6 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-pink-500 hover:scale-105 transition-transform">
                    <Heart className="mr-2 h-5 w-5" />
                    View Matches
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div 
              className={`transition-all duration-300 ${
                animationDirection === "left" 
                  ? "translate-x-[-120%] rotate-[-15deg] opacity-0" 
                  : animationDirection === "right" 
                  ? "translate-x-[120%] rotate-[15deg] opacity-0" 
                  : "translate-x-0 rotate-0 opacity-100"
              }`}
            >
              <Interactive3DCard className="w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
                  {/* Avatar Section */}
                  <div className="relative h-72 bg-gradient-to-br from-pink-400 via-primary to-teal-400">
                    {currentProfile.avatar_url ? (
                      <img
                        src={currentProfile.avatar_url}
                        alt={`${currentProfile.username}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-6xl font-bold text-white shadow-2xl">
                          {currentProfile.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {/* Compatibility Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl shadow-lg flex items-center gap-2 ${
                        compatibility >= 70 
                          ? "bg-green-500/90 text-white" 
                          : compatibility >= 50 
                          ? "bg-yellow-500/90 text-white"
                          : "bg-white/90 text-foreground"
                      }`}>
                        <Zap className="h-4 w-4" />
                        <span className="font-bold">{compatibility}%</span>
                      </div>
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                      <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                        {currentProfile.username}
                      </h2>
                      <p className="text-white/90 flex items-center gap-2">
                        {currentProfile.age && <span>{currentProfile.age} years</span>}
                        {currentProfile.school && (
                          <>
                            <span className="w-1 h-1 bg-white/60 rounded-full" />
                            <span>{currentProfile.school}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 space-y-5">
                    {currentProfile.bio && (
                      <div className="bg-gradient-to-r from-pink-50 to-teal-50 p-4 rounded-2xl">
                        <p className="text-foreground leading-relaxed">{currentProfile.bio}</p>
                      </div>
                    )}

                    {currentProfile.looking_for && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Looking for:</span>
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                          <Star className="h-3 w-3" />
                          {currentProfile.looking_for}
                        </span>
                      </div>
                    )}

                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Interests:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.interests.map((interest, i) => (
                            <span
                              key={interest}
                              className="px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-transform hover:scale-105"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  ["#fce4ec", "#e8f5e9", "#e3f2fd", "#fff3e0", "#f3e5f5"][i % 5]
                                }, ${
                                  ["#f8bbd9", "#c8e6c9", "#bbdefb", "#ffe0b2", "#e1bee7"][i % 5]
                                })`,
                              }}
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Interactive3DCard>

              {/* Action Buttons */}
              <div className="flex justify-center gap-8 mt-8">
                <button
                  onClick={handleSkip}
                  disabled={isAnimating}
                  className="group w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-all hover:scale-110 active:scale-95 border-4 border-gray-100 disabled:opacity-50"
                >
                  <X className="h-10 w-10 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
                <button
                  onClick={() => handleLike(currentProfile.id)}
                  disabled={isAnimating}
                  className="group w-24 h-24 rounded-full bg-gradient-to-r from-primary to-pink-500 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                  style={{ boxShadow: "0 10px 40px rgba(255, 107, 157, 0.4)" }}
                >
                  <Heart className="h-12 w-12 text-white group-hover:scale-110 transition-transform" fill="white" />
                </button>
              </div>

              <p className="text-center text-muted-foreground text-sm mt-6 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
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
