# Locksyra Browser Extension

Real-time phishing detection + password autofill, powered by your Locksyra account.

## Features

| Feature | Description |
|---------|-------------|
| 🛡️ URL Safety Badge | Green / red badge on every tab — instant phishing risk score |
| 🔔 Danger Alerts | Browser notification if a high-risk page is detected |
| 🔑 Password Autofill | One-click fill from your encrypted vault on matching sites |
| 👁️ Popup Vault | Quick-copy passwords directly from the extension popup |

## Requirements

- Locksyra backend running on `http://localhost:5001`  
- A registered Locksyra account  
- Chrome 109+ or any Chromium-based browser (Edge, Brave, Arc)  
- Firefox 109+ (use manifest_version 3 support)

## Installation (Chrome/Edge/Brave)

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `browser-extension/` folder from this project
5. The Locksyra shield icon will appear in your toolbar

## Installation (Firefox)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `browser-extension/manifest.json`

> **Note:** Firefox requires a permanent add-on for production — submit to AMO or use a self-signed extension.

## Icons

The extension needs three PNG icons in the `icons/` folder:

```
icons/icon16.png   — 16×16  px
icons/icon48.png   — 48×48  px
icons/icon128.png  — 128×128 px
```

You can export these from any design tool using the Locksyra shield SVG, or use a placeholder until your brand assets are ready.

A quick way to generate them:

```bash
# macOS / Homebrew
brew install imagemagick
convert -size 128x128 xc:purple icons/icon128.png
convert -size 48x48   xc:purple icons/icon48.png
convert -size 16x16   xc:purple icons/icon16.png
```

## Environment

The extension targets `http://localhost:5001` for development.  
For production, update the `API` constant in `background.js` and `popup.js`:

```js
const API = 'https://api.yourlocksyradomain.com/api';
```

Also update `host_permissions` in `manifest.json`.

## How it works

```
Tab navigates → background.js → POST /api/phishing/check-url → badge update
Password field focus → content.js → reads cached vault → autofill button
Popup opens → popup.js → GET /api/passwords → vault list
```

Tokens are stored in `chrome.storage.local` (encrypted by the browser, never in plain localStorage).