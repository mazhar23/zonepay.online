// Supabase Edge Function — proxies bill-fetch requests to APIclub
// Deploy with: npx supabase functions deploy fetch-bill --project-ref ivvtryddebbizflmvdzz

// Set this as a Supabase secret, never in source:
//   npx supabase secrets set APICLUB_KEY=...
const APICLUB_KEY = Deno.env.get('APICLUB_KEY');
const APICLUB_URL = 'https://api.apiclub.in/api/v1/fetch_bill';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!APICLUB_KEY) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Server not configured: APICLUB_KEY is missing' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { consumer_no, operator, params } = body;

    if (!consumer_no || !operator) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'consumer_no and operator are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the payload for APIclub
    const apiPayload = { consumer_no, operator };
    if (params) {
      apiPayload.params = params;
    }

    // Call the real APIclub API from the server side (no CORS issue)
    const apiRes = await fetch(APICLUB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APICLUB_KEY,
      },
      body: JSON.stringify(apiPayload),
    });

    const data = await apiRes.json();

    return new Response(
      JSON.stringify(data),
      {
        status: apiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
