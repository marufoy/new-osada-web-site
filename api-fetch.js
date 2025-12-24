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
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // エラーチェック
    if (data.error) {
        throw new Error(data.error);
    }
    
    return data;
}

