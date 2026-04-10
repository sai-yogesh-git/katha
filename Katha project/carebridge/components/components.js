// ============================================================
// CareBridge – Shared UI Components
// /components/components.js
// ============================================================

const Components = {

  // ── Toast Notifications ───────────────────────────────────
  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
    const id = 'toast-' + Utils.uid();

    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" style="width:18px;height:18px;flex-shrink:0"></i>
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:inherit;opacity:0.6;padding:0;line-height:1">
        <i data-lucide="x" style="width:16px;height:16px"></i>
      </button>
    `;

    container.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });

    setTimeout(() => {
      if (document.getElementById(id)) {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  // ── Page Header ───────────────────────────────────────────
  pageHeader(title, subtitle, iconName, breadcrumb = null) {
    return `
      <div class="page-header">
        ${breadcrumb ? `<div class="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <i data-lucide="home" style="width:12px;height:12px"></i>
          <span>/ ${breadcrumb}</span>
        </div>` : ''}
        <div class="flex items-center gap-4 flex-wrap">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-600/30 to-accent-600/20 border border-primary-500/20 flex-shrink-0">
            <i data-lucide="${iconName}" style="width:22px;height:22px;color:#60A5FA"></i>
          </div>
          <div>
            <h1 class="page-title">${title}</h1>
            <p class="page-subtitle">${subtitle}</p>
          </div>
        </div>
      </div>
    `;
  },

  // ── Stat Card ─────────────────────────────────────────────
  statCard({ icon, label, value, sub, iconBg, trend }) {
    return `
      <div class="stat-card">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${iconBg || 'rgba(96,165,250,0.15)'}">
            <i data-lucide="${icon}" style="width:20px;height:20px;color:${iconBg ? iconBg.replace('0.15','1').replace('rgba','rgb').replace(/,\s*\d+\.?\d*\)/, ')') : '#60A5FA'}"></i>
          </div>
          ${trend ? `<span class="badge ${trend > 0 ? 'badge-green' : 'badge-red'}" style="font-size:11px">
            ${trend > 0 ? '▲' : '▼'} ${Math.abs(trend)}%
          </span>` : ''}
        </div>
        <div class="text-2xl font-bold text-white mb-0.5">${value}</div>
        <div class="text-sm font-semibold text-gray-300">${label}</div>
        ${sub ? `<div class="text-xs text-gray-500 mt-1">${sub}</div>` : ''}
      </div>
    `;
  },

  // ── Empty State ───────────────────────────────────────────
  emptyState(icon, title, subtitle, btnLabel = null, btnAction = null) {
    return `
      <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div class="w-16 h-16 rounded-2xl bg-gray-800/80 flex items-center justify-center mb-4">
          <i data-lucide="${icon}" style="width:28px;height:28px;color:#4B5563"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-300 mb-2">${title}</h3>
        <p class="text-sm text-gray-500 max-w-xs">${subtitle}</p>
        ${btnLabel && btnAction ? `<button onclick="${btnAction}" class="btn-primary mt-6" style="font-size:14px;padding:10px 20px">
          ${btnLabel}
        </button>` : ''}
      </div>
    `;
  },

  // ── Error State ───────────────────────────────────────────
  errorState(message = 'Something went wrong. Please try again.', retryAction = null) {
    return `
      <div class="card flex flex-col items-center justify-center py-12 text-center">
        <div class="w-14 h-14 rounded-xl bg-red-900/30 border border-red-800/40 flex items-center justify-center mb-4">
          <i data-lucide="alert-triangle" style="width:24px;height:24px;color:#F87171"></i>
        </div>
        <p class="text-gray-300 font-medium mb-1">Unable to load data</p>
        <p class="text-sm text-gray-500 mb-5">${message}</p>
        ${retryAction ? `<button onclick="${retryAction}" class="btn-secondary" style="font-size:14px;padding:10px 20px">
          <i data-lucide="refresh-cw" style="width:14px;height:14px"></i> Try Again
        </button>` : ''}
      </div>
    `;
  },

  // ── Loading Overlay ───────────────────────────────────────
  loadingOverlay(message = 'Loading…') {
    return `
      <div class="flex flex-col items-center justify-center py-16 gap-4">
        ${Utils.spinner(36)}
        <p class="text-gray-400 text-sm font-medium">${message}</p>
      </div>
    `;
  },

  // ── Section Header ────────────────────────────────────────
  sectionHeader(title, actionLabel = null, actionFn = null) {
    return `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-white">${title}</h2>
        ${actionLabel ? `<button onclick="${actionFn}()" class="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors">
          ${actionLabel} <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
        </button>` : ''}
      </div>
    `;
  },

  // ── Vital Sign Card ───────────────────────────────────────
  vitalCard({ label, value, unit, status, icon }) {
    const color = Utils.statusColor(status);
    return `
      <div class="stat-card flex flex-col items-center text-center p-5">
        <div class="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style="background:${color}22;border:2px solid ${color}44">
          <i data-lucide="${icon}" style="width:20px;height:20px;color:${color}"></i>
        </div>
        <div class="text-2xl font-bold" style="color:${color}">${value}</div>
        <div class="text-xs text-gray-400 mt-0.5">${unit}</div>
        <div class="text-xs font-semibold text-gray-300 mt-2">${label}</div>
        ${status !== 'normal' ? `<span class="badge badge-amber mt-1" style="font-size:10px">${Utils.capitalize(status)}</span>` : ''}
      </div>
    `;
  },

  // ── Medicine Quick Card (for dashboard) ───────────────────
  medicineMiniCard(med) {
    const slot = Utils.slotColors[med.slot] || Utils.slotColors.morning;
    return `
      <div class="flex items-center gap-3 p-3 rounded-xl border transition-all" style="background:${slot.bg};border-color:${slot.border}">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${slot.border.replace('0.3','0.15')}">
          <i data-lucide="${Utils.slotIcon[med.slot] || 'pill'}" style="width:16px;height:16px;color:${slot.text}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-white truncate">${med.name} <span style="color:${slot.text}">${med.dose}</span></div>
          <div class="text-xs text-gray-400 truncate">${med.time}</div>
        </div>
        ${med.taken
          ? `<span class="badge badge-green" style="font-size:10px"><i data-lucide="check" style="width:10px;height:10px"></i> Done</span>`
          : `<span class="badge badge-amber" style="font-size:10px">Pending</span>`
        }
      </div>
    `;
  },

  // ── Avatar ────────────────────────────────────────────────
  avatar(initials, size = 40) {
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#0b80f5,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:${size*0.35}px;font-weight:800;color:white;flex-shrink:0">${initials}</div>`;
  },
};
