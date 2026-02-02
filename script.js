let currentJSON = null;
let currentViewMode = 'formatted';
let jsonData = null;
let currentTheme = localStorage.getItem('theme') || 'dark';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLineNumbers('jsonInput', 'inputLineNumbers');
    handleInput();
    initTheme();
});

// Theme management
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
}

// About modal
function showAbout() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAbout() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('aboutModal');
    if (modal && e.target === modal) {
        closeAbout();
    }
});

// Update line numbers
function updateLineNumbers(textareaId, lineNumbersId) {
    const textarea = document.getElementById(textareaId);
    const lineNumbers = document.getElementById(lineNumbersId);
    if (!textarea || !lineNumbers) return;
    const lines = textarea.value.split('\n').length;
    lineNumbers.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
        const div = document.createElement('div');
        lineNumbers.appendChild(div);
    }
}

// Handle input changes
function handleInput() {
    updateLineNumbers('jsonInput', 'inputLineNumbers');
    const input = document.getElementById('jsonInput').value.trim();
    if (input) {
        try {
            jsonData = JSON.parse(input);
            updateStats(input, true);
            setStatus('Valid JSON', 'success');
            closeError();
        } catch (e) {
            updateStats(input, false);
            setStatus('Invalid JSON', 'error');
        }
    } else {
        updateStats('', false);
        setStatus('Ready', 'default');
    }
}

// Load JSON from URL
async function loadFromURL() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showNotification('Please enter a URL', false);
        return;
    }

    setStatus('Loading...', 'loading');
    const input = document.getElementById('jsonInput');
    const output = document.getElementById('jsonOutput');
    output.innerHTML = '<div class="text-center mt-20 text-secondary"><p>Loading JSON from URL...</p></div>';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const text = await response.text();
        
        if (text.length > 1000000) {
            if (!confirm('This JSON file is very large (' + formatBytes(text.length) + '). Loading may take a moment. Continue?')) {
                setStatus('Cancelled', 'default');
                return;
            }
        }
        
        input.value = text;
        handleInput();
        
        if (jsonData !== null) {
            displayJSON();
            showNotification('JSON loaded successfully!', true);
        } else {
            setStatus('Invalid JSON', 'error');
        }
    } catch (error) {
        setStatus('Load Failed', 'error');
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Failed to load JSON from URL: CORS error or invalid URL. Make sure the URL is accessible and allows CORS requests.');
        } else {
            showError('Failed to load JSON from URL: ' + error.message);
        }
        showNotification('Failed to load JSON', false);
    }
}

// Paste from clipboard
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('jsonInput').value = text;
        handleInput();
        if (jsonData !== null) {
            displayJSON();
            showNotification('JSON pasted successfully!', true);
        }
    } catch (error) {
        showNotification('Failed to read clipboard', false);
    }
}

// Format JSON - displays in output panel
function formatJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) {
        showNotification('No JSON to format', false);
        return;
    }

    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        jsonData = parsed;
        handleInput();
        displayJSON();
        showNotification('JSON formatted successfully!', true);
    } catch (error) {
        let errorMsg = error.message;
        const positionMatch = error.message.match(/position (\d+)/);
        if (positionMatch) {
            const pos = parseInt(positionMatch[1]);
            const lines = input.substring(0, pos).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            errorMsg = `Error at line ${line}, column ${column}: ${error.message}`;
        }
        showError('Invalid JSON: ' + errorMsg);
        showNotification('Invalid JSON', false);
    }
}

// Minify JSON
function minifyJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) {
        showNotification('No JSON to minify', false);
        return;
    }

    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        document.getElementById('jsonInput').value = minified;
        jsonData = parsed;
        handleInput();
        displayJSON();
        showNotification('JSON minified successfully!', true);
    } catch (error) {
        let errorMsg = error.message;
        const positionMatch = error.message.match(/position (\d+)/);
        if (positionMatch) {
            const pos = parseInt(positionMatch[1]);
            const lines = input.substring(0, pos).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            errorMsg = `Error at line ${line}, column ${column}: ${error.message}`;
        }
        showError('Invalid JSON: ' + errorMsg);
        showNotification('Invalid JSON', false);
    }
}

