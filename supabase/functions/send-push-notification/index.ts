import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Push library for Deno
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const encoder = new TextEncoder();
  
  // Generate ECDH key pair for encryption
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Import subscriber's public key
  const p256dhBuffer = Uint8Array.from(atob(subscription.p256dh.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const subscriberPublicKey = await crypto.subtle.importKey(
    "raw",
    p256dhBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKeyBuffer = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyBuffer);

  // Auth secret
  const authBuffer = Uint8Array.from(atob(subscription.auth.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

  // Create encryption key using HKDF
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const ikm = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(sharedSecret),
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );

  const prk = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: authBuffer,
      info: encoder.encode("Content-Encoding: auth\0"),
    },
    ikm,
    256
  );

  const prkKey = await crypto.subtle.importKey("raw", new Uint8Array(prk), { name: "HKDF" }, false, ["deriveBits"]);

  const context = new Uint8Array([
    ...encoder.encode("P-256\0"),
    0, 65, ...p256dhBuffer,
    0, 65, ...localPublicKey,
  ]);

  const contentEncryptionKeyInfo = new Uint8Array([
    ...encoder.encode("Content-Encoding: aesgcm\0"),
    ...context,
  ]);

  const nonceInfo = new Uint8Array([
    ...encoder.encode("Content-Encoding: nonce\0"),
    ...context,
  ]);

  const contentEncryptionKeyBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: contentEncryptionKeyInfo },
    prkKey,
    128
  );

  const nonceBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: nonceInfo },
    prkKey,
    96
  );

  const contentEncryptionKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(contentEncryptionKeyBits),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Pad and encrypt payload
  const payloadBytes = encoder.encode(payload);
  const paddingLength = 2;
  const paddedPayload = new Uint8Array(paddingLength + payloadBytes.length);
  paddedPayload[0] = 0;
  paddedPayload[1] = 0;
  paddedPayload.set(payloadBytes, paddingLength);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(nonceBits) },
    contentEncryptionKey,
    paddedPayload
  );

  const body = new Uint8Array(encrypted);

  // Create VAPID JWT
  const vapidPayload = {
    aud: new URL(subscription.endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: "mailto:notifications@vibecheck.app",
  };

  const jwtHeader = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const jwtPayload = btoa(JSON.stringify(vapidPayload))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const signatureInput = encoder.encode(`${jwtHeader}.${jwtPayload}`);

  // Import VAPID private key
  const vapidPrivateKeyBuffer = Uint8Array.from(
    atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")),
    c => c.charCodeAt(0)
  );

  const vapidKey = await crypto.subtle.importKey(
    "pkcs8",
    vapidPrivateKeyBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    vapidKey,
    signatureInput
  );

  const jwtSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const jwt = `${jwtHeader}.${jwtPayload}.${jwtSignature}`;

  const vapidPublicKeyForAuth = vapidPublicKey.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  // Send the push notification
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      "Content-Length": body.length.toString(),
      "Encryption": `salt=${btoa(String.fromCharCode(...salt)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`,
      "Crypto-Key": `dh=${btoa(String.fromCharCode(...localPublicKey)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")};p256ecdsa=${vapidPublicKeyForAuth}`,
      "Authorization": `vapid t=${jwt}, k=${vapidPublicKeyForAuth}`,
      "TTL": "86400",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status} ${await response.text()}`);
  }

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, url } = await req.json();

    if (!userId || !title || !body) {
      throw new Error("Missing required fields: userId, title, body");
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({ title, body, url: url || "/" });
    const results = [];

    for (const sub of subscriptions) {
      try {
        await sendWebPush(sub, payload, vapidPublicKey, vapidPrivateKey);
        results.push({ endpoint: sub.endpoint, success: true });
      } catch (err: unknown) {
        console.error("Failed to send to subscription:", err);
        const errMessage = err instanceof Error ? err.message : "Unknown error";
        results.push({ endpoint: sub.endpoint, success: false, error: errMessage });
        
        // Remove invalid subscriptions
        if (errMessage.includes("410") || errMessage.includes("404")) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
