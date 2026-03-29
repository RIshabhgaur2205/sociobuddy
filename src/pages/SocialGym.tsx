import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, RotateCcw, TrendingUp, Dumbbell, Trophy, Star, Zap, Crown, Award, Medal, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Character {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

const characters: Character[] = [
  { id: "cool-crush", emoji: "😎", name: "Cool Crush", description: "Practice talking to someone you like" },
  { id: "rude-cashier", emoji: "😡", name: "Rude Cashier", description: "Handle difficult people with grace" },
  { id: "strict-teacher", emoji: "👨‍🏫", name: "Strict Teacher", description: "Practice speaking up in class" },
  { id: "stranger-party", emoji: "🤝", name: "Stranger at Party", description: "Make small talk with someone new" },
];

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Star;
  condition: (stats: GymStats) => boolean;
}

interface GymStats {
  total_xp: number;
  sessions_completed: number;
  characters_tried: string[];
  badges: string[];
}

const BADGES: Badge[] = [
  { id: "first-chat", name: "Ice Breaker", description: "Complete 1 session", icon: Zap, condition: (s) => s.sessions_completed >= 1 },
  { id: "five-sessions", name: "Regular", description: "Complete 5 sessions", icon: Target, condition: (s) => s.sessions_completed >= 5 },
  { id: "all-characters", name: "Social Butterfly", description: "Try all 4 characters", icon: Users, condition: (s) => s.characters_tried.length >= 4 },
  { id: "xp-500", name: "Rising Star", description: "Reach 500 XP", icon: Star, condition: (s) => s.total_xp >= 500 },
  { id: "xp-1000", name: "Social Pro", description: "Reach 1000 XP", icon: Crown, condition: (s) => s.total_xp >= 1000 },
];

