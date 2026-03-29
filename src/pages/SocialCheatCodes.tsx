import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Zap, Laugh, Flame, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "Funny" | "Savage" | "Polite" | "Confident";

const toneIcons: Record<Tone, typeof Laugh> = {
  Funny: Laugh,
  Savage: Flame,
  Polite: Heart,
  Confident: Shield,
};

interface Scenario {
  id: string;
  title: string;
  emoji: string;
  replies: Record<Tone, string[]>;
}

const scenarios: Scenario[] = [
  {
    id: "hey-reply",
    title: "How to reply to \"Hey\" without being boring",
    emoji: "👋",
    replies: {
      Funny: [
        "Hey! Did you know penguins propose with pebbles? Anyway, what's up? 🐧",
        "Heyy! Quick question — pizza or tacos? This determines our friendship 🍕🌮",
        "Hey back! Plot twist: I was literally just thinking about texting you 😂",
      ],
      Savage: [
        "Hey? That's it? I know you can do better than that 😏",
        "Oh wow, a 'hey'. The creativity is unmatched 🔥",
        "Hey yourself. Now say something interesting 💅",
      ],
      Polite: [
        "Hey! How's your day going so far? 😊",
        "Hi there! It's nice to hear from you! What have you been up to?",
        "Hey! Hope you're having a great day! Anything exciting happening?",
      ],
      Confident: [
        "Heyyy! Perfect timing — I've got the best story to tell you 🎬",
        "What's good! I was just about to text you actually 😎",
        "Hey! Glad you texted first this time 😄",
      ],
    },
  },
  {
    id: "leave-gc",
    title: "How to leave a boring group chat politely",
    emoji: "💬",
    replies: {
      Funny: [
        "Alright fam, my phone is about to die... emotionally. Catch y'all later! 😂",
        "I gotta go touch some grass. Peace out ✌️🌿",
        "My mom said I need to go. (I'm 17 but still works) 😅",
      ],
      Savage: [
        "This chat has the same energy as a dead WiFi signal. I'm out ✌️",
        "I'm leaving before my brain cells do 💀",
        "Not me pretending to be busy... actually I AM busy now. Bye 👋",
      ],
      Polite: [
        "Hey everyone, gotta head out for a bit! Talk later 😊",
        "Catching up on some stuff, will check back in later! Have fun!",
        "Need to focus on something rn, but great chatting with y'all!",
      ],
      Confident: [
        "Alright I'm heading out — hit me up if anything important happens 🫡",
        "Gonna go be productive for once. DM me the highlights later 😎",
        "Peace out everyone! Catch me in the DMs if you need me 🚀",
      ],
    },
  },
  {
    id: "dead-convo",
    title: "How to restart a dead conversation",
    emoji: "💀",
    replies: {
      Funny: [
        "So... did we both just forget this chat existed? 😂 Anyway, what's new?",
        "*blows dust off chat* Hey stranger! How've you been? 🌪️",
        "This chat has been dead longer than my houseplant 🪴 Let's fix that!",
      ],
      Savage: [
        "I know we both saw each other's messages and ignored them. Let's start fresh 💅",
        "Coming back to this chat like nothing happened. What's up? 🔥",
        "We're both bad at texting, let's just accept it and move on 😏",
      ],
      Polite: [
        "Hey! It's been a while — how have you been? Would love to catch up! 😊",
        "Hi! I've been thinking about our last conversation. How are things going?",
        "It's been too long! What's new in your life? I'd love to hear about it!",
      ],
      Confident: [
        "Okay I'm just gonna say it — I miss talking to you. What's up? 😎",
        "Back from the dead and I've got stories. Wanna hear? 🎬",
        "Let's pretend this awkward silence never happened. So anyway... 🚀",
      ],
    },
  },
  {
    id: "text-crush",
    title: "How to text your crush confidently",
    emoji: "💘",
    replies: {
      Funny: [
        "Random but — if you were a pizza topping, you'd be the extra cheese 🧀 (smooth, right?)",
        "My friend dared me to text my crush so... hi 👀😂",
        "I was going to play it cool but that's not really my thing. Hey! 🙃",
      ],
      Savage: [
        "I'm texting you first because someone has to have taste around here 💅",
        "Don't leave me on read or I'll screenshot it and roast you 😏",
        "You're welcome for making your notifications interesting today 🔥",
      ],
      Polite: [
        "Hey! I really enjoyed talking to you the other day. Would love to chat more! 😊",
        "Hi! I noticed we have similar interests — have you seen [show/movie]?",
        "Hey! Your [story/post] was really cool. Where was that? ☀️",
      ],
      Confident: [
        "Okay real talk — I think you're pretty cool and wanted to say hi 😎",
        "I've been meaning to text you. So here I am, making moves 🚀",
        "Life's too short to not text people you like. So hey! What are you up to?",
      ],
    },
  },
];

const SocialCheatCodes = () => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<Tone>("Funny");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Social Cheat Codes - SocioBuddy</title>
        <meta name="description" content="Ready-made conversation lines for every social situation. Never feel stuck or awkward again!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Social Cheat Codes
              </h1>
              <p className="text-sm text-muted-foreground">Ready-made scripts for every situation 🎮</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Tone Toggle */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {(Object.keys(toneIcons) as Tone[]).map((tone) => {
              const Icon = toneIcons[tone];
              return (
                <button
                  key={tone}
                  onClick={() => setActiveTone(tone)}
                  className={cn(
                    "px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border",
                    activeTone === tone
                      ? "bg-primary text-primary-foreground border-primary shadow-neon scale-105"
                      : "bg-card/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tone}
                </button>
              );
            })}
          </div>

          {/* Scenario Cards */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {scenarios.map((scenario) => {
              const isExpanded = expandedCard === scenario.id;
              return (
                <div
                  key={scenario.id}
                  className={cn(
                    "neon-border rounded-2xl bg-card/50 backdrop-blur-sm transition-all duration-500 cursor-pointer group",
                    isExpanded ? "sm:col-span-2 shadow-neon" : "hover:shadow-[0_0_30px_hsl(120_100%_50%/0.2)]"
                  )}
                >
                  {/* Card Header */}
                  <div
                    className="p-6 flex items-center gap-4"
                    onClick={() => setExpandedCard(isExpanded ? null : scenario.id)}
                  >
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {scenario.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {scenario.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isExpanded ? "Click to collapse" : "Click to see scripts →"}
                      </p>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300",
                      isExpanded && "rotate-45"
                    )}>
                      <span className="text-primary text-xl font-bold">+</span>
                    </div>
                  </div>

                  {/* Expanded Replies */}
                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-3 animate-fade-in">
                      <div className="h-px bg-border mb-4" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">
                        {activeTone} replies:
                      </p>
                      {scenario.replies[activeTone].map((reply, idx) => {
                        const copyId = `${scenario.id}-${activeTone}-${idx}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group/reply"
                          >
                            <p className="flex-1 text-sm text-foreground leading-relaxed">{reply}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(reply, copyId);
                              }}
                              className="shrink-0 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                            >
                              {copiedIndex === copyId ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground group-hover/reply:text-primary transition-colors" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialCheatCodes;
