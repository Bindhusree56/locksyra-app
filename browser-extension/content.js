/**
 * content.js — Locksyra Content Script
 *
 * Injected into every web page.
 *
 * Features:
 *   1. Detect password input fields and offer autofill from the vault.
 *   2. Show a small Locksyra badge on login forms.
 *
 * Privacy: no page content is ever sent to the backend.
 * The script only reads vault data that was already fetched and cached locally.
 */

'use strict';

// ── Autofill badge ─────────────────────────────────────────────────────────────

const BADGE_ID = '__locksyra_autofill_badge__';

/**
 * Find all password fields on the page.
 */
const findPasswordFields = () =>
  Array.from(document.querySelectorAll('input[type="password"]'));

/**
 * Find the username/email input closest to a password field.
 */
const findUsernameField = (pwField) => {
  // Walk up to find a form, then look for a text/email input
  let el = pwField.parentElement;
  for (let i = 0; i < 8 && el; i++) {
    const sibling = el.querySelector('input[type="email"], input[type="text"], input[name*="user"], input[name*="email"], input[id*="user"], input[id*="email"]');
    if (sibling && sibling !== pwField) return sibling;
    el = el.parentElement;
  }
  return null;
};

/**
 * Retrieve cached vault from chrome.storage (populated by background.js or popup.js).
 */
const getCachedVault = () =>
  new Promise((resolve) => {
    chrome.storage.local.get('cachedVault', ({ cachedVault }) => resolve(cachedVault || []));
  });

/**
 * Match vault entries to the current hostname.
 */
const matchEntries = (vault, hostname) =>
  vault.filter((entry) => {
    const site = (entry.website || '').replace(/^https?:\/\//, '').replace(/^www\./, '');
    const host = hostname.replace(/^www\./, '');
    return host.includes(site) || site.includes(host);
  });

/**
 * Inject a small autofill button next to a password field.
 */
const injectAutofillButton = (pwField, entries) => {
  if (document.getElementById(BADGE_ID)) return; // already injected

  const btn = document.createElement('button');
  btn.id            = BADGE_ID;
  btn.type          = 'button';
  btn.textContent   = '🔑 Autofill with Locksyra';
  btn.style.cssText = `
    position: absolute;
    z-index: 2147483647;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 12px;
    font-family: sans-serif;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(139,92,246,0.4);
    white-space: nowrap;
  `;

  // Position below the password field
  const rect = pwField.getBoundingClientRect();
  btn.style.top  = `${window.scrollY + rect.bottom + 4}px`;
  btn.style.left = `${window.scrollX + rect.left}px`;

  document.body.appendChild(btn);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const entry = entries[0]; // use first match (best match)
    const userField = findUsernameField(pwField);

    // Fill username
    if (userField && entry.username) {
      userField.value = entry.username;
      userField.dispatchEvent(new Event('input', { bubbles: true }));
      userField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Fill password
    if (entry.password) {
      pwField.value = entry.password;
      pwField.dispatchEvent(new Event('input', { bubbles: true }));
      pwField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    btn.textContent = '✅ Filled!';
    setTimeout(() => btn.remove(), 1500);
  });

  // Remove button when user clicks elsewhere
  document.addEventListener('click', (e) => {
    if (e.target !== btn) btn.remove();
  }, { once: true });
};

// ── Main ──────────────────────────────────────────────────────────────────────

const run = async () => {
  const { accessToken } = await new Promise((r) => chrome.storage.local.get('accessToken', r));
  if (!accessToken) return; // not logged in — do nothing

  const vault    = await getCachedVault();
  const hostname = window.location.hostname;
  const matches  = matchEntries(vault, hostname);

  if (matches.length === 0) return; // no saved passwords for this site

  const pwFields = findPasswordFields();
  if (pwFields.length === 0) return;

  // Inject button on focus of the first password field
  pwFields[0].addEventListener('focus', () => injectAutofillButton(pwFields[0], matches), { once: true });
};

// Small delay so the page DOM is settled
setTimeout(run, 800);

// Also run on SPA navigation
let lastHref = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    setTimeout(run, 800);
  }
});
observer.observe(document.body, { childList: true, subtree: true });