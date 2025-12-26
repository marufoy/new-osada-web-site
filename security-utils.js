// security-utils.js
// XSS対策用のユーティリティ関数

/**
 * HTMLエスケープ関数
 * テキストを安全にHTMLに埋め込むために使用
 */
function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * DOMPurifyを使用してHTMLをサニタイズ
 * リッチテキストコンテンツ（contentフィールドなど）に使用
 */
function sanitizeHtml(html) {
    if (html == null) return '';
    // DOMPurifyが利用可能な場合は使用、そうでない場合はエスケープ
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'div', 'span'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
            ALLOW_DATA_ATTR: false
        });
    } else {
        // DOMPurifyが利用できない場合はエスケープ（フォールバック）
        return escapeHtml(html);
    }
}

