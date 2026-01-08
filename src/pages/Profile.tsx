import { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Check, Save, Sparkles, Settings, MessageCircle, Users, Edit3, Grid3X3, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AvatarUpload from "@/components/profile/AvatarUpload";
import SubscriptionCard from "@/components/profile/SubscriptionCard";
import UserBookings from "@/components/profile/UserBookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AnimatedParticles = lazy(() => import("@/components/ui/AnimatedParticles"));

const INTERESTS = [
  "Gaming", "Music", "Sports", "Art", "Reading", "Movies", "Anime",
  "Coding", "Photography", "Fashion", "Cooking", "Dancing", "Writing",
  "Science", "Nature", "Volunteering", "Travel", "Pets", "Fitness"
];

const interestColors = [
  "from-pink-400 to-rose-400",
  "from-teal-400 to-cyan-400",
  "from-yellow-400 to-orange-400",
  "from-purple-400 to-violet-400",
  "from-blue-400 to-indigo-400",
  "from-green-400 to-emerald-400",
];

const Profile = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [age, setAge] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
      // Count accepted matches (friends)
      const { count: friends } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "accepted");

      // Count pending requests received
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-pink-500 animate-pulse flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white animate-spin" />
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

      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-40 left-0 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-40 -translate-x-1/3" />

        {/* Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/discover" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </Link>
            <span className="font-bold text-lg text-gray-900">{username}</span>
            <div className="flex items-center gap-1">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100">
                    <Settings className="h-5 w-5 text-gray-700" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-600">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={20}
                        className="bg-gray-50 border-gray-200 text-gray-900 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-600">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell others about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        maxLength={150}
                        className="bg-gray-50 border-gray-200 text-gray-900 rounded-xl resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">{bio.length}/150</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="school" className="text-gray-600">School</Label>
                        <Input
                          id="school"
                          placeholder="Your school"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          maxLength={100}
                          className="bg-gray-50 border-gray-200 text-gray-900 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-gray-600">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="13-19"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          min={13}
                          max={19}
                          className="bg-gray-50 border-gray-200 text-gray-900 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-gray-600">Interests</Label>
                        <span className="text-xs text-gray-400">{selectedInterests.length}/6</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {INTERESTS.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              selectedInterests.includes(interest)
                                ? "bg-gradient-to-r from-primary to-pink-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                        className="flex-1 rounded-xl border-gray-200 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex-1 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-xl hover:bg-gray-100">
                <LogOut className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-lg relative z-10">
          {/* Profile Header */}
          <div className="flex items-start gap-5 mb-6">
            {/* Avatar with gradient ring */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 shadow-lg">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
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
            </div>

            {/* Stats */}
            <div className="flex-1 pt-1">
              <h1 className="text-xl font-bold text-gray-900 mb-2">{username}</h1>
              <div className="flex gap-5">
                <Link to="/matches" className="text-center hover:scale-105 transition-transform">
                  <p className="text-xl font-bold text-gray-900">{friendsCount}</p>
                  <p className="text-gray-500 text-xs font-medium">Friends</p>
                </Link>
                <Link to="/matches" className="text-center hover:scale-105 transition-transform">
                  <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
                  <p className="text-gray-500 text-xs font-medium">Pending</p>
                </Link>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedInterests.length}</p>
                  <p className="text-gray-500 text-xs font-medium">Interests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-5 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
            {school && (
              <p className="text-gray-500 text-sm mb-1 font-medium">
                🎓 {school} {age && `• ${age} y/o`}
              </p>
            )}
            {bio ? (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{bio}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">Add a bio to tell people about yourself...</p>
            )}
            
            {/* Interests as tags */}
            {selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedInterests.map((interest, i) => (
                  <span
                    key={interest}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${interestColors[i % interestColors.length]} text-white shadow-sm`}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button 
              onClick={() => setEditDialogOpen(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold shadow-sm border-0"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit profile
            </Button>
            <Link to="/matches" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-primary to-pink-500 hover:opacity-90 text-white rounded-xl font-semibold shadow-md">
                <Users className="h-4 w-4 mr-2" />
                View friends
              </Button>
            </Link>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="w-full bg-gray-100 rounded-2xl p-1 h-auto mb-4">
              <TabsTrigger 
                value="bookings" 
                className="flex-1 rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-600 data-[state=active]:text-gray-900"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="flex-1 rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-600 data-[state=active]:text-gray-900"
              >
                <Heart className="h-4 w-4 mr-2" />
                Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <UserBookings />
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <SubscriptionCard />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Profile;
