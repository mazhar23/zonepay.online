// Local test harness for the bill-fetch API.
// Usage: APICLUB_KEY=apclb_xxx node test_api.js
// The key is read from the environment so it never lands in source control.

const APICLUB_KEY = process.env.APICLUB_KEY;
const APICLUB_URL = 'https://api.apiclub.in/api/v1/fetch_bill';

async function testFetch() {
  if (!APICLUB_KEY) {
    console.error('APICLUB_KEY is not set. Export it before running this script.');
    return;
  }

  try {
    const res = await fetch(APICLUB_URL, {
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
