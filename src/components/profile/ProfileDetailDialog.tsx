import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Check,
  X,
  GraduationCap,
  Heart,
  Star,
  Zap,
  MapPin,
  Calendar,
  Trophy,
  Users,
  Sparkles,
  BookOpen,
  Target,
} from "lucide-react";

interface ProfileData {
  id: string;
  username: string;
  bio: string | null;
  school: string | null;
  interests: string[];
  avatar_url: string | null;
  age?: number | null;
  looking_for?: string | null;
}

interface ProfileDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData | null;
  matchId: string;
  matchStatus: string;
  compatibilityScore: number;
  onAccept?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
}

const interestColors = [
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

const ProfileDetailDialog = ({
  open,
  onOpenChange,
  profile,
  matchId,
  matchStatus,
  compatibilityScore,
  onAccept,
  onReject,
}: ProfileDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState("summary");

  if (!profile) return null;

  const renderAvatar = (size: "sm" | "lg" | "xl" = "lg") => {
    const sizeClasses = {
      sm: "w-12 h-12 text-lg",
      lg: "w-24 h-24 text-3xl",
      xl: "w-32 h-32 text-5xl",
    };

    return profile.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className={`${sizeClasses[size]} rounded-full object-cover ring-4 ring-primary/30`}
      />
    ) : (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/60 to-primary/30 flex items-center justify-center text-primary-foreground font-bold ring-4 ring-primary/30`}
      >
        {profile.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-border/50 bg-background rounded-2xl gap-0">
        {/* Top Banner */}
        <div className="h-28 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/20 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>

        <div className="flex flex-col md:flex-row gap-0">
          {/* Left Sidebar */}
          <div className="md:w-72 flex-shrink-0 border-r border-border/50 p-6 -mt-16 relative z-10">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {renderAvatar("xl")}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground mt-4">
                {profile.username}
              </h2>
              {profile.looking_for && (
                <p className="text-sm text-muted-foreground mt-1">
                  Looking for {profile.looking_for}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 w-full">
                {matchStatus === "pending" ? (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                      onClick={() => onAccept?.(matchId)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      onClick={() => onReject?.(matchId)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </>
                ) : (
                  <Link to={`/conversation/${matchId}`} className="w-full">
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Details
                </h3>
                <div className="space-y-2.5">
                  {profile.school && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{profile.school}</span>
                    </div>
                  )}
                  {profile.age && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{profile.age} years old</span>
                    </div>
                  )}
                  {profile.looking_for && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Target className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{profile.looking_for}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interests as Skills */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest, i) => (
                      <span
                        key={interest}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          interestColors[i % interestColors.length]
                        }`}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 -mt-16 md:mt-0">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {profile.username}'s Profile
              </h1>
              <div
                className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 font-semibold text-sm ${
                  compatibilityScore >= 70
                    ? "bg-primary/20 text-primary"
                    : compatibilityScore >= 50
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Zap className="h-4 w-4" />
                {compatibilityScore}% Match
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-card border border-border/50 rounded-xl p-1 h-auto mb-5 flex-wrap">
                <TabsTrigger
                  value="summary"
                  className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="interests"
                  className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Interests
                </TabsTrigger>
                <TabsTrigger
                  value="badges"
                  className="flex-1 rounded-lg py-2 text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Badges
                </TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 mt-0">
                {/* Bio Card */}
                <div className="neon-border rounded-xl p-5 bg-card/50">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">About</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {profile.bio || "This person hasn't added a bio yet. Send them a message to get to know them!"}
                  </p>
                </div>

                {/* Compatibility Card */}
                <div className="neon-border rounded-xl p-5 bg-card/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Compatibility</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--border))"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          strokeDasharray={`${compatibilityScore}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {compatibilityScore}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {compatibilityScore >= 70
                          ? "You two have a lot in common! Great potential for a strong friendship."
                          : compatibilityScore >= 50
                          ? "You share some interests. Could be a great connection!"
                          : "Different perspectives can lead to interesting conversations!"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shared Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="neon-border rounded-xl p-5 bg-card/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Top Interests
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.interests.slice(0, 4).map((interest, i) => (
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
                              ][i % 4]
                            } flex items-center justify-center`}
                          >
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {interest}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Interests Tab */}
              <TabsContent value="interests" className="space-y-4 mt-0">
                <div className="neon-border rounded-xl p-5 bg-card/50">
                  <h3 className="font-semibold text-foreground mb-4">
                    All Interests
                  </h3>
                  {profile.interests && profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, i) => (
                        <div
                          key={interest}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                            interestColors[i % interestColors.length]
                          } flex items-center gap-2`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {interest}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No interests added yet.
                    </p>
                  )}
                </div>

                {profile.looking_for && (
                  <div className="neon-border rounded-xl p-5 bg-card/50">
                    <h3 className="font-semibold text-foreground mb-3">
                      Looking For
                    </h3>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-foreground font-medium">
                        {profile.looking_for}
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Badges Tab */}
              <TabsContent value="badges" className="space-y-4 mt-0">
                <div className="neon-border rounded-xl p-5 bg-card/50">
                  <h3 className="font-semibold text-foreground mb-4">
                    Badges & Achievements
                  </h3>
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
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailDialog;