// Validate JSON
function validateJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) {
        showNotification('No JSON to validate', false);
        return;
    }

    try {
        JSON.parse(input);
        showNotification('✓ JSON is valid!', true);
        setStatus('Valid JSON', 'success');
        closeError();
    } catch (error) {
        let errorMsg = error.message;
        const positionMatch = error.message.match(/position (\d+)/);
        if (positionMatch) {
            const pos = parseInt(positionMatch[1]);
            const lines = input.substring(0, pos).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            errorMsg = `Error at line ${line}, column ${column}: ${error.message}`;
        }
        showError(errorMsg);
        setStatus('Invalid JSON', 'error');
        showNotification('JSON validation failed', false);
    }
}

// Copy to clipboard
async function copyToClipboard() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) {
        showNotification('No JSON to copy', false);
        return;
    }

    try {
        await navigator.clipboard.writeText(input);
        showNotification('Copied to clipboard!', true);
    } catch (error) {
        showNotification('Failed to copy', false);
    }
}

// Copy output to clipboard
async function copyOutput() {
    if (!jsonData) {
        showNotification('No output to copy', false);
        return;
    }

    try {
        let textToCopy = '';
        
        if (currentViewMode === 'formatted') {
            textToCopy = JSON.stringify(jsonData, null, 2);
        } else if (currentViewMode === 'raw') {
            textToCopy = JSON.stringify(jsonData);
        } else if (currentViewMode === 'tree') {
            // For tree view, get the formatted JSON
            textToCopy = JSON.stringify(jsonData, null, 2);
        }
        
        await navigator.clipboard.writeText(textToCopy);
        showNotification('Output copied to clipboard!', true);
    } catch (error) {
        showNotification('Failed to copy output', false);
    }
}

