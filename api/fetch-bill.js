export default async function handler(req, res) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const APICLUB_URL = 'https://api.apiclub.in/api/v1/fetch_bill';
    const APICLUB_KEY = 'apclb_5lptSLyLopA42cLtcit0M6DKcdd32711';

    // Forward the POST request to APIclub
    const fetchResponse = await fetch(APICLUB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APICLUB_KEY
      },
      body: JSON.stringify(req.body)
    });

    const data = await fetchResponse.json();
    
    // Pass the response status and data back to the client
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(fetchResponse.status).json(data);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ status: 'error', message: 'Internal Server Error: Proxy Failed', details: error.message });
  }
}
