import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const characterPrompts: Record<string, string> = {
  "cool-crush":
    "You are a cool, friendly person that the user has a crush on. Be flirty but not over the top. Sometimes be a bit mysterious. Keep responses short (1-2 sentences). React naturally to what they say. If they're awkward, be gently teasing but kind. You're at a school hangout.",
  "rude-cashier":
    "You are a rude, impatient cashier at a store. Be short-tempered and slightly dismissive, but not cruel. The user is practicing standing up for themselves politely. If they handle the situation well, gradually become less rude. Keep responses short (1-2 sentences).",
  "strict-teacher":
    "You are a strict but fair teacher. The user is a student trying to participate in class or ask for help. Be somewhat intimidating initially but warm up if they're respectful. Ask follow-up questions. Keep responses short (1-2 sentences).",
  "stranger-party":
    "You are a stranger at a party. Be friendly but give short answers initially — make the user work to keep the conversation going. If they find common interests, become more engaged. Keep responses short (1-2 sentences).",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, characterId } = await req.json();

    if (!characterId || !characterPrompts[characterId]) {
      return new Response(JSON.stringify({ error: "Invalid character" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `${characterPrompts[characterId]}

IMPORTANT RULES:
- Stay in character at all times
- Keep responses short: 1-2 sentences max
- React naturally and realistically
- This is a practice exercise for a teenager learning social skills
- Never break character or mention that you're an AI
- Be age-appropriate at all times`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("social-gym-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
