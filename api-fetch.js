// api-fetch.js
// プロキシAPI経由でmicroCMSを呼び出す共通関数
// すべてのAPI呼び出しはapi-proxy.php経由で行う（APIキーはサーバーサイドにのみ存在）

async function fetchMicroCMS(endpoint, options = {}) {
    const { limit, orders, id } = options;
    
    // プロキシAPI経由で呼び出し
    let url = `api-proxy.php?endpoint=${endpoint}`;
    if (limit) url += `&limit=${limit}`;
    if (orders) url += `&orders=${orders}`;
    if (id) url += `&id=${id}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        // エラーレスポンスの内容を取得して表示
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.error) {
                errorMessage = errorData.error;
            }
            // デバッグ情報をコンソールに出力
            console.error('API Error Details:', errorData);
        } catch (e) {
            // JSONパースに失敗した場合はテキストを取得
            const text = await response.text();
            console.error('API Error Response:', text);
        }
        throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // エラーチェック
    if (data.error) {
        console.error('API Error in response:', data);
        throw new Error(data.error);
    }
    
    // useDirectCallフラグのチェック（curlが使えない場合）
    if (data.useDirectCall) {
        throw new Error('Server-side proxy is not available. Please enable curl extension in PHP or use a different environment.');
    }
    
    return data;
}

