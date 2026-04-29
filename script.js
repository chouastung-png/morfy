// 初始化 Lucide 圖示
lucide.createIcons();

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');

// 設定 marked.js 選項
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
});

// 更新預覽與統計資訊
function updateContent() {
    const text = editor.value;
    
    // 使用 marked 解析 Markdown
    preview.innerHTML = marked.parse(text);
    
    // 更新統計數據
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    charCount.textContent = `${chars} 字元`;
    wordCount.textContent = `${words} 字數`;
    
    // 自動儲存至 localStorage
    localStorage.setItem('morfy_content', text);
}

// 事件監聽
editor.addEventListener('input', updateContent);

// 複製到剪貼簿
copyBtn.addEventListener('click', () => {
    const text = editor.value;
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i data-lucide="check"></i> <span>已複製！</span>';
        lucide.createIcons();
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            lucide.createIcons();
        }, 2000);
    });
});

// 下載為 .md 檔案
function downloadFile() {
    const text = editor.value;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '文件.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

downloadBtn.addEventListener('click', downloadFile);

// 鍵盤快捷鍵
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadFile();
    }
});

// 載入儲存的內容
window.addEventListener('load', () => {
    const saved = localStorage.getItem('morfy_content');
    if (saved) {
        editor.value = saved;
        updateContent();
    } else {
        // 預設繁體中文內容
        editor.value = "# 歡迎使用 Morfy\n\n在這裡輸入文字，右側會即時顯示 **Markdown** 預覽效果！\n\n### 功能亮點\n- **即時預覽**：打字同步渲染\n- **高質感 UI**：磨砂玻璃設計\n- **字數統計**：掌握寫作進度\n- **iPhone 優化**：支援「加入主畫面」作為 App 使用\n\n```javascript\nconsole.log('哈囉 Markdown！');\n```";
        updateContent();
    }
});
