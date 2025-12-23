import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface MatchedProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

const Conversation = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !matchId) return;

    const fetchMatchAndMessages = async () => {
      // Fetch match details to get the other user
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .eq("id", matchId)
        .eq("status", "accepted")
        .maybeSingle();

      if (matchError || !match) {
        toast({ title: "Match not found", variant: "destructive" });
        navigate("/matches");
        return;
      }

      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

      // Fetch other user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", otherUserId)
        .maybeSingle();

      if (profile) {
        setMatchedProfile(profile);
      }

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, content, sender_id, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }

      setLoading(false);
    };

    fetchMatchAndMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, matchId, navigate, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !matchId || sending) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chat with {matchedProfile?.username || "Match"} | VibeCheck</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/matches")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={matchedProfile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {matchedProfile?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">{matchedProfile?.username}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet.</p>
              <p className="text-sm mt-1">Say hi to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Conversation;