// Download JSON
function downloadJSON() {
    const input = document.getElementById('jsonInput').value.trim();
    if (!input) {
        showNotification('No JSON to download', false);
        return;
    }

    try {
        const blob = new Blob([input], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Download started!', true);
    } catch (error) {
        showNotification('Download failed', false);
    }
}

// Clear JSON
function clearJSON() {
    if (confirm('Are you sure you want to clear all JSON data?')) {
        document.getElementById('jsonInput').value = '';
        document.getElementById('jsonOutput').innerHTML = '<div class="text-center mt-20 text-secondary"><p class="text-lg mb-2">JSON output will appear here</p><p class="text-sm">Format, validate, or load JSON to see results</p></div>';
        document.getElementById('urlInput').value = '';
        jsonData = null;
        handleInput();
        closeError();
        showNotification('Cleared!', true);
    }
}

// Set view mode
function setViewMode(mode) {
    currentViewMode = mode;
    
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.backgroundColor = 'var(--bg-tertiary)';
    });
    
    const activeBtn = document.getElementById(`btn${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.backgroundColor = 'var(--bg-tertiary)';
        activeBtn.style.border = '2px solid var(--json-key)';
    }

    const treeControls = document.querySelectorAll('.tree-control');
    treeControls.forEach(ctrl => {
        ctrl.classList.toggle('hidden', mode !== 'tree');
    });

    displayJSON();
}

// Display JSON based on view mode
function displayJSON() {
    const output = document.getElementById('jsonOutput');
    const lineNumbers = document.getElementById('outputLineNumbers');
    
    if (!jsonData) {
        output.innerHTML = '<div class="text-center mt-20 text-secondary"><p class="text-lg mb-2">JSON output will appear here</p><p class="text-sm">Format, validate, or load JSON to see results</p></div>';
        lineNumbers.classList.add('hidden');
        return;
    }

    const inputSize = JSON.stringify(jsonData).length;
    if (inputSize > 500000) {
        output.innerHTML = '<div class="text-center mt-20 text-secondary"><p class="text-lg mb-2">Processing large JSON file...</p><p class="text-sm">This may take a moment</p></div>';
        requestAnimationFrame(() => {
            renderJSON(output, lineNumbers, inputSize);
        });
    } else {
        renderJSON(output, lineNumbers, inputSize);
    }
}

// Render JSON content
function renderJSON(output, lineNumbers, inputSize) {
    try {
        if (currentViewMode === 'formatted') {
            const formatted = JSON.stringify(jsonData, null, 2);
            output.innerHTML = syntaxHighlight(formatted);
            lineNumbers.classList.remove('hidden');
            updateOutputLineNumbers(formatted);
        } else if (currentViewMode === 'tree') {
            output.innerHTML = buildTreeView(jsonData);
            lineNumbers.classList.add('hidden');
        } else if (currentViewMode === 'raw') {
            const raw = JSON.stringify(jsonData);
            output.innerHTML = syntaxHighlight(raw);
            lineNumbers.classList.remove('hidden');
            updateOutputLineNumbers(raw);
        }
    } catch (error) {
        output.innerHTML = `<div class="p-4 text-red-500">Error displaying JSON: ${error.message}</div>`;
    }
}

// Syntax highlighting - preserves JSON structure exactly
function syntaxHighlight(json) {
    // Escape HTML first
    let escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Process character by character to preserve exact structure
    let result = '';
    let i = 0;
    let inString = false;
    let stringBuffer = '';
    let stringStart = -1;
    
    while (i < escaped.length) {
        const char = escaped[i];
        
        if (char === '"' && (i === 0 || escaped[i - 1] !== '\\')) {
            if (!inString) {
                // Starting a string
                inString = true;
                stringStart = i;
                stringBuffer = '"';
            } else {
                // Ending a string
                inString = false;
                stringBuffer += '"';
                const stringContent = stringBuffer;
                
                // Check if this was a key (look ahead for colon)
                let j = i + 1;
                while (j < escaped.length && (escaped[j] === ' ' || escaped[j] === '\t' || escaped[j] === '\n' || escaped[j] === '\r')) {
                    j++;
                }
                const isKey = (j < escaped.length && escaped[j] === ':');
                
                const cls = isKey ? 'json-key' : 'json-string';
                result += `<span class="${cls}">${stringContent}</span>`;
                stringBuffer = '';
            }
            i++;
        } else if (inString) {
            // Inside a string, accumulate characters
            stringBuffer += char;
            i++;
        } else {
            // We're not in a string, process special tokens
            if (escaped.substr(i, 4) === 'true' && !/[a-zA-Z0-9_]/.test(escaped[i + 4] || '')) {
                result += '<span class="json-boolean">true</span>';
                i += 4;
            } else if (escaped.substr(i, 5) === 'false' && !/[a-zA-Z0-9_]/.test(escaped[i + 5] || '')) {
                result += '<span class="json-boolean">false</span>';
                i += 5;
            } else if (escaped.substr(i, 4) === 'null' && !/[a-zA-Z0-9_]/.test(escaped[i + 4] || '')) {
                result += '<span class="json-null">null</span>';
                i += 4;
            } else if (/[{}[\],:]/.test(char)) {
                result += `<span class="json-punctuation">${char}</span>`;
                i++;
            } else if (/[\d-]/.test(char)) {
                // Number - find the end
                let numStart = i;
                let numEnd = i;
                while (numEnd < escaped.length && /[\d.eE+-]/.test(escaped[numEnd])) {
                    numEnd++;
                }
                const num = escaped.substring(numStart, numEnd);
                result += `<span class="json-number">${num}</span>`;
                i = numEnd;
            } else {
                result += char;
                i++;
            }
        }
    }
    
    // Handle case where string wasn't closed (shouldn't happen with valid JSON)
    if (inString && stringBuffer) {
        result += stringBuffer;
    }
    
    return result;
}

// Build tree view
function buildTreeView(obj, path = 'root', isRoot = true) {
    if (obj === null) return '<span class="json-null">null</span>';
    if (typeof obj === 'string') {
        const display = obj.length > 100 ? escapeHtml(obj.substring(0, 100)) + '...' : escapeHtml(obj);
        return `<span class="json-string" title="Path: ${path}\nValue: ${escapeHtml(obj)}">"${display}"</span>`;
    }
    if (typeof obj === 'number') return `<span class="json-number" title="Path: ${path}">${obj}</span>`;
    if (typeof obj === 'boolean') return `<span class="json-boolean" title="Path: ${path}">${obj}</span>`;
    
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '<span class="json-punctuation">[]</span>';
        const pathAttr = `data-path="${path}"`;
        let html = `<div class="tree-node" onclick="toggleTreeNode(this)" ${pathAttr} title="Path: ${path}"><span class="tree-toggle">▼</span><span class="json-punctuation">[</span> <span class="text-secondary text-xs">${obj.length} items</span> <span class="text-secondary text-xs ml-2 cursor-help" title="Click to copy path">${path}</span></div>`;
        html += '<div class="tree-children expanded">';
        obj.forEach((item, index) => {
            html += `<div class="ml-4 py-1"><span class="text-secondary">${index}:</span> ${buildTreeView(item, path + '[' + index + ']', false)}</div>`;
        });
        html += '<div class="tree-node"><span class="json-punctuation">]</span></div></div>';
        return html;
    }
    
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '<span class="json-punctuation">{}</span>';
        const pathAttr = `data-path="${path}"`;
        let html = `<div class="tree-node" onclick="toggleTreeNode(this)" ${pathAttr} title="Path: ${path}"><span class="tree-toggle">▼</span><span class="json-punctuation">{</span> <span class="text-secondary text-xs">${keys.length} keys</span> <span class="text-secondary text-xs ml-2 cursor-help" title="Click to copy path">${path}</span></div>`;
        html += '<div class="tree-children expanded">';
        keys.forEach(key => {
            const newPath = isRoot ? key : path + '.' + key;
            const escapedPath = escapeHtml(newPath).replace(/'/g, "\\'");
            html += `<div class="ml-4 py-1"><span class="json-key" onclick="copyPath('${escapedPath}')" title="Click to copy path">"${escapeHtml(key)}"</span><span class="json-punctuation">:</span> ${buildTreeView(obj[key], newPath, false)}</div>`;
        });
        html += '<div class="tree-node"><span class="json-punctuation">}</span></div></div>';
        return html;
    }
    
    return String(obj);
}

// Copy JSON path
async function copyPath(path) {
    try {
        await navigator.clipboard.writeText(path);
        showNotification(`Path copied: ${path}`, true);
    } catch (error) {
        showNotification('Failed to copy path', false);
    }
}

// Toggle tree node
function toggleTreeNode(node) {
    const children = node.nextElementSibling;
    const toggle = node.querySelector('.tree-toggle');
    if (children && children.classList.contains('tree-children')) {
        children.classList.toggle('expanded');
        toggle.textContent = children.classList.contains('expanded') ? '▼' : '▶';
    }
}

// Expand all tree nodes
function expandAllTree() {
    document.querySelectorAll('.tree-children').forEach(node => {
        node.classList.add('expanded');
    });
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.textContent = '▼';
    });
}

// Collapse all tree nodes
function collapseAllTree() {
    document.querySelectorAll('.tree-children').forEach(node => {
        node.classList.remove('expanded');
    });
    document.querySelectorAll('.tree-toggle').forEach(toggle => {
        toggle.textContent = '▶';
    });
}

// Update output line numbers
function updateOutputLineNumbers(text) {
    const lineNumbers = document.getElementById('outputLineNumbers');
    if (!lineNumbers) return;
    const lines = text.split('\n').length;
    lineNumbers.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
        const div = document.createElement('div');
        lineNumbers.appendChild(div);
    }
}

// Search JSON
function searchJSON() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) {
        displayJSON();
        return;
    }

    const output = document.getElementById('jsonOutput');
    let content = output.innerHTML;
    
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    content = content.replace(regex, '<mark class="bg-yellow-400 dark:bg-yellow-600 text-gray-900">$1</mark>');
    
    output.innerHTML = content;
    
    const firstMatch = output.querySelector('mark');
    if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Update stats
function updateStats(text, isValid) {
    const size = new Blob([text]).size;
    const lines = text.split('\n').length;
    
    document.getElementById('size').textContent = formatBytes(size);
    document.getElementById('lines').textContent = lines;

    if (isValid && jsonData) {
        const stats = analyzeJSON(jsonData);
        document.getElementById('keys').textContent = stats.keys;
        document.getElementById('depth').textContent = stats.depth;
    } else {
        document.getElementById('keys').textContent = '0';
        document.getElementById('depth').textContent = '0';
    }
}

// Analyze JSON structure
function analyzeJSON(obj, depth = 0) {
    if (obj === null || typeof obj !== 'object') {
        return { keys: 0, depth: depth };
    }

    let maxDepth = depth;
    let totalKeys = 0;

    if (Array.isArray(obj)) {
        totalKeys = obj.length;
        obj.forEach(item => {
            const result = analyzeJSON(item, depth + 1);
            maxDepth = Math.max(maxDepth, result.depth);
            totalKeys += result.keys;
        });
    } else {
        const keys = Object.keys(obj);
        totalKeys = keys.length;
        keys.forEach(key => {
            const result = analyzeJSON(obj[key], depth + 1);
            maxDepth = Math.max(maxDepth, result.depth);
            totalKeys += result.keys;
        });
    }

    return { keys: totalKeys, depth: maxDepth };
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Set status
function setStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        loading: 'bg-blue-500',
        default: 'bg-gray-500'
    };
    status.className = `px-3 py-1 rounded-full ${colors[type] || colors.default} text-white text-sm`;
}

// Show error
function showError(message) {
    const errorPanel = document.getElementById('errorPanel');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorPanel.classList.remove('hidden');
}

// Close error
function closeError() {
    document.getElementById('errorPanel').classList.add('hidden');
}

// Show notification
function showNotification(message, isSuccess) {
    const notification = document.getElementById('successNotification');
    const notificationMessage = document.getElementById('successMessage');
    notificationMessage.textContent = message;
    notification.className = `fixed top-4 right-4 ${isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-xl z-50`;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Load sample JSON
function loadSampleJSON() {
    const sample = {
        "application": "JSON Viewer & Formatter",
        "version": "1.0.0",
        "features": [
            "Load from URL",
            "Format & Minify",
            "Tree View",
            "Validation",
            "Search",
            "Export"
        ],
        "metadata": {
            "author": "Developer Tools",
            "license": "MIT",
            "performance": {
                "maxFileSize": "64MB+",
                "optimized": true
            }
        },
        "stats": {
            "totalKeys": 15,
            "depth": 3,
            "lastUpdated": new Date().toISOString()
        }
    };
    document.getElementById('jsonInput').value = JSON.stringify(sample, null, 2);
    handleInput();
    displayJSON();
    showNotification('Sample JSON loaded!', true);
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.remove('hidden');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.add('hidden');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.add('hidden');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const content = event.target.result;
                document.getElementById('jsonInput').value = content;
                handleInput();
                if (jsonData !== null) {
                    displayJSON();
                    showNotification('JSON file loaded successfully!', true);
                }
            };
            reader.onerror = function() {
                showNotification('Failed to read file', false);
            };
            reader.readAsText(file);
        } else {
            showNotification('Please drop a JSON file', false);
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.id === 'urlInput') {
        loadFromURL();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.target.id === 'jsonInput') {
        e.preventDefault();
        downloadJSON();
    }
});
