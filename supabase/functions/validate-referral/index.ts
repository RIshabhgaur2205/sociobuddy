import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, referralCode } = await req.json();
    
    console.log('Validating referral code:', referralCode, 'for user:', userId);

    if (!userId || !referralCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId or referralCode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the referral code
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('code', referralCode.toUpperCase().trim())
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      console.log('Referral code not found or inactive:', referralCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or inactive referral code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code has expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      console.log('Referral code expired:', referralCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Referral code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if max uses reached
    if (codeData.max_uses !== null && codeData.current_uses >= codeData.max_uses) {
      console.log('Referral code max uses reached:', referralCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Referral code has reached maximum uses' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has this role
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', codeData.role)
      .single();

    if (existingRole) {
      console.log('User already has role:', codeData.role);
      return new Response(
        JSON.stringify({ success: true, message: 'User already has this role', role: codeData.role }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the role for the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: codeData.role });

    if (roleError) {
      console.error('Error inserting role:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to assign role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment the usage count
    await supabaseAdmin
      .from('referral_codes')
      .update({ current_uses: codeData.current_uses + 1 })
      .eq('id', codeData.id);

    console.log('Successfully assigned role:', codeData.role, 'to user:', userId);

    return new Response(
      JSON.stringify({ success: true, role: codeData.role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-referral function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
