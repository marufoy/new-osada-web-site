<?php
// api-proxy.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// エラー表示を有効化（開発環境用）
error_reporting(E_ALL);
ini_set('display_errors', 1);

// .htaccessから環境変数を取得（本番環境）
$apiKey = $_SERVER['MICROCMS_API_KEY'] ?? '';
$serviceDomain = $_SERVER['MICROCMS_SERVICE_DOMAIN'] ?? '';

// ローカル環境：環境変数がない場合はlocal.config.phpから取得
if (empty($apiKey) || empty($serviceDomain)) {
    if (file_exists('local.config.php')) {
        // local.config.phpから設定を読み込む
        // local.config.phpはJSONを返すPHPファイルなので、出力をキャプチャしてパース
        ob_start();
        include 'local.config.php';
        $jsonOutput = ob_get_clean();
        $localConfig = json_decode($jsonOutput, true);
        
        if ($localConfig && isset($localConfig['apiKey']) && isset($localConfig['serviceDomain'])) {
            $apiKey = $localConfig['apiKey'];
            $serviceDomain = $localConfig['serviceDomain'];
        }
    }
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
// ローカル環境でcurl/opensslが無効な場合は、クライアント側で直接呼ぶように指示
$response = false;
$httpCode = 500;
$errorMessage = '';

// curlが利用可能か確認
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-MICROCMS-API-KEY: {$apiKey}"
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false || !empty($curlError)) {
        $errorMessage = $curlError;
    }
} else {
    // curlが使えない場合、ローカル環境では直接呼ぶように指示
    http_response_code(200);
    echo json_encode([
        'useDirectCall' => true,
        'url' => $url,
        'apiKey' => $apiKey,
        'message' => 'Server-side proxy not available. Use direct API call in local environment.'
    ]);
    exit;
}

if ($response === false || !empty($errorMessage)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch data from microCMS',
        'url' => $url,
        'curl_error' => $errorMessage,
        'http_code' => $httpCode
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

