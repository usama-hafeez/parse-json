# JSON Viewer, Formatter & Validator

A simple, free, and privacy-focused web tool for viewing, formatting, and validating JSON data. All processing happens entirely in your browser - no data is sent to any server.

## Features

- **Load JSON from URL** - Fetch and display JSON from any accessible URL
- **Paste from Clipboard** - Quick one-click paste functionality
- **Format JSON** - Pretty-print JSON with consistent 2-space indentation
- **Minify JSON** - Remove unnecessary whitespace while preserving structure
- **Copy to Clipboard** - Copy formatted or raw JSON with one click
- **Download JSON** - Save JSON as a file
- **Validate JSON** - Detect and report syntax errors with line/column numbers
- **Tree View** - Navigate JSON structure with collapsible tree view
- **Search** - Find and highlight text within JSON
- **Multiple View Modes** - Formatted, Tree View, and Raw
- **Dark/Light Theme** - Toggle between themes
- **Drag & Drop** - Drop JSON files directly into the input area
- **Statistics** - View file size, line count, keys, and depth
- **Syntax Highlighting** - Color-coded JSON elements for better readability
- **Line Numbers** - Easy reference for large JSON files

## Privacy

**Your data stays on your device.** All JSON processing happens entirely in your browser using JavaScript. We don't:
- Store any data
- Transmit any data to servers
- Collect any information
- Use any tracking

This is a client-side only application - your JSON never leaves your computer.

## Usage

1. **Load JSON:**
   - Paste JSON directly into the input area
   - Enter a URL and click "Load URL"
   - Drag and drop a JSON file
   - Click "Sample" to load example JSON

2. **Format JSON:**
   - Click "Format" to pretty-print JSON (displays in output panel)
   - Click "Minify" to remove whitespace

3. **View JSON:**
   - Switch between Formatted, Tree, and Raw views
   - Use search to find specific content
   - Expand/collapse tree nodes in Tree View

4. **Export:**
   - Click "Copy" to copy to clipboard
   - Click "Download" to save as a file

## Keyboard Shortcuts

- `Ctrl/Cmd + F` - Focus search box
- `Ctrl/Cmd + Enter` (in URL input) - Load URL
- `Ctrl/Cmd + S` (in JSON input) - Download JSON

## Technical Details

- **Pure JavaScript** - No frameworks, just vanilla JS
- **Tailwind CSS** - For styling (via CDN)
- **No Build Step** - Just open `index.html` in a browser
- **Responsive Design** - Works on desktop and mobile
- **Performance Optimized** - Handles large JSON files (64,000+ words)

## Files

- `index.html` - Main HTML structure
- `styles.css` - Custom styles and theme variables
- `script.js` - All JavaScript functionality
- `favicon.svg` - Site favicon

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Custom Properties (variables)
- Fetch API
- Clipboard API

## License

Free to use for any purpose. No restrictions.

---

Made with ❤️ for developers
