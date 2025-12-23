// api-fetch.js
// プロキシAPI経由でmicroCMSを呼び出す共通関数
// ローカル環境でプロキシAPIが使えない場合は直接microCMSを呼ぶ

// ローカル環境用のAPIキー（開発環境のみ）
const LOCAL_API_KEY = 'rTWbnMYGrd4MTgyuFOLytuDtxWWxPVSb43Zc';
const LOCAL_SERVICE_DOMAIN = 'iymoqayrww';

async function fetchMicroCMS(endpoint, options = {}) {
    const { limit, orders, id } = options;
    
    // プロキシAPI経由で呼び出しを試みる
    try {
        let url = `api-proxy.php?endpoint=${endpoint}`;
        if (limit) url += `&limit=${limit}`;
        if (orders) url += `&orders=${orders}`;
        if (id) url += `&id=${id}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // プロキシAPIが失敗した場合（useDirectCallフラグがある場合）
        if (data.useDirectCall || data.error) {
            throw new Error('Proxy API not available');
        }
        
        return data;
    } catch (error) {
        // プロキシAPIが使えない場合、直接microCMSを呼ぶ（ローカル環境用）
        console.warn('Proxy API not available, using direct API call:', error);
        
        let url = `https://${LOCAL_SERVICE_DOMAIN}.microcms.io/api/v1/${endpoint}`;
        if (id) {
            url += `/${id}`;
        }
        
        const queryParams = [];
        if (limit) queryParams.push(`limit=${limit}`);
        if (orders) queryParams.push(`orders=${orders}`);
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
        
        const response = await fetch(url, {
            headers: {
                'X-MICROCMS-API-KEY': LOCAL_API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
}

