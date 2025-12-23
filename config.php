<?php
// config.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 本番環境：.htaccessから環境変数を取得
$apiKey = $_SERVER['MICROCMS_API_KEY'] ?? '';
$serviceDomain = $_SERVER['MICROCMS_SERVICE_DOMAIN'] ?? '';

// ローカル環境：環境変数がない場合はフォールバック値を使用
if (empty($apiKey) || empty($serviceDomain)) {
    $apiKey = 'rTWbnMYGrd4MTgyuFOLytuDtxWWxPVSb43Zc';
    $serviceDomain = 'iymoqayrww';
}

$config = [
    'apiKey' => $apiKey,
    'serviceDomain' => $serviceDomain
];

echo json_encode($config);
?>