const getXPLevel = (xp: number) => {
  if (xp >= 2000) return { level: 10, title: "Legend" };
  if (xp >= 1500) return { level: 8, title: "Master" };
  if (xp >= 1000) return { level: 6, title: "Pro" };
  if (xp >= 500) return { level: 4, title: "Skilled" };
  if (xp >= 200) return { level: 3, title: "Learner" };
  if (xp >= 50) return { level: 2, title: "Rookie" };
  return { level: 1, title: "Newbie" };
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  sessions_completed: number;
  badges: string[];
  username?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-gym-chat`;

const SocialGym = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"characters" | "leaderboard">("characters");
  const [stats, setStats] = useState<GymStats>({ total_xp: 0, sessions_completed: 0, characters_tried: [], badges: [] });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user stats
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("social_gym_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setStats({
          total_xp: data.total_xp,
          sessions_completed: data.sessions_completed,
          characters_tried: data.characters_tried,
          badges: data.badges,
        });
      }
    };
    load();
  }, [user]);

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    const { data: statsData } = await supabase
      .from("social_gym_stats")
      .select("user_id, total_xp, sessions_completed, badges")
      .order("total_xp", { ascending: false })
      .limit(10);

    if (statsData && statsData.length > 0) {
      const userIds = statsData.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.username]) ?? []);
      setLeaderboard(
        statsData.map((s) => ({
          ...s,
          username: profileMap.get(s.user_id) || "Anonymous",
        }))
      );
    } else {
      setLeaderboard([]);
    }
    setLeaderboardLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "leaderboard") loadLeaderboard();
  }, [activeTab, loadLeaderboard]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveStats = async (newStats: GymStats) => {
    if (!user) return;
    const { error } = await supabase.from("social_gym_stats").upsert({
      user_id: user.id,
      total_xp: newStats.total_xp,
      sessions_completed: newStats.sessions_completed,
      characters_tried: newStats.characters_tried,
      badges: newStats.badges,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) console.error("Failed to save stats:", error);
  };

  const endSession = async (characterId: string) => {
    if (!user) return;
    let xpEarned = messageCount * 10;
    if (messageCount >= 10) xpEarned += 50;

    const newCharsTried = stats.characters_tried.includes(characterId)
      ? stats.characters_tried
      : [...stats.characters_tried, characterId];

    if (!stats.characters_tried.includes(characterId)) xpEarned += 30;

    const newStats: GymStats = {
      total_xp: stats.total_xp + xpEarned,
      sessions_completed: stats.sessions_completed + 1,
      characters_tried: newCharsTried,
      badges: stats.badges,
    };

    // Check for new badges
    const newBadges: string[] = [];
    for (const badge of BADGES) {
      if (!newStats.badges.includes(badge.id) && badge.condition(newStats)) {
        newStats.badges = [...newStats.badges, badge.id];
        newBadges.push(badge.name);
      }
    }

    setStats(newStats);
    await saveStats(newStats);

    if (xpEarned > 0) {
      toast.success(`+${xpEarned} XP earned! 🎮`, { duration: 3000 });
    }
    if (newBadges.length > 0) {
      setTimeout(() => {
        toast.success(`🏆 New Badge: ${newBadges.join(", ")}!`, { duration: 4000 });
      }, 500);
    }
  };

  const getConfidenceScore = () => {
    if (messageCount === 0) return 0;
    return Math.min(100, Math.round((messageCount / 10) * 100));
  };

  const startConversation = (character: Character) => {
    setSelectedCharacter(character);
    setMessages([]);
    setMessageCount(0);
  };

  const handleRetry = () => {
    if (selectedCharacter && messageCount > 0) {
      endSession(selectedCharacter.id);
    }
    setMessages([]);
    setMessageCount(0);
  };

  const handleLevelUp = () => {
    if (selectedCharacter && messageCount > 0) {
      endSession(selectedCharacter.id);
    }
    setSelectedCharacter(null);
    setMessages([]);
    setMessageCount(0);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedCharacter) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setMessageCount((c) => c + 1);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updatedMessages, characterId: selectedCharacter.id }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Too many requests. Wait a moment.");
        if (resp.status === 402) throw new Error("Service temporarily unavailable.");
        throw new Error("Failed to get response");
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const xpInfo = getXPLevel(stats.total_xp);

  return (
    <>
      <Helmet>
        <title>Social Gym - SocioBuddy</title>
        <meta name="description" content="Practice social skills with AI characters. Level up your confidence in 60 seconds!" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => (selectedCharacter ? handleLevelUp() : navigate("/"))}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-primary" />
                Social Gym
              </h1>
              <p className="text-sm text-muted-foreground">Level up your social skills in 60 seconds 🎮</p>
            </div>
            {/* XP display */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">{stats.total_xp} XP</span>
                <span className="text-xs text-muted-foreground">Lv.{xpInfo.level}</span>
              </div>
            )}
            {selectedCharacter && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-sm font-bold text-primary">{getConfidenceScore()}%</p>
              </div>
            )}
          </div>
        </div>

        {!selectedCharacter ? (
          <div className="container mx-auto px-4 py-8 flex-1">
            {/* Stats bar */}
            {user && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in">
                <div className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                  <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{stats.total_xp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">Lv.{xpInfo.level}</p>
                  <p className="text-xs text-muted-foreground">{xpInfo.title}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                  <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{stats.sessions_completed}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                  <Award className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{stats.badges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>
            )}

            {/* Badges row */}
            {user && (
              <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((badge) => {
                    const earned = stats.badges.includes(badge.id);
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                          earned
                            ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                            : "border-border bg-card/30 text-muted-foreground opacity-50"
                        )}
                        title={badge.description}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {badge.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "characters" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("characters")}
                className="uppercase tracking-wider text-xs font-bold"
              >
                <Dumbbell className="h-3.5 w-3.5 mr-1" /> Characters
              </Button>
              <Button
                variant={activeTab === "leaderboard" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("leaderboard")}
                className="uppercase tracking-wider text-xs font-bold"
              >
                <Medal className="h-3.5 w-3.5 mr-1" /> Leaderboard
              </Button>
            </div>

            {activeTab === "characters" ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Opponent</h2>
                  <p className="text-muted-foreground">Pick a character and practice real conversations</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {characters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => startConversation(char)}
                      className="neon-border rounded-2xl p-8 bg-card/50 backdrop-blur-sm text-left transition-all duration-300 hover:shadow-[0_0_40px_hsl(120_100%_50%/0.25)] hover:scale-[1.03] group relative"
                    >
                      {stats.characters_tried.includes(char.id) && (
                        <span className="absolute top-3 right-3 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">✓ Tried</span>
                      )}
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{char.emoji}</div>
                      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors mb-2">{char.name}</h3>
                      <p className="text-sm text-muted-foreground">{char.description}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Leaderboard */
              <div className="max-w-xl mx-auto animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">🏆 Top Players</h2>
                {leaderboardLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No players yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => {
                      const rankIcon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                      const isMe = user?.id === entry.user_id;
                      return (
                        <div
                          key={entry.user_id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            isMe ? "border-primary/40 bg-primary/10" : "border-border bg-card/50"
                          )}
                        >
                          <span className="text-lg w-8 text-center font-bold">{rankIcon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-semibold text-sm truncate", isMe ? "text-primary" : "text-foreground")}>
                              {entry.username} {isMe && "(You)"}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.sessions_completed} sessions • {entry.badges?.length || 0} badges</p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-bold text-primary">{entry.total_xp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCharacter.emoji}</span>
                <div>
                  <p className="font-bold text-foreground">{selectedCharacter.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCharacter.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </Button>
                <Button variant="outline" size="sm" onClick={handleLevelUp} className="gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Level Up
                </Button>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="px-4 pb-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${getConfidenceScore()}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">+{messageCount * 10} XP this session</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <span className="text-5xl block">{selectedCharacter.emoji}</span>
                  <p className="text-muted-foreground text-sm">Start the conversation! Say something to {selectedCharacter.name}.</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("rounded-2xl px-4 py-3 max-w-[80%]", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
              <Input
                placeholder={`Say something to ${selectedCharacter.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default SocialGym;
