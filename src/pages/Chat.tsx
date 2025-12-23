import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineCount] = useState(Math.floor(Math.random() * 50) + 10);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = () => {
    if (username.trim().length < 2) {
      toast.error("Username must be at least 2 characters");
      return;
    }
    setIsJoined(true);
    toast.success(`Welcome to the community, ${username}!`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const { error } = await supabase.from("chat_messages").insert({
      username: username.trim(),
      message: newMessage.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setIsLoading(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Helmet>
        <title>Community Chat - SocioBuddy</title>
        <meta
          name="description"
          content="Join the SocioBuddy community chat and connect with other teenagers. Share experiences, make friends, and overcome social anxiety together."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-mint px-3 py-1.5 rounded-full">
                <MessageCircle className="h-4 w-4 text-teal" />
                <span className="text-sm font-medium text-teal">Community Chat</span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{onlineCount} online</span>
              </div>
            </div>
          </div>
        </header>

        {!isJoined ? (
          /* Join Screen */
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-card animate-scale-in">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full gradient-hero mx-auto flex items-center justify-center mb-6">
                  <MessageCircle className="h-10 w-10 text-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Join the Community</h1>
                <p className="text-muted-foreground">
                  Connect with other teens in our safe, supportive chat room
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Choose a nickname
                  </label>
                  <Input
                    placeholder="e.g., FriendlyPanda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    maxLength={20}
                    className="text-center text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    2-20 characters, keep it friendly!
                  </p>
                </div>

                <Button onClick={handleJoin} size="xl" className="w-full">
                  Enter Chat Room
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By joining, you agree to be respectful and kind to others
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Room */
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to start the conversation! 👋
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.username === username ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-[60%] ${
                        msg.username === username ? "order-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.username !== username && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-light to-teal flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {msg.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {msg.username === username ? "You" : msg.username}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.username === username
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-card border border-border rounded-tl-sm"
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card p-4 sticky bottom-0">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-2xl mx-auto">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={500}
                  className="flex-1 h-12 text-base"
                />
                <Button type="submit" size="lg" disabled={isLoading || !newMessage.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="hidden sm:inline ml-2">Send</span>
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Be kind and respectful. This is a safe space for everyone.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chat;
