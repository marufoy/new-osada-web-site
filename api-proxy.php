<?php
// api-proxy.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// .htaccessから環境変数を取得（本番環境）
$apiKey = $_SERVER['MICROCMS_API_KEY'] ?? '';
$serviceDomain = $_SERVER['MICROCMS_SERVICE_DOMAIN'] ?? '';

// ローカル環境：環境変数がない場合はフォールバック値を使用
if (empty($apiKey) || empty($serviceDomain)) {
    $apiKey = 'rTWbnMYGrd4MTgyuFOLytuDtxWWxPVSb43Zc';
    $serviceDomain = 'iymoqayrww';
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
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "X-MICROCMS-API-KEY: {$apiKey}\r\n"
    ]
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch data from microCMS']);
    exit;
}

echo $response;
?>

