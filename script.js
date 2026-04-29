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
    preview.innerHTML = marked.parse(text);
    
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    charCount.textContent = `${chars} 字元`;
    wordCount.textContent = `${words} 字數`;
    
    localStorage.setItem('morfy_content', text);
}

// 智慧格式化插入函式
function insertFormat(type) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;
    let selectOffset = 0;

    switch(type) {
        case 'h1': replacement = `# ${selectedText || '大標題'}`; cursorOffset = 2; selectOffset = selectedText.length || 3; break;
        case 'h2': replacement = `## ${selectedText || '中標題'}`; cursorOffset = 3; selectOffset = selectedText.length || 3; break;
        case 'h3': replacement = `### ${selectedText || '小標題'}`; cursorOffset = 4; selectOffset = selectedText.length || 3; break;
        case 'bold': replacement = `**${selectedText || '粗體文字'}**`; cursorOffset = 2; selectOffset = selectedText.length || 4; break;
        case 'italic': replacement = `*${selectedText || '斜體文字'}*`; cursorOffset = 1; selectOffset = selectedText.length || 4; break;
        case 'code': replacement = `\`${selectedText || '代碼'}\``; cursorOffset = 1; selectOffset = selectedText.length || 2; break;
        case 'list': replacement = `- ${selectedText || '清單項目'}`; cursorOffset = 2; selectOffset = selectedText.length || 4; break;
        case 'quote': replacement = `> ${selectedText || '引用文字'}`; cursorOffset = 2; selectOffset = selectedText.length || 4; break;
        case 'image': replacement = `![圖片描述](https://example.com/image.png)`; cursorOffset = 2; selectOffset = 4; break;
    }

    editor.value = text.substring(0, start) + replacement + text.substring(end);
    
    // 重新設定選取範圍與焦點
    editor.focus();
    const newCursorPos = start + cursorOffset;
    editor.setSelectionRange(newCursorPos, newCursorPos + selectOffset);
    
    updateContent();
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
        editor.value = "# 歡迎使用 Morfy\n\n在這裡輸入文字，或使用上方的 **智慧工具列** 快速排版！\n\n### 如何開始？\n1. 直接貼上您的文字。\n2. 選取文字後點擊上方的按鈕（如 **B** 或 **H1**）。\n3. 觀察右側即時生成的預覽效果。\n\n> 提示：點擊右上角的「下載」即可存成 .md 檔。";
        updateContent();
    }
});
