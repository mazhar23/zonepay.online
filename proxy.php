<?php
// proxy.php
// This acts as a bridge between the browser and APIclub to bypass CORS.

// Allow cross-origin requests from your frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-api-key");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 1. Get the frontend JSON payload
$data = file_get_contents('php://input');

// 2. Define the exact APIclub endpoint and API key
$url = 'https://prod.apiclub.in/api/v1/fetch_bill';
$apiKey = 'apclb_5lptSLyLopA42cLtcit0M6DKcdd32711';

// 3. Set up cURL to forward the request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey
]);

// 4. Execute and return the exact response to the frontend
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
