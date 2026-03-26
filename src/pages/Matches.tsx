import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Check, X, ArrowLeft, User, Sparkles, Heart, MapPin, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileDetailDialog from "@/components/profile/ProfileDetailDialog";

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
    avatar_url: string | null;
  } | null;
}

const Matches = () => {
  const [pendingMatches, setPendingMatches] = useState<MatchWithProfile[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<MatchWithProfile[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "accepted">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<MatchWithProfile | null>(null);
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
        .select("*, profile:profiles!matches_user1_id_fkey(id, username, bio, school, interests, avatar_url)")
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
            .select("id, username, bio, school, interests, avatar_url")
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

  const handleAccept = async (matchId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "accepted" })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Connection accepted! You can now chat.");
      setSelectedProfile(null);
      fetchMatches();
    } catch (err) {
      console.error("Error accepting match:", err);
      toast.error("Failed to accept connection");
    }
  };

  const handleReject = async (matchId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "rejected" })
        .eq("id", matchId);

      if (error) throw error;

      toast.success("Connection declined");
      setSelectedProfile(null);
      fetchMatches();
    } catch (err) {
      console.error("Error rejecting match:", err);
      toast.error("Failed to decline connection");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderAvatar = (profile: MatchWithProfile["profile"], size: "sm" | "lg" = "sm") => {
    if (!profile) return null;
    
    const sizeClasses = size === "lg" ? "w-24 h-24 text-3xl" : "w-16 h-16 text-xl";
    
    return profile.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className={`${sizeClasses} rounded-full object-cover ring-4 ring-pink-100`}
      />
    ) : (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-white font-bold ring-4 ring-pink-100`}>
        {profile.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>My Matches - SocioBuddy</title>
        <meta name="description" content="View and manage your connections on SocioBuddy." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">My Matches</h1>
            <Link to="/profile" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <User className="h-5 w-5 text-gray-800" />
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Tabs */}
          <div className="flex gap-3 mb-6 bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "pending"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
              {pendingMatches.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                  {pendingMatches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === "accepted"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Connected
              {acceptedMatches.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  {acceptedMatches.length}
                </span>
              )}
            </button>
          </div>

          {/* Pending Matches */}
          {activeTab === "pending" && (
            <div className="space-y-3">
              {pendingMatches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mx-auto flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10 text-pink-400" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-500 text-sm">
                    Connection requests will appear here
                  </p>
                </div>
              ) : (
                pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => setSelectedProfile(match)}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 active:scale-[0.98]"
                  >
                    {renderAvatar(match.profile)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{match.profile?.username}</h3>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {match.profile?.school || "Looking to connect"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                          {match.compatibility_score}% match
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleReject(match.id, e)}
                        className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-red-400 hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => handleAccept(match.id, e)}
                        className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white hover:shadow-lg hover:scale-105 transition-all"
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
            <div className="space-y-3">
              {acceptedMatches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mx-auto flex items-center justify-center mb-4">
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">No Connections Yet</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Start discovering people to make connections
                  </p>
                  <Link to="/discover">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-8">
                      Discover People
                    </Button>
                  </Link>
                </div>
              ) : (
                acceptedMatches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => setSelectedProfile(match)}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 active:scale-[0.98]"
                  >
                    {renderAvatar(match.profile)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate">{match.profile?.username}</h3>
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      </div>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {match.profile?.school || "Connected"}
                      </p>
                      {match.profile?.interests && match.profile.interests.length > 0 && (
                        <div className="flex gap-1.5 mt-2 overflow-hidden">
                          {match.profile.interests.slice(0, 2).map((interest) => (
                            <span
                              key={interest}
                              className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                          {match.profile.interests.length > 2 && (
                            <span className="text-xs text-gray-400 py-1">
                              +{match.profile.interests.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Link to={`/conversation/${match.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-4">
                        <MessageCircle className="h-4 w-4 mr-1.5" />
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

      {/* User Profile Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
          {selectedProfile?.profile && (
            <>
              {/* Header with gradient */}
              <div className="h-24 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  {renderAvatar(selectedProfile.profile, "lg")}
                </div>
              </div>
              
              <div className="pt-16 pb-6 px-6 text-center">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {selectedProfile.profile.username}
                  </DialogTitle>
                </DialogHeader>
                
                {selectedProfile.profile.school && (
                  <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {selectedProfile.profile.school}
                  </p>
                )}
                
                {/* Match Score */}
                <div className="mt-4 inline-flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-semibold text-pink-600">
                    {selectedProfile.compatibility_score}% Compatible
                  </span>
                </div>
                
                {/* Bio */}
                {selectedProfile.profile.bio && (
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                    {selectedProfile.profile.bio}
                  </p>
                )}
                
                {/* Interests */}
                {selectedProfile.profile.interests && selectedProfile.profile.interests.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedProfile.profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="text-xs bg-gradient-to-r from-pink-50 to-purple-50 text-purple-600 px-3 py-1.5 rounded-full font-medium border border-purple-100"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-6 flex gap-3 justify-center">
                  {selectedProfile.status === "pending" ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={(e) => handleReject(selectedProfile.id, e)}
                        className="rounded-full px-6 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        Decline
                      </Button>
                      <Button
                        onClick={(e) => handleAccept(selectedProfile.id, e)}
                        className="rounded-full px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Accept
                      </Button>
                    </>
                  ) : (
                    <Link to={`/conversation/${selectedProfile.id}`}>
                      <Button className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        Start Chat
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Matches;
