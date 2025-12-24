<?php
// api-proxy.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// エラー表示の設定（本番環境では無効化）
// ローカル環境かどうかを判定（localhostまたは127.0.0.1の場合は開発環境とみなす）
$isLocal = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', 'localhost:8000', '127.0.0.1:8000']);

if ($isLocal) {
    // 開発環境：エラー表示を有効化
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    // 本番環境：エラー表示を無効化
    error_reporting(0);
    ini_set('display_errors', 0);
}

// .htaccessから環境変数を取得（本番環境）
$apiKey = $_SERVER['MICROCMS_API_KEY'] ?? '';
$serviceDomain = $_SERVER['MICROCMS_SERVICE_DOMAIN'] ?? '';

// ローカル環境：環境変数がない場合はlocal.config.phpから取得
if (empty($apiKey) || empty($serviceDomain)) {
    if (file_exists('local.config.php')) {
        // local.config.phpから設定を読み込む
        // local.config.phpはJSONを返すPHPファイルなので、出力をキャプチャしてパース
        try {
            // local.config.phpにincludeされていることを示す定数を定義
            define('INCLUDED_FROM_PROXY', true);
            ob_start();
            include 'local.config.php';
            $jsonOutput = ob_get_clean();
            $localConfig = json_decode($jsonOutput, true);
            
            if ($localConfig && isset($localConfig['apiKey']) && isset($localConfig['serviceDomain'])) {
                $apiKey = $localConfig['apiKey'];
                $serviceDomain = $localConfig['serviceDomain'];
            } else {
                // JSONパースエラーまたは設定が不完全
                error_log('Failed to parse local.config.php or missing keys. Output: ' . $jsonOutput);
            }
        } catch (Exception $e) {
            error_log('Error loading local.config.php: ' . $e->getMessage());
        }
    }
}

// 設定値の検証
if (empty($apiKey) || empty($serviceDomain)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'API configuration is missing',
        'apiKey_set' => !empty($apiKey),
        'serviceDomain_set' => !empty($serviceDomain),
        'local_config_exists' => file_exists('local.config.php')
    ]);
    exit;
}

// リクエストパラメータからエンドポイントとパラメータを取得
$endpoint = $_GET['endpoint'] ?? '';
$limit = $_GET['limit'] ?? '';
$orders = $_GET['orders'] ?? '';
$id = $_GET['id'] ?? '';

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Endpoint is required']);
    exit;
}

// microCMS APIのURLを構築
$url = "https://{$serviceDomain}.microcms.io/api/v1/{$endpoint}";
if ($id) {
    $url .= "/{$id}";
}

// クエリパラメータを構築
$queryParams = [];
if ($limit) $queryParams['limit'] = $limit;
if ($orders) $queryParams['orders'] = $orders;
if (!empty($queryParams)) {
    $url .= '?' . http_build_query($queryParams);
}

// microCMS APIを呼び出し（サーバーサイドで）
// まずcURLを試し、利用できない場合はstream_context_createを使用

$response = false;
$httpCode = 200;

// 方法1: cURLを使用（優先）
if (function_exists('curl_init')) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "X-MICROCMS-API-KEY: {$apiKey}"
        ],
        // 本番環境ではSSL検証を有効化、開発環境では無効化
        CURLOPT_SSL_VERIFYPEER => !$isLocal,
        CURLOPT_SSL_VERIFYHOST => !$isLocal ? 2 : 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10
    ]);
    
    $response = curl_exec($ch);
    
    if ($response !== false) {
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $curlError = curl_error($ch);
        curl_close($ch);
        // cURLでエラーが発生した場合は、次の方法を試す
        error_log("cURL error: {$curlError}");
    }
}

// 方法2: stream_context_createを使用（cURLが利用できない場合のフォールバック）
if ($response === false && ini_get('allow_url_fopen')) {
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "X-MICROCMS-API-KEY: {$apiKey}\r\n",
            'ignore_errors' => true,
            'timeout' => 30
        ],
        'ssl' => [
            // 本番環境ではSSL検証を有効化、開発環境では無効化
            'verify_peer' => !$isLocal,
            'verify_peer_name' => !$isLocal,
            'allow_self_signed' => $isLocal
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false && isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
                $httpCode = (int)$matches[1];
                break;
            }
        }
    }
}

// 両方の方法が失敗した場合
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch data from microCMS. Neither cURL nor allow_url_fopen is available.',
        'url' => $url,
        'curl_available' => function_exists('curl_init'),
        'allow_url_fopen' => ini_get('allow_url_fopen'),
        'openssl_available' => extension_loaded('openssl'),
        'php_version' => PHP_VERSION
    ]);
    exit;
}

if ($httpCode >= 400) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'microCMS API returned an error',
        'url' => $url,
        'http_code' => $httpCode,
        'response' => $response
    ]);
    exit;
}

echo $response;
?>

