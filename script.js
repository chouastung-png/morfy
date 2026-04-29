// 初始化 Lucide 圖示
lucide.createIcons();

const visualEditor = document.getElementById('visualEditor');
const magazineBody = document.getElementById('magazineBody');
const previewTitle = document.getElementById('previewTitle');
const markdownOutput = document.getElementById('markdownOutput');
const charCount = document.getElementById('charCount');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 解決行動端鍵盤遮擋問題 (Visual Viewport API)
function updateViewportHeight() {
    if (window.visualViewport) {
        let vh = window.visualViewport.height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportHeight);
    window.visualViewport.addEventListener('scroll', updateViewportHeight);
}
updateViewportHeight();

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

const viewToggle = document.getElementById('viewToggle');
const magazineContainer = document.getElementById('magazineContainer');
const sourceView = document.getElementById('sourceView');
let isCodeView = false;

// 預覽/代碼切換邏輯 (右側內部切換)
viewToggle.addEventListener('click', () => {
    isCodeView = !isCodeView;
    if (isCodeView) {
        magazineContainer.style.display = 'none';
        sourceView.style.display = 'block';
        viewToggle.innerHTML = '<i data-lucide="code"></i> 代碼模式';
    } else {
        magazineContainer.style.display = 'block';
        sourceView.style.display = 'none';
        viewToggle.innerHTML = '<i data-lucide="eye"></i> 預覽模式';
    }
    lucide.createIcons();
});

// 全域視圖模式切換 (主要用於手機版)
const workspace = document.querySelector('.app-container');
let currentMode = 'edit'; // 預設手機版為編輯模式

function toggleViewMode() {
    if (currentMode === 'edit') {
        currentMode = 'preview';
        workspace.className = 'app-container view-preview';
    } else {
        currentMode = 'edit';
        workspace.className = 'app-container view-edit';
    }
    lucide.createIcons();
}

// 一鍵清空功能
function clearContent() {
    if (confirm('確定要清空所有內容嗎？此操作無法還原。')) {
        visualEditor.innerHTML = '';
        syncContent();
    }
}

// 複製 Markdown 功能
copyBtn.addEventListener('click', () => {
    const markdown = markdownOutput.textContent;
    navigator.clipboard.writeText(markdown).then(() => {
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i data-lucide="check"></i> <span>已複製</span>';
        lucide.createIcons();
        
        // 手機版額外提示
        if (window.innerWidth <= 768) {
            alert('Markdown 代碼已成功複製到剪貼簿！');
        }
        
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
        // 預設內容改為通用版本
        visualEditor.innerHTML = `
            <h1>歡迎使用 Morfy Studio</h1>
            <blockquote>這是一個為您打造的專業文字轉譯工具。</blockquote>
            <h2>為什麼選擇 Morfy？</h2>
            <ul>
                <li><b>直覺排版</b>：選取文字後點擊工具列按鈕，操作就像 Word 一樣簡單。</li>
                <li><b>自動翻譯</b>：左側調整樣式，系統自動在背後翻譯為 Markdown 格式。</li>
                <li><b>雜誌級預覽</b>：內建極致美學，讓您的文件在任何裝置上都顯得專業。</li>
            </ul>
            <p><b>開始嘗試</b>：將您的文字貼上至左側，點擊按鈕進行排版，完成後點擊右側的「複製代碼」即可帶走結果！</p>
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
