const APICLUB_KEY = 'apclb_5lptSLyLopA42cLtcit0M6DKcdd32711';
const APICLUB_URL = 'https://api.apiclub.in/api/v1/fetch_bill_operator';

async function testFetch() {
  try {
    const res = await fetch(APICLUB_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APICLUB_KEY
      }
    });
    
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (e) {
    console.error("Error:", e);
  }
}

testFetch();
