<?php
// proxy.php
// Bridges the browser to APIclub (which only accepts requests from this
// server's whitelisted IP) and records the fetched bill in Supabase.
//
// It is also the trust anchor for the bill amount. After a successful fetch it
// HMAC-signs the amount it received and posts the signature to app_record_bill.
// app_pay_bill then charges the amount stored in that signed row, so a browser
// cannot choose what it pays. Never let the client supply the amount.
//
// Deliberately written to parse on old PHP (5.6+): no ?? operator, no
// random_bytes(), no scalar type hints. A parse error here returns an empty
// HTTP 500, which is very hard to diagnose from a browser.

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

function jout($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function env_or_null($name) {
    $v = getenv($name);
    if ($v === false || $v === '') { return null; }
    return $v;
}

function random_hex($bytes) {
    if (function_exists('openssl_random_pseudo_bytes')) {
        $raw = openssl_random_pseudo_bytes($bytes);
        if ($raw !== false) { return bin2hex($raw); }
    }
    if (function_exists('random_bytes')) { return bin2hex(random_bytes($bytes)); }
    $out = '';
    for ($i = 0; $i < $bytes; $i++) { $out .= dechex(mt_rand(0, 255)); }
    return $out;
}

// Diagnostics without leaking secret values.
if (isset($_GET['diag'])) {
    jout(200, array(
        'php_version'  => PHP_VERSION,
        'curl'         => function_exists('curl_init') ? 'yes' : 'no',
        'APICLUB_KEY'  => env_or_null('APICLUB_KEY')      ? 'set' : 'MISSING',
        'BILL_HMAC_SECRET' => env_or_null('BILL_HMAC_SECRET') ? 'set' : 'MISSING',
        'SUPABASE_URL' => env_or_null('SUPABASE_URL')     ? 'env' : 'defaulted in code',
        'SUPABASE_ANON_KEY' => env_or_null('SUPABASE_ANON_KEY') ? 'env' : 'defaulted in code',
    ));
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-api-key');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$apiKey = env_or_null('APICLUB_KEY');
$secret = env_or_null('BILL_HMAC_SECRET');

// The project URL and publishable key are public by design (the same pair ships
// in data.js for the browser), so they are defaulted here and only need to be
// set as env vars if you ever point this at a different project. BILL_HMAC_SECRET
// has no default on purpose: it is the trust anchor and must stay server-side.
$supabaseUrl = env_or_null('SUPABASE_URL');
if (!$supabaseUrl) { $supabaseUrl = 'https://ivvtryddebbizflmvdzz.supabase.co'; }
$supabaseKey = env_or_null('SUPABASE_ANON_KEY');
if (!$supabaseKey) { $supabaseKey = 'sb_publishable_MHevw7ZOWkf8vocACWhzeQ_dViUPHdU'; }

if (!$apiKey) { jout(500, array('error' => 'Server not configured: APICLUB_KEY is missing')); }
if (!$secret) { jout(500, array('error' => 'Server not configured: BILL_HMAC_SECRET is missing')); }
if (!function_exists('curl_init')) { jout(500, array('error' => 'PHP cURL extension is not enabled')); }

$raw = file_get_contents('php://input');
$req = json_decode($raw, true);
if (!is_array($req)) { jout(400, array('error' => 'Invalid request body')); }

$consumer = isset($req['consumer_no']) ? trim((string)$req['consumer_no']) : '';
$operator = isset($req['operator'])   ? trim((string)$req['operator'])   : '';
if ($consumer === '' || $operator === '') {
    jout(400, array('error' => 'consumer_no and operator are required'));
}

// ---- 1. Forward to APIclub -------------------------------------------------
$ch = curl_init('https://prod.apiclub.in/api/v1/fetch_bill');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $raw);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'x-api-key: ' . $apiKey));

$response  = curl_exec($ch);
$httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $response === '') {
    jout(502, array('error' => 'Upstream request failed: ' . $curlError));
}

$bill = json_decode($response, true);

