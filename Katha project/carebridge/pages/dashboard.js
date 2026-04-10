// ============================================================
// Dashboard Page
// /pages/dashboard.js
// ============================================================

const DashboardPage = {
  _medicines: [],
  _vitals: {},
  _stats: {},

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = Components.loadingOverlay('Loading your dashboard…');

    try {
      const [medsRes, vitalsRes] = await Promise.all([
        API.getMedicines(),
        API.getVitals(),
      ]);

      this._medicines = medsRes.data;
      this._vitals    = vitalsRes.data;
      this._stats     = MOCK_DATA.quickStats;

      content.innerHTML = this._buildHTML();
      lucide.createIcons({ nodes: [content] });
      this._bindEvents();
    } catch (err) {
      content.innerHTML = Components.errorState(err.message, 'DashboardPage.render');
      lucide.createIcons({ nodes: [content] });
    }
  },

  _buildHTML() {
    const s = this._stats;
    const patient = MOCK_DATA.patient;
    const today = Utils.todayFormatted();
    const taken = this._medicines.filter(m => m.taken).length;
    const total = this._medicines.length;
    const pct   = Utils.pct(taken, total);
    const adherenceColor = Utils.adherenceColor(s.adherenceRate);

    const todayMeds = this._medicines.slice(0, 4);

    const vitalCards = [
      { label: 'Blood Pressure', value: this._vitals.bp?.value, unit: this._vitals.bp?.unit, status: this._vitals.bp?.status, icon: 'heart' },
      { label: 'Blood Glucose',  value: this._vitals.glucose?.value, unit: this._vitals.glucose?.unit, status: this._vitals.glucose?.status, icon: 'droplets' },
      { label: 'Heart Rate',     value: this._vitals.heartRate?.value, unit: this._vitals.heartRate?.unit, status: this._vitals.heartRate?.status, icon: 'activity' },
      { label: 'Weight',         value: this._vitals.weight?.value, unit: this._vitals.weight?.unit, status: this._vitals.weight?.status, icon: 'scale' },
    ];

    return `
      <div class="animate-fade-in space-y-6">

        <!-- Welcome Banner -->
        <div class="card" style="background:linear-gradient(135deg,#0c1445 0%,#12114a 40%,#1a0c3a 100%);border-color:#1e2d6e">
          <div class="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div class="text-sm text-primary-300 font-medium mb-1">Good ${this._getGreeting()}! 👋</div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white mb-2">Hello, ${patient.name}</h1>
              <p class="text-gray-400 text-sm">${today}</p>
              <div class="flex flex-wrap gap-2 mt-3">
                ${patient.conditions.map(c =>
                  `<span class="badge badge-blue">${c}</span>`
                ).join('')}
              </div>
            </div>
            <div class="flex flex-col items-center bg-white/5 rounded-2xl px-6 py-4 border border-white/10">
              <div class="text-xs text-gray-400 mb-1 font-medium">Today's Adherence</div>
              <div class="text-3xl font-extrabold" style="color:${adherenceColor}">${pct}%</div>
              <div class="text-xs text-gray-500">${taken}/${total} taken</div>
              <div class="progress-bar w-20 mt-2" style="height:4px">
                <div class="progress-fill" style="width:${pct}%;background:${adherenceColor}"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${Components.statCard({
            icon: 'pill', label: "Today's Medicines",
            value: `${taken}/${total}`,
            sub: pct >= 100 ? '✅ All done!' : `${total - taken} remaining`,
            iconBg: 'rgba(96,165,250,0.15)',
          })}
          ${Components.statCard({
            icon: 'activity', label: 'Symptoms This Week',
            value: s.symptomsThisWeek,
            sub: 'Tap to view details',
            iconBg: 'rgba(139,92,246,0.15)',
          })}
          ${Components.statCard({
            icon: 'trending-up', label: 'Weekly Adherence',
            value: `${s.adherenceRate}%`,
            sub: 'Keep it up!',
            iconBg: 'rgba(16,185,129,0.15)',
            trend: 3,
          })}
          ${Components.statCard({
            icon: 'calendar', label: 'Next Appointment',
            value: Utils.formatDate(s.nextAppointment),
            sub: `Dr. ${patient.doctor.split(' ').slice(-1)[0]}`,
            iconBg: 'rgba(245,158,11,0.15)',
          })}
        </div>

        <!-- Vitals + Quick Nav Row -->
        <div class="grid md:grid-cols-3 gap-4">
          <!-- Vitals -->
          <div class="md:col-span-2 card">
            ${Components.sectionHeader('Today\'s Vitals', null, null)}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${vitalCards.map(v => Components.vitalCard(v)).join('')}
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            ${Components.sectionHeader('Quick Actions')}
            <div class="space-y-2">
              ${[
                { page: 'symptoms',     icon: 'mic',     label: 'Record Symptom',     color: '#8b5cf6' },
                { page: 'prescription', icon: 'scan',    label: 'Scan Prescription',  color: '#0b80f5' },
                { page: 'chat',         icon: 'message-circle', label: 'Ask AI Assistant', color: '#06b6d4' },
                { page: 'availability', icon: 'search',  label: 'Find Medicine',      color: '#10b981' },
              ].map(a => `
                <button class="quick-action-btn w-full flex items-center gap-3 p-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 hover:border-white/12 transition-all text-left"
                  data-page="${a.page}">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${a.color}22">
                    <i data-lucide="${a.icon}" style="width:16px;height:16px;color:${a.color}"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-200">${a.label}</span>
                  <i data-lucide="chevron-right" style="width:14px;height:14px;color:#4B5563;margin-left:auto"></i>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Today's Medicines -->
        <div class="card">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 class="text-lg font-bold text-white">Today's Medicines</h2>
            <button class="quick-action-btn btn-secondary" style="font-size:13px;padding:8px 16px" data-page="reminder">
              View All <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
            </button>
          </div>
          <div id="dash-medicines" class="grid sm:grid-cols-2 gap-3">
            ${todayMeds.map(m => Components.medicineMiniCard(m)).join('')}
          </div>
          ${this._medicines.length > 4 ? `<p class="text-center text-xs text-gray-500 mt-3">+${this._medicines.length - 4} more medicines</p>` : ''}
        </div>

        <!-- Recent Symptoms -->
        <div class="card">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 class="text-lg font-bold text-white">Recent Symptoms</h2>
            <button class="quick-action-btn btn-secondary" style="font-size:13px;padding:8px 16px" data-page="symptoms">
              See All <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
            </button>
          </div>
          <div class="space-y-3">
            ${MOCK_DATA.symptoms.slice(0, 3).map(s => {
              const badge = Utils.severityBadge(s.severity);
              return `
                <div class="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                  <div class="mt-0.5"><span class="badge ${badge.cls}">${badge.label}</span></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-200">${Utils.truncate(s.description, 70)}</p>
                    <p class="text-xs text-gray-500 mt-1">${s.date} · ${s.time}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  },

  _getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    if (h < 21) return 'Evening';
    return 'Night';
  },

  _bindEvents() {
    document.querySelectorAll('.quick-action-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        App.navigate(btn.dataset.page);
      });
    });
  },
};
