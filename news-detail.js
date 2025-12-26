document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    const contentArea = document.getElementById('content-area');

    if (!articleId) {
        contentArea.innerHTML = '<p>記事のIDが指定されていません。</p>';
        return;
    }

    fetch(`api-proxy.php?endpoint=news&id=${articleId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const title = escapeHtml(data.title);
        const content = sanitizeHtml(data.content);
        const publishedAt = new Date(data.publishedAt).toLocaleDateString('ja-JP');

        document.title = `${title} - 長田建設株式会社`;

        const html = `
            <h1 class="page-hero-title" style="margin-bottom: 20px;">${title}</h1>
            <p style="margin-bottom: 40px; color: #666;">公開日：${publishedAt}</p>
            <div class="post-content">${content}</div>
        `;

        contentArea.innerHTML = html;
    })
    .catch(error => {
        console.error('Error fetching news detail:', error);
        contentArea.innerHTML = '<p>記事の読み込みに失敗しました。もう一度お試しください。</p>';
    });
});
