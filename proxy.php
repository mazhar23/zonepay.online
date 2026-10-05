<?php
// proxy.php
// Bridges the browser to APIclub (which only accepts requests from this
// server's whitelisted IP) and records the fetched bill in Supabase.
//
// It also acts as the trust anchor for the bill amount. After a successful
// fetch it HMAC-signs the amount it received and posts it to app_record_bill.
// app_pay_bill then charges the amount stored in that signed row, so a browser
// cannot choose what it pays. Never let the client supply the amount.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-api-key");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$apiKey = getenv('APICLUB_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Server not configured: APICLUB_KEY is missing']);
    exit;
}

$secret = getenv('BILL_HMAC_SECRET');
if (!$secret) {
    http_response_code(500);
    echo json_encode(['error' => 'Server not configured: BILL_HMAC_SECRET is missing']);
    exit;
}

$raw  = file_get_contents('php://input');
$req  = json_decode($raw, true);
if (!is_array($req)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body']);
    exit;
}

$consumer = trim((string)($req['consumer_no'] ?? ''));
$operator = trim((string)($req['operator'] ?? ''));
if ($consumer === '' || $operator === '') {
    http_response_code(400);
    echo json_encode(['error' => 'consumer_no and operator are required']);
    exit;
}

// ---- 1. Forward to APIclub -------------------------------------------------
$ch = curl_init('https://prod.apiclub.in/api/v1/fetch_bill');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $raw);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey
]);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream request failed: ' . $curlError]);
    exit;
}

$bill = json_decode($response, true);
if (!is_array($bill)) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream returned a non-JSON response']);
    exit;
}

// Mirror the previous behaviour: hand the upstream payload straight back
// unless we can read a bill out of it.
$payload = $bill['response'] ?? $bill['data'] ?? $bill;
if (!is_array($payload)) { $payload = $bill; }
if (!is_array($payload)) {
    http_response_code(502);
    echo json_encode(['error' => 'Unexpected upstream response shape']);
    exit;
}
$amount = null;
foreach (['due_amount', 'bill_amount', 'amount', 'total_amount'] as $k) {
    if (isset($payload[$k]) && is_numeric($payload[$k])) { $amount = (float)$payload[$k]; break; }
}
if ($amount === null || $amount <= 0) {
    http_response_code($httpCode >= 400 ? $httpCode : 502);
    echo $response;
    exit;
}

// ---- 2. Sign and record the amount -----------------------------------------
// Two decimals, no exponent, so the string we sign is byte-identical to the
// one the database reassembles when it verifies the signature.
$amountText = number_format($amount, 2, '.', '');
$expiresAt  = time() + 900; // a fetched bill stays payable for 15 minutes
$requestId  = (string)($payload['request_id'] ?? $payload['bill_no'] ?? ('REQ-' . bin2hex(random_bytes(8))));

$biller    = trim((string)($payload['operator_name'] ?? $operator));
$billNo    = trim((string)($payload['bill_no'] ?? '')) !== '' ? (string)$payload['bill_no'] : null;
$dueDate   = trim((string)($payload['due_date'] ?? $payload['bill_due_date'] ?? '')) !== '' ? (string)($payload['due_date'] ?? $payload['bill_due_date']) : null;

$canonical = $consumer . '|' . $biller . '|' . $amountText . '|' . $expiresAt . '|' . $requestId;
$sig = hash_hmac('sha256', $canonical, $secret);

$recordArgs = [
    'p_consumer'    => $consumer,
    'p_biller'      => $biller,
    'p_amount_text' => $amountText,
    'p_bill_no'     => $billNo,
    'p_due_date'    => $dueDate,
    'p_request_id'  => $requestId,
    'p_expires_at'  => $expiresAt,
    'p_sig'         => $sig,
];

$supabaseUrl = getenv('SUPABASE_URL');
$supabaseKey = getenv('SUPABASE_ANON_KEY');
if (!$supabaseUrl || !$supabaseKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Server not configured: SUPABASE_URL / SUPABASE_ANON_KEY missing']);
    exit;
}

$ch2 = curl_init(rtrim($supabaseUrl, '/') . '/rest/v1/rpc/app_record_bill');
curl_setopt($ch2, CURLOPT_POST, 1);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($recordArgs));
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 20);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey
]);
$recResponse = curl_exec($ch2);
$recHttp     = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$curlErr2    = curl_error($ch2);
curl_close($ch2);

$rec = json_decode((string)$recResponse, true);
$recRow = is_array($rec) ? (($rec[0] ?? null) ?: null) : null;

if ($recHttp >= 400 || !$recRow || empty($recRow['ok'])) {
    // Do not hand back a bill the server cannot vouch for, otherwise the UI
    // would offer a payment that is guaranteed to be refused.
    http_response_code(502);
    echo json_encode([
        'error'   => 'Bill could not be verified for payment',
        'detail'  => $recRow['error'] ?? ($curlErr2 ?: ('HTTP ' . $recHttp)),
    ]);
    exit;
}

// Pass the reference the client must quote back when paying.
$out = is_array($bill) ? $bill : ['response' => $bill];
$out['biller']       = $biller;
$out['bill_ref']     = $recRow['bill_ref'];
$out['bill_amount']  = $amount;
$out['recorded']     = true;

http_response_code(200);
echo json_encode($out);