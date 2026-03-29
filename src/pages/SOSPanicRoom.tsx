import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, AlertTriangle, Heart, Shield, Phone, Users, Frown, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SOS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sos-panic-chat`;

const presets = [
  { icon: AlertTriangle, label: "Panic attack in public", message: "I'm having a panic attack in public right now and I don't know what to do" },
  { icon: Users, label: "Left out of a group", message: "My friends left me out of their plans and I feel so hurt and excluded" },
  { icon: MessageSquare, label: "Awkward silence", message: "I'm stuck in an awkward silence with someone and I'm freezing up" },
  { icon: Shield, label: "Being bullied right now", message: "Someone is bullying me right now and I don't know how to handle it" },
  { icon: Frown, label: "Fight with a friend", message: "I just had a huge fight with my best friend and I feel terrible" },
  { icon: Heart, label: "Feeling completely alone", message: "I feel completely alone and like nobody cares about me" },
];

const SOSPanicRoom = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (allMessages: Msg[]) => {
    setIsLoading(true);
    let assistantSoFar = "";

    try {
      const resp = await fetch(SOS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        toast.error(err.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      toast.error("Connection error. Please try again.");
    }
    setIsLoading(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setShowChat(true);
    await streamChat(newMessages);
  };

  const handlePreset = (message: string) => {
    setShowChat(true);
    sendMessage(message);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-destructive/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl animate-pulse" style={{ animationDelay: "-1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-red-500/5 blur-3xl animate-pulse" style={{ animationDelay: "-3s" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_80%_50%/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_80%_50%/0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container relative mx-auto px-4 pt-6 pb-20 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
              <div className="absolute inset-0 blur-md bg-destructive/40 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-foreground">
                SOS <span className="text-destructive">Panic Room</span>
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Immediate support when you need it</p>
            </div>
          </div>
        </div>

        {/* Safety disclaimer */}
        <div className="mb-6 p-3 rounded-xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive font-bold">If you're in danger</span>, contact a trusted adult or call{" "}
              <span className="text-foreground font-semibold">iCall: 9152987821</span> |{" "}
              <span className="text-foreground font-semibold">Vandrevala Foundation: 1860-2662-345</span>
            </p>
          </div>
        </div>

        {!showChat ? (
          /* Preset situation cards */
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">What's happening?</h2>
              <p className="text-sm text-muted-foreground">Tap a situation or type your own below</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(preset.message)}
                  className="group p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-destructive/30 hover:shadow-[0_0_30px_hsl(0_80%_50%/0.1)] transition-all duration-300 text-left flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                    <preset.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-destructive transition-colors">{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="mt-6 p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Or describe what's happening in your own words..."
                className="bg-transparent border-none resize-none focus-visible:ring-0 text-sm min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase tracking-wider"
                >
                  <Send className="h-4 w-4 mr-1" /> Get Help
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Chat interface */
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 min-h-[400px] max-h-[60vh] overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-destructive/20 text-foreground rounded-br-md"
                        : "bg-card border border-border/50 text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                    {msg.role === "assistant" && i === messages.length - 1 && isLoading && (
                      <span className="inline-block w-1.5 h-4 bg-destructive/60 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-destructive/60 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-destructive/60 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-2 h-2 rounded-full bg-destructive/60 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me more about what's happening..."
                className="bg-card/30 backdrop-blur-sm border-border/50 resize-none text-sm min-h-[44px] max-h-[100px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shrink-0 h-[44px] w-[44px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Back to presets */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowChat(false); setMessages([]); }}
              className="text-muted-foreground text-xs"
            >
              ← Back to situations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSPanicRoom;
