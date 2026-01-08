import { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Check, Save, Sparkles, Star, Heart, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AvatarUpload from "@/components/profile/AvatarUpload";
import SubscriptionCard from "@/components/profile/SubscriptionCard";
import UserBookings from "@/components/profile/UserBookings";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

const AnimatedParticles = lazy(() => import("@/components/ui/AnimatedParticles"));

const INTERESTS = [
  "Gaming", "Music", "Sports", "Art", "Reading", "Movies", "Anime",
  "Coding", "Photography", "Fashion", "Cooking", "Dancing", "Writing",
  "Science", "Nature", "Volunteering", "Travel", "Pets", "Fitness"
];

const interestColors = [
  "from-pink-100 to-pink-200",
  "from-teal-100 to-teal-200",
  "from-yellow-100 to-yellow-200",
  "from-purple-100 to-purple-200",
  "from-blue-100 to-blue-200",
  "from-green-100 to-green-200",
  "from-orange-100 to-orange-200",
  "from-cyan-100 to-cyan-200",
  "from-rose-100 to-rose-200",
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
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-background to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-pink-400 animate-pulse flex items-center justify-center">
            <User className="h-8 w-8 text-white animate-bounce" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - SocioBuddy</title>
        <meta name="description" content="Manage your SocioBuddy profile and settings." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-teal-50 relative overflow-hidden">
        {/* 3D Particles Background */}
        <Suspense fallback={null}>
          <AnimatedParticles />
        </Suspense>

        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl" />

        {/* Header */}
        <header className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/20 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/discover" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-pink-100/50">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  My Profile
                </h1>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="rounded-2xl hover:bg-red-100/50 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-xl relative z-10">
          {/* Avatar Section */}
          <Interactive3DCard className="mb-8" tiltAmount={8}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {user && (
                    <AvatarUpload
                      userId={user.id}
                      avatarUrl={avatarUrl}
                      username={username}
                      size="xl"
                      editable
                      onUploadComplete={setAvatarUrl}
                    />
                  )}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="h-5 w-5 text-white" fill="white" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Tap the camera icon to change your photo
                </p>
              </div>
            </div>
          </Interactive3DCard>

          {/* Bookings & Subscription */}
          <div className="space-y-6 mb-8">
            <Interactive3DCard tiltAmount={5}>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <UserBookings />
              </div>
            </Interactive3DCard>

            <Interactive3DCard tiltAmount={5}>
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <SubscriptionCard />
              </div>
            </Interactive3DCard>
          </div>

          {/* Profile Form */}
          <Interactive3DCard tiltAmount={3}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-bold text-lg">Profile Details</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="rounded-2xl border-gray-200 focus:border-primary bg-white/50 backdrop-blur"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  className="rounded-2xl border-gray-200 focus:border-primary bg-white/50 backdrop-blur resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium text-muted-foreground">
                    School
                  </Label>
                  <Input
                    id="school"
                    placeholder="Your school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    maxLength={100}
                    className="rounded-2xl border-gray-200 focus:border-primary bg-white/50 backdrop-blur"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium text-muted-foreground">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="13-19"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={13}
                    max={19}
                    className="rounded-2xl border-gray-200 focus:border-primary bg-white/50 backdrop-blur"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-muted-foreground">Interests</Label>
                  <span className="text-xs bg-gradient-to-r from-pink-100 to-teal-100 px-3 py-1 rounded-full font-medium">
                    {selectedInterests.length}/6 selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest, index) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                        selectedInterests.includes(interest)
                          ? "bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg"
                          : `bg-gradient-to-r ${interestColors[index % interestColors.length]} text-foreground hover:shadow-md`
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

              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="w-full rounded-2xl py-6 text-lg font-semibold bg-gradient-to-r from-primary to-pink-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </Interactive3DCard>
        </main>
      </div>
    </>
  );
};

export default Profile;
