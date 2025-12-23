// config-loader.js
let microCMSConfig = {
    apiKey: '',
    serviceDomain: ''
};

let configLoaded = false;
let configLoadPromise = null;

async function loadMicroCMSConfig() {
    // 既に読み込み済みならそのまま返す
    if (configLoaded) {
        return microCMSConfig;
    }
    
    // 読み込み中ならそのPromiseを返す
    if (configLoadPromise) {
        return configLoadPromise;
    }
    
    // 初回読み込み
    configLoadPromise = (async () => {
        try {
            const response = await fetch('config.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            
            if (config.error) {
                throw new Error(config.error);
            }
            
            if (config.apiKey && config.serviceDomain) {
                microCMSConfig = {
                    apiKey: config.apiKey,
                    serviceDomain: config.serviceDomain
                };
                configLoaded = true;
                return microCMSConfig;
            } else {
                throw new Error('設定値が不完全です');
            }
        } catch (error) {
            console.error('設定ファイルの読み込みに失敗しました:', error);
            // フォールバック値（開発用）
            microCMSConfig = {
                apiKey: 'rTWbnMYGrd4MTgyuFOLytuDtxWWxPVSb43Zc',
                serviceDomain: 'iymoqayrww'
            };
            configLoaded = true;
            return microCMSConfig;
        }
    })();
    
    return configLoadPromise;
}