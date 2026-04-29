// 初始化 Lucide 圖示
lucide.createIcons();

const visualEditor = document.getElementById('visualEditor');
const magazineBody = document.getElementById('magazineBody');
const previewTitle = document.getElementById('previewTitle');
const markdownOutput = document.getElementById('markdownOutput');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 初始化 Turndown (視覺 HTML 轉 Markdown)
const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
});

// 即時同步轉譯邏輯
function syncContent() {
    const html = visualEditor.innerHTML;
    
    // 1. 翻譯為 Markdown (存於隱藏區域供複製/匯出)
    const markdown = turndownService.turndown(html);
    markdownOutput.textContent = markdown;
    
    // 2. 渲染雜誌預覽區 (直接同步 HTML 保持排版)
    magazineBody.innerHTML = html;
    
    // 3. 自動更新大標題
    const h1 = visualEditor.querySelector('h1');
    if (h1) {
        previewTitle.textContent = h1.textContent;
        // 預覽區隱藏重複標題
        const previewH1 = magazineBody.querySelector('h1');
        if (previewH1) previewH1.style.display = 'none';
    } else {
        previewTitle.textContent = '未命名文件';
    }

    // 4. 更新字數統計
    const text = visualEditor.innerText;
    charCount.textContent = `${text.length} CHARS`;
    
    localStorage.setItem('morfy_final_content', html);
}

// 視覺化格式化功能
function visualFormat(command, value = null) {
    document.execCommand(command, false, value);
    visualEditor.focus();
    syncContent();
}

// 監聽內容變動
visualEditor.addEventListener('input', syncContent);

// 複製 Markdown 功能
copyBtn.addEventListener('click', () => {
    const markdown = markdownOutput.textContent;
    navigator.clipboard.writeText(markdown).then(() => {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i data-lucide="check"></i> <span>已複製</span>';
        lucide.createIcons();
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            lucide.createIcons();
        }, 2000);
    });
});

// 下載 Markdown 功能
downloadBtn.addEventListener('click', () => {
    const markdown = markdownOutput.textContent;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewTitle.textContent || '文件'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// 初始載入
window.addEventListener('load', () => {
    const saved = localStorage.getItem('morfy_final_content');
    if (saved) {
        visualEditor.innerHTML = saved;
    } else {
        visualEditor.innerHTML = `
            <h1>專案架構師守則 (Architect Rules)</h1>
            <blockquote>專案架構師必須在執行前進行深度思考，確保系統的高內聚與低耦合。</blockquote>
            <h2>核心人設</h2>
            <p>你是資深架構師。在執行任何任務前，必須啟動 <b>Extended Thinking (延伸思考)</b> 模式，禁止隨意更改宣告或大幅重構。</p>
            <h2>通訊與語言</h2>
            <p>所有回覆、代碼註釋與實作計畫必須使用繁體中文。</p>
        `;
    }
    syncContent();
});

// 純文字貼上
visualEditor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
});
