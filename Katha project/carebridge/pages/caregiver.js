// ============================================================
// Caregiver Dashboard Page
// /pages/caregiver.js
// ============================================================

const CaregiverPage = {
  _data: null,

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = Components.loadingOverlay('Loading caregiver dashboard…');

    try {
      const res   = await API.getPatientStatus();
      this._data  = res.data;
      content.innerHTML = this._buildHTML();
      lucide.createIcons({ nodes: [content] });
      this._drawAdherenceChart();
      this._bindEvents();
    } catch (err) {
      content.innerHTML = Components.errorState(err.message, 'CaregiverPage.render');
      lucide.createIcons({ nodes: [content] });
    }
  },

  _buildHTML() {
    const { patient, adherence, alerts, vitals, medicines } = this._data;
    const takenToday = medicines.filter(m => m.taken).length;
    const totalToday = medicines.length;
    const todayPct   = Utils.pct(takenToday, totalToday);
    const adhColor   = Utils.adherenceColor(adherence.overall);

    return `
      <div class="animate-fade-in space-y-6">

        ${Components.pageHeader(
          'Caregiver Dashboard',
          'Monitor patient health status and adherence',
          'users',
          'Caregiver'
        )}

        <!-- Patient Profile Card -->
        <div class="card" style="background:linear-gradient(135deg,#0c1232,#120822);border-color:#1e2560">
          <div class="flex items-center gap-5 flex-wrap">
            ${Components.avatar(patient.initials, 64)}
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-extrabold text-white">${patient.name}</h2>
              <p class="text-gray-400 text-sm mt-0.5">
                Age ${patient.age} · ${patient.gender} · Blood Group: <span class="text-red-400 font-semibold">${patient.bloodGroup}</span>
              </p>
              <div class="flex flex-wrap gap-2 mt-2">
                ${patient.conditions.map(c =>
                  `<span class="badge badge-blue">${c}</span>`
                ).join('')}
              </div>
            </div>
            <div class="flex flex-col gap-2 text-sm text-right">
              <div class="text-gray-400">Doctor: <span class="text-white font-semibold">${patient.doctor}</span></div>
              <div class="text-gray-400">Caregiver: <span class="text-white font-semibold">${patient.caregiver}</span></div>
              <div class="text-gray-400">Last Visit: <span class="text-white font-semibold">${Utils.formatDate(patient.lastVisit)}</span></div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10">
            <div class="text-center">
              <div class="text-2xl font-extrabold" style="color:${adhColor}">${adherence.overall}%</div>
              <div class="text-xs text-gray-400 mt-0.5">Weekly Adherence</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-extrabold text-white">${takenToday}/${totalToday}</div>
              <div class="text-xs text-gray-400 mt-0.5">Today's Medicines</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-extrabold text-amber-400">${alerts.length}</div>
              <div class="text-xs text-gray-400 mt-0.5">Active Alerts</div>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        ${alerts.length ? `
          <div class="card">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="bell-ring" style="width:20px;height:20px;color:#FCD34D"></i>
              Active Alerts
              <span class="badge badge-amber ml-auto">${alerts.length}</span>
            </h2>
            <div class="space-y-3" id="alerts-container">
              ${alerts.map(a => this._alertCard(a)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Vitals Overview -->
        <div class="card">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="activity" style="width:20px;height:20px;color:#60A5FA"></i>
            Latest Vitals
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${[
              { label: 'Blood Pressure', value: vitals.bp.value,        unit: vitals.bp.unit,        status: vitals.bp.status,        icon: 'heart' },
              { label: 'Blood Glucose',  value: vitals.glucose.value,   unit: vitals.glucose.unit,   status: vitals.glucose.status,   icon: 'droplets' },
              { label: 'Heart Rate',     value: vitals.heartRate.value, unit: vitals.heartRate.unit, status: vitals.heartRate.status, icon: 'activity' },
              { label: 'Weight',         value: vitals.weight.value,    unit: vitals.weight.unit,    status: vitals.weight.status,    icon: 'scale' },
            ].map(v => Components.vitalCard(v)).join('')}
          </div>
        </div>

        <!-- Weekly Adherence Chart -->
        <div class="card">
          <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i data-lucide="bar-chart-2" style="width:20px;height:20px;color:#A78BFA"></i>
            Weekly Medicine Adherence
          </h2>
          <div id="adherence-chart" class="flex items-end justify-between gap-2" style="height:140px">
            <!-- Bars rendered by JS -->
          </div>
          <div class="flex justify-between mt-2">
            ${this._data.adherence.weekly.map(d =>
              `<div class="text-xs text-center text-gray-500 flex-1">${d.day}</div>`
            ).join('')}
          </div>
          <div class="flex items-center gap-4 mt-4 flex-wrap">
            <div class="flex items-center gap-1.5 text-xs text-gray-400">
              <div class="w-3 h-3 rounded-sm" style="background:linear-gradient(#34D399,#10b981)"></div>
              Taken
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-400">
              <div class="w-3 h-3 rounded-sm bg-gray-700"></div>
              Missed
            </div>
            <div class="ml-auto text-sm font-bold" style="color:${adhColor}">
              Overall: ${adherence.overall}%
            </div>
          </div>
        </div>

        <!-- Medicine Status Today -->
        <div class="card">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="pill" style="width:20px;height:20px;color:#60A5FA"></i>
            Today's Medicine Status
          </h2>
          <div class="space-y-2">
            ${medicines.map(med => {
              const slot = Utils.slotColors[med.slot] || Utils.slotColors.morning;
              return `
                <div class="flex items-center gap-3 p-3 rounded-xl border transition-all" style="background:${med.taken ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.02)'};border-color:${med.taken ? 'rgba(16,185,129,0.25)' : '#1F2937'}">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${slot.bg}">
                    <i data-lucide="${Utils.slotIcon[med.slot]}" style="width:14px;height:14px;color:${slot.text}"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-gray-200 truncate">${med.name} <span class="text-gray-500">${med.dose}</span></div>
                    <div class="text-xs text-gray-500">${med.time}</div>
                  </div>
                  ${med.taken
                    ? `<span class="badge badge-green"><i data-lucide="check-circle" style="width:11px;height:11px"></i> Taken</span>`
                    : `<span class="badge badge-red"><i data-lucide="x-circle" style="width:11px;height:11px"></i> Missed</span>`
                  }
                </div>
              `;
            }).join('')}
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Today's Adherence</span>
              <span>${takenToday}/${totalToday} (${todayPct}%)</span>
            </div>
            <div class="progress-bar" style="height:8px">
              <div class="progress-fill" style="width:${todayPct}%;background:${adhColor}"></div>
            </div>
          </div>
        </div>

        <!-- Contact & Actions -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="card">
            <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="phone" style="width:16px;height:16px;color:#34D399"></i>
              Emergency Contact
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-xl bg-gray-800/60">
                <div>
                  <p class="text-sm font-semibold text-white">${patient.caregiver}</p>
                  <p class="text-xs text-gray-500">${patient.emergencyContact}</p>
                </div>
                <button id="call-caregiver-btn" class="btn-success" style="padding:8px 14px;font-size:13px">
                  <i data-lucide="phone" style="width:14px;height:14px"></i> Call
                </button>
              </div>
              <div class="flex items-center justify-between p-3 rounded-xl bg-gray-800/60">
                <div>
                  <p class="text-sm font-semibold text-white">${patient.doctor}</p>
                  <p class="text-xs text-gray-500">Treating Physician</p>
                </div>
                <button id="call-doctor-btn" class="btn-secondary" style="padding:8px 14px;font-size:13px">
                  <i data-lucide="phone" style="width:14px;height:14px"></i> Call
                </button>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="share-2" style="width:16px;height:16px;color:#60A5FA"></i>
              Share Report
            </h3>
            <p class="text-sm text-gray-400 mb-4">Send today's health summary to the caregiver or doctor.</p>
            <div class="space-y-2">
              <button id="share-whatsapp-btn" class="btn-secondary w-full text-sm justify-start" style="padding:10px 14px">
                <i data-lucide="message-square" style="width:16px;height:16px;color:#25D366"></i>
                Share via WhatsApp
              </button>
              <button id="share-email-btn" class="btn-secondary w-full text-sm justify-start" style="padding:10px 14px">
                <i data-lucide="mail" style="width:16px;height:16px;color:#60A5FA"></i>
                Share via Email
              </button>
              <button id="download-report-btn" class="btn-secondary w-full text-sm justify-start" style="padding:10px 14px">
                <i data-lucide="download" style="width:16px;height:16px;color:#A78BFA"></i>
                Download PDF Report
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  _alertCard(alert) {
    const map = {
      warning: { icon: 'alert-triangle', color: '#FCD34D' },
      error:   { icon: 'alert-circle',   color: '#F87171' },
      info:    { icon: 'info',            color: '#60A5FA' },
    };
    const cfg = map[alert.type] || map.info;
    return `
      <div class="alert-item ${alert.type}" id="alert-${alert.id}">
        <i data-lucide="${cfg.icon}" style="width:18px;height:18px;color:${cfg.color};flex-shrink:0;margin-top:1px"></i>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-200 text-sm">${alert.title}</div>
          <div class="text-gray-400 text-xs mt-0.5">${alert.message}</div>
          <div class="text-gray-600 text-xs mt-1 flex items-center gap-1">
            <i data-lucide="clock" style="width:10px;height:10px"></i> ${alert.time}
          </div>
        </div>
        <button class="dismiss-alert-btn text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0" data-id="${alert.id}" aria-label="Dismiss alert">
          <i data-lucide="x" style="width:16px;height:16px"></i>
        </button>
      </div>
    `;
  },

  _drawAdherenceChart() {
    const container = document.getElementById('adherence-chart');
    if (!container || !this._data) return;

    const data    = this._data.adherence.weekly;
    const maxVal  = 6; // total pills per day

    container.innerHTML = data.map(d => {
      const pct      = Utils.pct(d.taken, d.total);
      const missedH  = (1 - d.taken / maxVal) * 100;
      const takenH   = (d.taken / maxVal) * 100;
      const color    = Utils.adherenceColor(pct);
      return `
        <div class="flex-1 flex flex-col items-center gap-1 group" title="${d.day}: ${d.taken}/${d.total} taken (${pct}%)">
          <div class="text-xs font-bold" style="color:${color}">${pct}%</div>
          <div class="w-full flex flex-col-reverse rounded-xl overflow-hidden" style="height:100px;background:#1F2937;border:1px solid #2D3748">
            <div style="height:${takenH}%;background:linear-gradient(to top,${color}99,${color});transition:height 0.8s ease;border-radius:10px 10px 0 0;min-height:${d.taken > 0 ? 4 : 0}px"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  _bindEvents() {
    // Dismiss alerts
    document.querySelectorAll('.dismiss-alert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const alertEl = document.getElementById('alert-' + btn.dataset.id);
        if (alertEl) {
          alertEl.style.transition = 'all 0.3s ease';
          alertEl.style.opacity = '0';
          alertEl.style.transform = 'translateX(20px)';
          setTimeout(() => alertEl.remove(), 300);
          Components.toast('Alert dismissed', 'info', 2000);
        }
      });
    });

    // Contact buttons
    document.getElementById('call-caregiver-btn')?.addEventListener('click', () => {
      Components.toast(`Calling ${MOCK_DATA.patient.caregiver}… (Demo mode)`, 'info');
    });
    document.getElementById('call-doctor-btn')?.addEventListener('click', () => {
      Components.toast(`Calling ${MOCK_DATA.patient.doctor}… (Demo mode)`, 'info');
    });

    // Share buttons
    document.getElementById('share-whatsapp-btn')?.addEventListener('click', () => {
      Components.toast('Health summary shared via WhatsApp! (Demo mode)', 'success');
    });
    document.getElementById('share-email-btn')?.addEventListener('click', () => {
      Components.toast('Health summary sent via Email! (Demo mode)', 'success');
    });
    document.getElementById('download-report-btn')?.addEventListener('click', () => {
      Components.toast('Generating PDF report… (Demo mode)', 'info');
    });
  },
};
