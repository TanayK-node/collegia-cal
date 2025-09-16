import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
  eventId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otpCode, eventId }: VerifyOTPRequest = await req.json();

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Find and verify OTP
    const { data: otpRecord, error: otpError } = await supabaseClient
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .eq('event_id', eventId)
      .eq('student_id', user.id)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpError) {
      console.error('Error fetching OTP:', otpError);
      throw new Error('Failed to verify OTP');
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired OTP' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabaseClient
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error updating OTP:', updateError);
      throw new Error('Failed to mark OTP as verified');
    }

    // Create event registration
    const { data: registration, error: registrationError } = await supabaseClient
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: user.id,
        phone_number: phoneNumber,
        status: 'registered'
      })
      .select('ticket_number')
      .single();

    if (registrationError) {
      console.error('Error creating registration:', registrationError);
      if (registrationError.code === '23505') {
        throw new Error('You are already registered for this event');
      }
      throw new Error('Failed to complete registration');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Registration completed successfully!',
        ticketNumber: registration.ticket_number
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});