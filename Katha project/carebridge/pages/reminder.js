// ============================================================
// Medicine Reminder Page
// /pages/reminder.js
// ============================================================

const ReminderPage = {
  _medicines: [],
  _filter: 'all',

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = Components.loadingOverlay('Loading your medicines…');

    try {
      const res = await API.getMedicines();
      this._medicines = res.data;
      content.innerHTML = this._buildHTML();
      lucide.createIcons({ nodes: [content] });
      this._bindEvents();
    } catch (err) {
      content.innerHTML = Components.errorState(err.message, 'ReminderPage.render');
      lucide.createIcons({ nodes: [content] });
    }
  },

  _buildHTML() {
    const taken   = this._medicines.filter(m => m.taken).length;
    const total   = this._medicines.length;
    const pct     = Utils.pct(taken, total);
    const color   = Utils.adherenceColor(pct);

    return `
      <div class="animate-fade-in space-y-6">

        ${Components.pageHeader(
          'Medicine Reminder',
          'Track and manage your daily medicines',
          'bell',
          'Medicine Reminder'
        )}

        <!-- Progress Overview -->
        <div class="card" style="background:linear-gradient(135deg,#052e16,#0f2010);border-color:#14532d">
          <div class="flex items-center gap-6 flex-wrap">
            <div class="flex-1">
              <div class="text-sm text-green-400 font-semibold mb-1">Today's Progress</div>
              <div class="text-4xl font-extrabold text-white mb-1">${taken}<span class="text-2xl text-gray-400">/${total}</span></div>
              <div class="text-sm text-gray-400">medicines taken today</div>
              <div class="progress-bar mt-3" style="height:8px">
                <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
              </div>
            </div>
            <div class="text-center px-4 py-3 rounded-2xl" style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.2)">
              <div class="text-3xl font-extrabold" style="color:${color}">${pct}%</div>
              <div class="text-xs text-gray-400 mt-1">Adherence</div>
            </div>
            ${total - taken > 0
              ? `<div class="text-center px-4 py-3 rounded-2xl" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2)">
                  <div class="text-3xl font-extrabold text-amber-400">${total - taken}</div>
                  <div class="text-xs text-gray-400 mt-1">Remaining</div>
                </div>`
              : `<div class="flex flex-col items-center gap-1 text-center">
                  <div class="text-3xl">🎉</div>
                  <div class="text-xs text-green-400 font-semibold">All done!</div>
                </div>`
            }
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 flex-wrap">
          ${['all','morning','afternoon','evening','night'].map(f => `
            <button class="filter-tab px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${this._filter === f ? 'bg-primary-600 border-primary-500 text-white' : 'border-gray-700 text-gray-400 bg-gray-900 hover:border-gray-600'}"
              data-filter="${f}">
              ${f === 'all' ? 'All' : Utils.capitalize(f)}
            </button>
          `).join('')}
        </div>

        <!-- Medicine List -->
        <div id="medicine-list" class="space-y-3">
          ${this._renderMedicineList()}
        </div>

        <!-- Low Pill Alerts -->
        <div id="low-pill-alerts">
          ${this._renderLowPillAlerts()}
        </div>

      </div>
    `;
  },

  _renderMedicineList() {
    let meds = this._medicines;
    if (this._filter !== 'all') {
      meds = meds.filter(m => m.slot === this._filter);
    }

    if (!meds.length) {
      return Components.emptyState('pill', `No ${Utils.capitalize(this._filter)} Medicines`, 'No medicines scheduled for this time.');
    }

    // Group by slot
    const groups = { morning: [], afternoon: [], evening: [], night: [] };
    meds.forEach(m => (groups[m.slot] || groups.morning).push(m));

    let html = '';
    Object.entries(groups).forEach(([slot, slotMeds]) => {
      if (!slotMeds.length) return;
      if (this._filter === 'all') {
        const slotInfo = Utils.slotColors[slot];
        html += `
          <div class="flex items-center gap-3 mb-2 mt-4 first:mt-0">
            <i data-lucide="${Utils.slotIcon[slot]}" style="width:16px;height:16px;color:${slotInfo.text}"></i>
            <span class="text-sm font-bold uppercase tracking-wider" style="color:${slotInfo.text}">${slot}</span>
            <div class="flex-1 h-px" style="background:${slotInfo.border}"></div>
          </div>
        `;
      }
      slotMeds.forEach(m => { html += this._medCard(m); });
    });
    return html;
  },

  _medCard(med) {
    const warn = Utils.pillCountWarning(med.pillsLeft);
    return `
      <div class="med-card ${med.slot} ${med.taken ? 'taken' : ''}" id="med-card-${med.id}">
        <div class="flex items-start gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-bold text-white ${med.taken ? 'line-through opacity-60' : ''}">${med.name}</h3>
                <p class="text-sm text-gray-400">${med.dose} · ${med.purpose}</p>
              </div>
              <span class="badge ${med.taken ? 'badge-green' : 'badge-amber'} flex-shrink-0">
                ${med.taken ? '✓ Taken' : 'Pending'}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-3 mt-3">
              <div class="flex items-center gap-1 text-xs text-gray-500">
                <i data-lucide="clock" style="width:12px;height:12px"></i>
                <span>${med.time}</span>
              </div>
              <div class="flex items-center gap-1 text-xs" style="color:${warn.color}">
                <i data-lucide="package" style="width:12px;height:12px"></i>
                <span>${med.pillsLeft} pills left · ${warn.label}</span>
              </div>
              <div class="flex items-center gap-1 text-xs text-gray-500">
                <i data-lucide="calendar" style="width:12px;height:12px"></i>
                <span>Refill by ${Utils.formatDate(med.refillDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          ${med.taken
            ? `<button class="btn-success taken w-full text-sm" disabled>
                <i data-lucide="check-circle" style="width:16px;height:16px"></i>
                Marked as Taken
              </button>`
            : `<button class="btn-success mark-taken-btn w-full text-sm" data-id="${med.id}">
                <i data-lucide="check" style="width:16px;height:16px"></i>
                Mark as Taken
              </button>
               <button class="btn-secondary text-sm skip-btn" data-id="${med.id}" style="padding:10px 16px">
                <i data-lucide="x" style="width:16px;height:16px"></i>
                Skip
              </button>`
          }
        </div>
      </div>
    `;
  },

  _renderLowPillAlerts() {
    const lowMeds = this._medicines.filter(m => m.pillsLeft <= 10);
    if (!lowMeds.length) return '';
    return `
      <div class="card" style="border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.05)">
        <h3 class="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
          <i data-lucide="alert-triangle" style="width:18px;height:18px;color:#FCD34D"></i>
          Refill Reminders
        </h3>
        <div class="space-y-2">
          ${lowMeds.map(m => {
            const warn = Utils.pillCountWarning(m.pillsLeft);
            return `
              <div class="flex items-center justify-between p-3 rounded-xl border" style="border-color:${warn.color}33;background:${warn.color}0A">
                <div>
                  <span class="text-sm font-semibold" style="color:${warn.color}">${m.name} ${m.dose}</span>
                  <span class="text-xs text-gray-500 ml-2">${m.pillsLeft} pills remaining</span>
                </div>
                <button onclick="App.navigate('availability')" class="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80" style="background:${warn.color}22;color:${warn.color};border:1px solid ${warn.color}44">
                  Find Pharmacy
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  _bindEvents() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this._filter = tab.dataset.filter;
        document.querySelectorAll('.filter-tab').forEach(t => {
          t.className = `filter-tab px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${t.dataset.filter === this._filter
            ? 'bg-primary-600 border-primary-500 text-white'
            : 'border-gray-700 text-gray-400 bg-gray-900 hover:border-gray-600'}`;
        });
        const list = document.getElementById('medicine-list');
        list.innerHTML = this._renderMedicineList();
        lucide.createIcons({ nodes: [list] });
        this._bindMedButtons();
      });
    });

    this._bindMedButtons();
  },

  _bindMedButtons() {
    // Mark as taken
    document.querySelectorAll('.mark-taken-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this._markTaken(btn.dataset.id, true);
      });
    });

    // Skip
    document.querySelectorAll('.skip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Components.toast('Dose skipped. Remember to take it later if possible.', 'info');
      });
    });
  },

  async _markTaken(id, taken) {
    const btn = document.querySelector(`.mark-taken-btn[data-id="${id}"]`);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `${Utils.spinner(14)} Saving…`;
    }

    try {
      await API.postMedicineStatus(id, taken);
      const med = this._medicines.find(m => m.id === id);
      if (med) med.taken = taken;

      // Re-render just the list and progress
      const list = document.getElementById('medicine-list');
      list.innerHTML = this._renderMedicineList();
      lucide.createIcons({ nodes: [list] });
      this._bindMedButtons();

      // Update progress card
      const takenCount = this._medicines.filter(m => m.taken).length;
      const total = this._medicines.length;
      const pct = Utils.pct(takenCount, total);
      Components.toast(`✅ ${this._medicines.find(m => m.id === id)?.name} marked as taken!`, 'success');
    } catch (err) {
      Components.toast('Failed to update. Please try again.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px"></i> Mark as Taken';
        lucide.createIcons({ nodes: [btn] });
      }
    }
  },
};
