document.addEventListener('DOMContentLoaded', async () => {
    // microCMS Config - config.phpから取得
    const config = await loadMicroCMSConfig();
    const serviceDomain = config.serviceDomain;
    const apiKey = config.apiKey;

    const params = new URLSearchParams(window.location.search);
    const workId = params.get('id');
    const contentArea = document.getElementById('content-area');

    if (!workId) {
        contentArea.innerHTML = '<p>実績のIDが指定されていません。</p>';
        return;
    }

    fetch(`https://${serviceDomain}.microcms.io/api/v1/works/${workId}`, {
        headers: {
            'X-MICROCMS-API-KEY': apiKey,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const title = data.title;
        const content = data.content;
        const completedDate = data.completed_date || 'N/A';
        const area = data.area || 'N/A';

        document.title = `${title} - 長田建設株式会社`;

        const html = `
            <h1 class="page-hero-title" style="margin-bottom: 20px;">${title}</h1>
            <div style="margin-bottom: 40px; color: #666;">
                <span>完成年月：${completedDate}</span> | 
                <span>工事場所：${area}</span>
            </div>
            <div class="post-content">${content}</div>
        `;

        contentArea.innerHTML = html;
    })
    .catch(error => {
        console.error('Error fetching work detail:', error);
        contentArea.innerHTML = '<p>実績の読み込みに失敗しました。もう一度お試しください。</p>';
    });
});
