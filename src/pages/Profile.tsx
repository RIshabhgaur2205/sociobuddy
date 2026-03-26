import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, LogOut, Check, Sparkles, Settings, Users, Edit3,
  Heart, GraduationCap, Calendar, Target, Trophy, BookOpen,
  Star, Zap, Grid3X3,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AvatarUpload from "@/components/profile/AvatarUpload";
import SubscriptionCard from "@/components/profile/SubscriptionCard";
import UserBookings from "@/components/profile/UserBookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const INTERESTS = [
  "Gaming", "Music", "Sports", "Art", "Reading", "Movies", "Anime",
  "Coding", "Photography", "Fashion", "Cooking", "Dancing", "Writing",
  "Science", "Nature", "Volunteering", "Travel", "Pets", "Fitness"
];

const interestTagColors = [
  "bg-primary/20 text-primary border-primary/30",
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "bg-rose-500/20 text-rose-400 border-rose-500/30",
];

const badges = [
  { icon: Trophy, label: "Early Adopter", color: "from-amber-400 to-yellow-500" },
  { icon: Users, label: "Social Star", color: "from-blue-400 to-cyan-500" },
  { icon: Sparkles, label: "Conversation Pro", color: "from-purple-400 to-pink-500" },
  { icon: Heart, label: "Kind Soul", color: "from-rose-400 to-red-500" },
];

