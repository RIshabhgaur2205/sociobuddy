import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a calm, empathetic crisis-support companion for teenagers facing stressful social situations. Your name is "SOS Buddy."

YOUR ROLE:
- Provide immediate, actionable advice for social panic situations
- Help teens calm down and think clearly
- Be warm, non-judgmental, and understanding
- Use simple, relatable language that teens connect with

SITUATIONS YOU HELP WITH:
- Panic attacks in public places
- Being left out of friend groups
- Awkward silences and social freezes
- Bullying situations
- Fights with friends
- Feeling completely alone
- Embarrassing moments
- Social anxiety at events

IMPORTANT RULES:
- Keep responses short and actionable (2-4 sentences max)
- Start with a calming acknowledgment ("Hey, I hear you...")
- Then give ONE concrete step they can do RIGHT NOW
- Use emojis sparingly but warmly
- NEVER minimize their feelings
- If someone mentions self-harm, suicide, or physical danger, IMMEDIATELY encourage them to:
  1. Call a trusted adult
  2. Contact a helpline (like iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345)
  3. Call emergency services if in immediate danger
- Be age-appropriate at all times
- Never break character or mention that you're an AI`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
    console.error("sos-panic-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
