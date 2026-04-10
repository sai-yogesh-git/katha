// ============================================================
// CareBridge – Utility / Helper Functions
// /utils/helpers.js
// ============================================================

const Utils = {

  // ── Date & Time ───────────────────────────────────────────
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    const now  = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return `${diff} days ago`;
    return this.formatDate(dateStr);
  },

  todayFormatted() {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  },

  currentTime() {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });
  },

  // ── String Helpers ────────────────────────────────────────
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  truncate(str, maxLen = 80) {
    if (!str || str.length <= maxLen) return str;
    return str.slice(0, maxLen).trimEnd() + '…';
  },

  slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  },

  // ── Badge / Severity Helpers ──────────────────────────────
  severityBadge(severity) {
    const map = {
      mild:     { cls: 'badge-green', label: 'Mild',     icon: 'check-circle' },
      moderate: { cls: 'badge-amber', label: 'Moderate', icon: 'alert-triangle' },
      high:     { cls: 'badge-red',   label: 'High',     icon: 'alert-circle' },
      critical: { cls: 'badge-red',   label: 'Critical', icon: 'zap' },
    };
    return map[severity] || { cls: 'badge-blue', label: Utils.capitalize(severity), icon: 'info' };
  },

  statusColor(status) {
    const map = {
      normal:       '#34D399',
      'slightly-high': '#FCD34D',
      high:         '#F87171',
      low:          '#A78BFA',
      critical:     '#F87171',
    };
    return map[status] || '#60A5FA';
  },

  slotColors: {
    morning:   { bg: 'rgba(245,158,11,0.12)',  text: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
    afternoon: { bg: 'rgba(59,130,246,0.12)',  text: '#93C5FD', border: 'rgba(59,130,246,0.3)' },
    evening:   { bg: 'rgba(139,92,246,0.12)', text: '#C4B5FD', border: 'rgba(139,92,246,0.3)' },
    night:     { bg: 'rgba(30,64,175,0.2)',   text: '#93C5FD', border: 'rgba(30,64,175,0.4)' },
  },

  slotIcon: {
    morning: 'sunrise', afternoon: 'sun', evening: 'sunset', night: 'moon',
  },

  // ── DOM Helpers ───────────────────────────────────────────
  el(id)   { return document.getElementById(id); },
  qs(sel)  { return document.querySelector(sel); },
  qsa(sel) { return document.querySelectorAll(sel); },

  setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  },

  show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },

  hide(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  },

  // ── Spinners / Loading ────────────────────────────────────
  spinner(size = 24, color = '#60A5FA') {
    return `<svg class="animate-spin-slow" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="${color}" stroke-width="4"></circle>
      <path class="opacity-75" fill="${color}" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"></path>
    </svg>`;
  },

  skeletonCard(lines = 3) {
    return `<div class="card animate-fade-in" aria-busy="true" aria-label="Loading...">
      <div class="skeleton h-5 w-2/5 mb-4" style="height:20px;width:40%"></div>
      ${Array.from({ length: lines }, () =>
        `<div class="skeleton mb-2" style="height:14px;width:${70 + Math.random()*25|0}%"></div>`
      ).join('')}
    </div>`;
  },

  loadingCards(count = 3) {
    return Array.from({ length: count }, () => Utils.skeletonCard()).join('');
  },

  // ── Form Validation ───────────────────────────────────────
  required(value, fieldName = 'This field') {
    if (!value || !value.toString().trim()) {
      return `${fieldName} is required.`;
    }
    return null;
  },

  // ── Pill Count Warning ────────────────────────────────────
  pillCountWarning(count) {
    if (count <= 5)  return { color: '#F87171', label: 'Critically Low' };
    if (count <= 10) return { color: '#FCD34D', label: 'Running Low'    };
    return { color: '#34D399', label: 'Sufficient' };
  },

  // ── Adherence Color ───────────────────────────────────────
  adherenceColor(pct) {
    if (pct >= 90) return '#34D399';
    if (pct >= 75) return '#FCD34D';
    return '#F87171';
  },

  // ── Percentage from taken/total ───────────────────────────
  pct(taken, total) {
    if (!total) return 0;
    return Math.round((taken / total) * 100);
  },

  // ── Stars Rating ──────────────────────────────────────────
  stars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  },

  // ── Debounce ──────────────────────────────────────────────
  debounce(fn, delay = 350) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // ── Generate ID ───────────────────────────────────────────
  uid() {
    return Math.random().toString(36).slice(2, 10);
  },
};