const Profile = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [age, setAge] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lookingFor, setLookingFor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
        setSchool(data.school || "");
        setAge(data.age?.toString() || "");
        setAvatarUrl(data.avatar_url);
        setSelectedInterests(data.interests || []);
        setLookingFor(data.looking_for || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { count: friends } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "accepted");

      const { count: pending } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("user2_id", user.id)
        .eq("status", "pending");

      setFriendsCount(friends || 0);
      setPendingCount(pending || 0);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 6) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      toast.error("You can select up to 6 interests");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          bio,
          school,
          age: age ? parseInt(age) : null,
          interests: selectedInterests,
          looking_for: lookingFor || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("✨ Profile updated!");
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{username} - SocioBuddy</title>
        <meta name="description" content="Manage your SocioBuddy profile and settings." />
      </Helmet>

      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-40 -left-40 h-[300px] w-[300px] rounded-full bg-primary/3 blur-3xl" />

        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/50 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="p-2 rounded-xl hover:bg-card transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <span className="font-bold text-lg text-foreground font-display uppercase tracking-wide">{username}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-xl hover:bg-card">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row gap-0">
            {/* Left Sidebar */}
            <div className="md:w-72 flex-shrink-0 md:border-r border-border/30 p-6 -mt-16">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr from-primary via-primary/60 to-accent shadow-neon">
                    <div className="w-full h-full rounded-full bg-background p-[2px]">
                      {user && (
                        <AvatarUpload
                          userId={user.id}
                          avatarUrl={avatarUrl}
                          username={username}
                          size="lg"
                          editable
                          onUploadComplete={setAvatarUrl}
                        />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-4 font-display uppercase tracking-wide">
                  {username}
                </h2>
                {lookingFor && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Looking for {lookingFor}
                  </p>
                )}

                {/* Edit Profile Button */}
                <Button
                  variant="outline"
                  className="w-full mt-4 rounded-xl border-border hover:bg-primary/10 hover:border-primary/30 font-semibold"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Details
                  </h3>
                  <div className="space-y-2.5">
                    {user?.email && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground truncate">{user.email}</span>
                      </div>
                    )}
                    {school && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{school}</span>
                      </div>
                    )}
                    {age && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{age} years old</span>
                      </div>
                    )}
                    {lookingFor && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <Target className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{lookingFor}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests */}
                {selectedInterests.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInterests.map((interest, i) => (
                        <span
                          key={interest}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${interestTagColors[i % interestTagColors.length]}`}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Connections
                  </h3>
                  <div className="flex gap-4">
                    <Link to="/matches" className="text-center hover:scale-105 transition-transform">
                      <p className="text-2xl font-bold text-primary">{friendsCount}</p>
                      <p className="text-muted-foreground text-xs font-medium">Friends</p>
                    </Link>
                    <Link to="/matches" className="text-center hover:scale-105 transition-transform">
                      <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                      <p className="text-muted-foreground text-xs font-medium">Pending</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-foreground font-display uppercase tracking-wide">
                  My Profile
                </h1>
                <Link to="/matches">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold">
                    <Users className="h-4 w-4 mr-1.5" />
                    View Friends
                  </Button>
                </Link>
              </div>

              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="w-full bg-card border border-border/50 rounded-xl p-1 h-auto mb-5">
                  <TabsTrigger
                    value="summary"
                    className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Bookings
                  </TabsTrigger>
                  <TabsTrigger
                    value="badges"
                    className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Badges
                  </TabsTrigger>
                  <TabsTrigger
                    value="plan"
                    className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Plan
                  </TabsTrigger>
                </TabsList>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-4 mt-0">
                  {/* Bio Card */}
                  <div className="neon-border rounded-xl p-5 bg-card/50">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">About Me</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                      {bio || "No bio yet. Click 'Edit Profile' to add one!"}
                    </p>
                  </div>

                  {/* Top Interests */}
                  {selectedInterests.length > 0 && (
                    <div className="neon-border rounded-xl p-5 bg-card/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">My Interests</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedInterests.map((interest, i) => (
                          <div
                            key={interest}
                            className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/30"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                                [
                                  "from-primary/30 to-primary/10",
                                  "from-blue-500/30 to-blue-500/10",
                                  "from-purple-500/30 to-purple-500/10",
                                  "from-amber-500/30 to-amber-500/10",
                                  "from-cyan-500/30 to-cyan-500/10",
                                  "from-rose-500/30 to-rose-500/10",
                                ][i % 6]
                              } flex items-center justify-center`}
                            >
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{interest}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="neon-border rounded-xl p-4 bg-card/50 text-center">
                      <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{friendsCount}</p>
                      <p className="text-xs text-muted-foreground">Friends</p>
                    </div>
                    <div className="neon-border rounded-xl p-4 bg-card/50 text-center">
                      <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="neon-border rounded-xl p-4 bg-card/50 text-center">
                      <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{selectedInterests.length}</p>
                      <p className="text-xs text-muted-foreground">Interests</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="mt-0">
                  <div className="neon-border rounded-xl bg-card/50 overflow-hidden">
                    <UserBookings />
                  </div>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges" className="mt-0">
                  <div className="neon-border rounded-xl p-5 bg-card/50">
                    <h3 className="font-semibold text-foreground mb-4">Badges & Achievements</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {badges.map((badge) => (
                        <div
                          key={badge.label}
                          className="flex flex-col items-center text-center gap-2 p-3"
                        >
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}
                          >
                            <badge.icon className="h-8 w-8 text-white" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {badge.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Plan Tab */}
                <TabsContent value="plan" className="mt-0">
                  <div className="neon-border rounded-xl bg-card/50 overflow-hidden">
                    <SubscriptionCard />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display uppercase tracking-wide">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-muted-foreground">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={150}
                className="bg-background border-border text-foreground rounded-xl resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school" className="text-muted-foreground">School</Label>
                <Input
                  id="school"
                  placeholder="Your school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  maxLength={100}
                  className="bg-background border-border text-foreground rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-muted-foreground">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="13-19"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={13}
                  max={19}
                  className="bg-background border-border text-foreground rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lookingFor" className="text-muted-foreground">Looking For</Label>
              <Input
                id="lookingFor"
                placeholder="e.g., Study buddy, Gaming partner"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                maxLength={50}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-muted-foreground">Interests</Label>
                <span className="text-xs text-muted-foreground">{selectedInterests.length}/6</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-primary text-primary-foreground shadow-neon"
                        : "bg-background text-muted-foreground border border-border hover:border-primary/30"
                    }`}
                  >
                    {selectedInterests.includes(interest) && (
                      <Check className="inline h-3 w-3 mr-1" />
                    )}
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1 rounded-xl border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
