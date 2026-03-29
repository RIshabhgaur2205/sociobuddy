import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, RotateCcw, TrendingUp, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Character {
  id: string;
  emoji: string;
  name: string;
  description: string;
  systemPrompt: string;
}

const characters: Character[] = [
  {
    id: "cool-crush",
    emoji: "😎",
    name: "Cool Crush",
    description: "Practice talking to someone you like",
    systemPrompt: "You are a cool, friendly person that the user has a crush on. Be flirty but not over the top. Sometimes be a bit mysterious. Keep responses short (1-2 sentences). React naturally to what they say. If they're awkward, be gently teasing but kind.",
  },
  {
    id: "rude-cashier",
    emoji: "😡",
    name: "Rude Cashier",
    description: "Handle difficult people with grace",
    systemPrompt: "You are a rude, impatient cashier at a store. Be short-tempered and slightly dismissive, but not cruel. The user is practicing standing up for themselves politely. If they handle the situation well, gradually become less rude. Keep responses short (1-2 sentences).",
  },
  {
    id: "strict-teacher",
    emoji: "👨‍🏫",
    name: "Strict Teacher",
    description: "Practice speaking up in class",
    systemPrompt: "You are a strict but fair teacher. The user is a student trying to participate in class or ask for help. Be somewhat intimidating initially but warm up if they're respectful. Ask follow-up questions. Keep responses short (1-2 sentences).",
  },
  {
    id: "stranger-party",
    emoji: "🤝",
    name: "Stranger at Party",
    description: "Make small talk with someone new",
    systemPrompt: "You are a stranger at a party. Be friendly but give short answers initially — make the user work to keep the conversation going. If they find common interests, become more engaged. Keep responses short (1-2 sentences).",
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/social-gym-chat`;

const SocialGym = () => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getConfidenceScore = () => {
    if (messageCount === 0) return 0;
    return Math.min(100, Math.round((messageCount / 10) * 100));
  };

  const getLevel = () => {
    const score = getConfidenceScore();
    if (score >= 80) return { label: "Social Pro", color: "text-primary" };
    if (score >= 50) return { label: "Getting There", color: "text-yellow-400" };
    if (score >= 20) return { label: "Warming Up", color: "text-orange-400" };
    return { label: "Beginner", color: "text-muted-foreground" };
  };

  const startConversation = (character: Character) => {
    setSelectedCharacter(character);
    setMessages([]);
    setMessageCount(0);
  };

  const handleRetry = () => {
    if (selectedCharacter) {
      setMessages([]);
      setMessageCount(0);
    }
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
        body: JSON.stringify({
          messages: updatedMessages,
          characterId: selectedCharacter.id,
        }),
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
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
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

  const level = getLevel();

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
            <Button variant="ghost" size="icon" onClick={() => selectedCharacter ? setSelectedCharacter(null) : navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-primary" />
                Social Gym
              </h1>
              <p className="text-sm text-muted-foreground">Level up your social skills in 60 seconds 🎮</p>
            </div>
            {selectedCharacter && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className={cn("text-sm font-bold", level.color)}>{getConfidenceScore()}% — {level.label}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {!selectedCharacter ? (
          /* Character Selection */
          <div className="container mx-auto px-4 py-12 flex-1">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Opponent</h2>
              <p className="text-muted-foreground">Pick a character and practice real conversations</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => startConversation(char)}
                  className="neon-border rounded-2xl p-8 bg-card/50 backdrop-blur-sm text-left transition-all duration-300 hover:shadow-[0_0_40px_hsl(120_100%_50%/0.25)] hover:scale-[1.03] group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {char.emoji}
                  </div>
                  <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors mb-2">
                    {char.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{char.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
            {/* Character badge */}
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
                <Button variant="outline" size="sm" onClick={() => setSelectedCharacter(null)} className="gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Level Up
                </Button>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="px-4 pb-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${getConfidenceScore()}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <span className="text-5xl block">{selectedCharacter.emoji}</span>
                  <p className="text-muted-foreground text-sm">
                    Start the conversation! Say something to {selectedCharacter.name}.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    )}
                  >
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

            {/* Input */}
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