// Mirror previous behaviour: hand the upstream payload straight back unless we
// can read a real bill out of it.
$payload = is_array($bill) ? $bill : array();
if (isset($payload['response']) && is_array($payload['response']))      { $payload = $payload['response']; }
elseif (isset($payload['data']) && is_array($payload['data']))          { $payload = $payload['data']; }

$amount = null;
$amountKeys = array('due_amount', 'bill_amount', 'amount', 'total_amount');
foreach ($amountKeys as $k) {
    if (isset($payload[$k]) && is_numeric($payload[$k])) { $amount = (float)$payload[$k]; break; }
}
if ($amount === null || $amount <= 0) {
    http_response_code($httpCode >= 400 ? $httpCode : 502);
    header('Content-Type: application/json');
    echo $response;
    exit;
}

// ---- 2. Sign and record the amount -----------------------------------------
// Fixed to two decimals with no exponent, so the bytes we sign are identical
// to the ones the database reassembles when it verifies the signature.
$amountText = number_format($amount, 2, '.', '');
$expiresAt  = time() + 900; // a fetched bill stays payable for 15 minutes

$requestId = '';
if (isset($payload['request_id']) && $payload['request_id'] !== '') { $requestId = (string)$payload['request_id']; }
elseif (isset($payload['bill_no']) && $payload['bill_no'] !== '')     { $requestId = (string)$payload['bill_no']; }
else { $requestId = 'REQ-' . random_hex(8); }

$biller = isset($payload['operator_name']) && $payload['operator_name'] !== ''
    ? (string)$payload['operator_name'] : $operator;

$billNo = null;
if (isset($payload['bill_no']) && trim((string)$payload['bill_no']) !== '') {
    $billNo = (string)$payload['bill_no'];
}
$dueDate = null;
if (isset($payload['due_date']) && trim((string)$payload['due_date']) !== '') {
    $dueDate = (string)$payload['due_date'];
} elseif (isset($payload['bill_due_date']) && trim((string)$payload['bill_due_date']) !== '') {
    $dueDate = (string)$payload['bill_due_date'];
}

$canonical = $consumer . '|' . $biller . '|' . $amountText . '|' . $expiresAt . '|' . $requestId;
$sig = hash_hmac('sha256', $canonical, $secret);

$recordArgs = array(
    'p_consumer'    => $consumer,
    'p_biller'      => $biller,
    'p_amount_text' => $amountText,
    'p_bill_no'     => $billNo,
    'p_due_date'    => $dueDate,
    'p_request_id'  => $requestId,
    'p_expires_at'  => $expiresAt,
    'p_sig'         => $sig,
);

$ch2 = curl_init(rtrim($supabaseUrl, '/') . '/rest/v1/rpc/app_record_bill');
curl_setopt($ch2, CURLOPT_POST, 1);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($recordArgs));
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 20);
curl_setopt($ch2, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
));
$recResponse = curl_exec($ch2);
$recHttp     = (int)curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$curlErr2    = curl_error($ch2);
curl_close($ch2);

$rec = json_decode((string)$recResponse, true);
$recRow = null;
if (is_array($rec) && isset($rec[0]) && is_array($rec[0])) { $recRow = $rec[0]; }

if ($recHttp >= 400 || $recRow === null || empty($recRow['ok'])) {
    // Do not hand back a bill the server cannot vouch for, otherwise the UI
    // would offer a payment that is guaranteed to be refused.
    $detail = 'unknown';
    if ($recRow !== null && isset($recRow['error'])) { $detail = $recRow['error']; }
    elseif ($curlErr2 !== '')                           { $detail = $curlErr2; }
    else                                                 { $detail = 'HTTP ' . $recHttp; }
    jout(502, array(
        'error'  => 'Bill could not be verified for payment',
        'detail' => $detail,
        'signed' => array(
            'consumer' => $consumer, 'biller' => $biller,
            'amount'   => $amountText, 'expires_at' => $expiresAt,
        ),
    ));
}

$out = array();
if (is_array($bill)) { $out = $bill; }
$out['biller']      = $biller;
$out['bill_ref']    = $recRow['bill_ref'];
$out['bill_amount'] = $amountText;
$out['recorded']    = true;

jout(200, $out);