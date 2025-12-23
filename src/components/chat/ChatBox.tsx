import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBox = ({ isOpen, onClose }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("chat-messages")
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
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = () => {
    if (username.trim().length < 2) {
      toast.error("Username must be at least 2 characters");
      return;
    }
    setIsJoined(true);
    toast.success(`Welcome, ${username}!`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-card rounded-2xl shadow-card border border-border overflow-hidden z-50 animate-scale-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral to-coral-light p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
          <span className="font-bold text-primary-foreground">Community Chat</span>
        </div>
        <button
          onClick={onClose}
          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!isJoined ? (
        /* Join form */
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground text-sm text-center">
            Enter a nickname to join the chat
          </p>
          <Input
            placeholder="Your nickname..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            maxLength={20}
          />
          <Button onClick={handleJoin} className="w-full">
            Join Chat
          </Button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Be the first to say hi! 👋
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.username === username ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {msg.username}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                      msg.username === username
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border flex gap-2"
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;
