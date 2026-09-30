const APICLUB_KEY = 'apclb_5lptSLyLopA42cLtcit0M6DKcdd32711';
const APICLUB_URL = 'https://api.apiclub.in/api/v1/fetch_bill';
const proxyUrl = 'https://thingproxy.freeboard.io/fetch/' + APICLUB_URL;

async function testFetch() {
  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APICLUB_KEY
      },
      body: JSON.stringify({
        consumer_no: "1234567890",
        operator: "ADEM"
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (e) {
    console.error("Error:", e);
  }
}

testFetch();
