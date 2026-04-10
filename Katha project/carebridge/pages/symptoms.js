// ============================================================
// Symptom Recorder Page
// /pages/symptoms.js
// ============================================================

const SymptomsPage = {
  _symptoms: [],
  _isRecording: false,
  _recordingTimer: null,
  _recordingSeconds: 0,

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = Components.loadingOverlay('Loading symptom history…');

    try {
      const res = await API.getSymptoms();
      this._symptoms = res.data;
      content.innerHTML = this._buildHTML();
      lucide.createIcons({ nodes: [content] });
      this._bindEvents();
    } catch (err) {
      content.innerHTML = Components.errorState(err.message, 'SymptomsPage.render');
      lucide.createIcons({ nodes: [content] });
    }
  },

  _buildHTML() {
    return `
      <div class="animate-fade-in space-y-6">

        ${Components.pageHeader(
          'Symptom Recorder',
          'Log your symptoms by typing or using voice input',
          'activity',
          'Symptom Recorder'
        )}

        <!-- Record New Symptom -->
        <div class="card" style="border-color:#1e2d6e;background:linear-gradient(135deg,#0c1232 0%,#0f112a 100%)">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="plus-circle" style="width:20px;height:20px;color:#60A5FA"></i>
            Record New Symptom
          </h2>

          <!-- Voice Input UI -->
          <div class="flex flex-col items-center py-6 mb-6 rounded-2xl border-2 border-dashed border-gray-700 bg-white/3">
            <div class="relative mb-4">
              <button id="voice-record-btn"
                class="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
                style="background:linear-gradient(135deg,#1e40af,#7c3aed);box-shadow:0 0 30px rgba(124,58,237,0.3)"
                title="Click to start/stop voice recording"
                aria-label="Voice Record Button">
                <i data-lucide="mic" style="width:32px;height:32px;color:white" id="voice-icon"></i>
              </button>
            </div>
            <p id="voice-status-text" class="text-sm text-gray-400 font-medium">Tap the mic to describe your symptoms</p>
            <p id="voice-timer" class="text-xs text-gray-600 mt-1 hidden">⏱ <span id="rec-seconds">0</span>s recording...</p>
            <p class="text-xs text-gray-600 mt-3">(Voice input is simulated in this demo)</p>
          </div>

          <!-- Manual Input Form -->
          <form id="symptom-form" class="space-y-4" novalidate>
            <div>
              <label for="symptom-desc" class="label">Describe Your Symptoms *</label>
              <textarea id="symptom-desc" class="input-field" rows="3"
                placeholder="e.g., Mild headache since morning, felt dizzy after breakfast..."
                style="resize:vertical;min-height:90px"></textarea>
              <p id="symptom-desc-err" class="text-xs text-red-400 mt-1 hidden">Please describe your symptoms.</p>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="label">Severity Level *</label>
                <div class="grid grid-cols-3 gap-2">
                  ${[
                    { v: 'mild',     label: 'Mild',     color: '#34D399' },
                    { v: 'moderate', label: 'Moderate', color: '#FCD34D' },
                    { v: 'high',     label: 'High',     color: '#F87171' },
                  ].map(s => `
                    <label class="severity-option cursor-pointer">
                      <input type="radio" name="severity" value="${s.v}" class="sr-only severity-radio" ${s.v === 'mild' ? 'checked' : ''}>
                      <div class="severity-label p-3 rounded-xl border border-gray-700 text-center text-sm font-semibold transition-all hover:border-gray-500"
                           style="color:${s.color}" data-severity="${s.v}">
                        ${s.label}
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div>
                <label for="symptom-tags" class="label">Tags (comma separated)</label>
                <input type="text" id="symptom-tags" class="input-field"
                  placeholder="headache, nausea, dizzy">
              </div>
            </div>

            <div class="flex gap-3 flex-wrap">
              <button type="submit" id="save-symptom-btn" class="btn-primary flex-1">
                <i data-lucide="save" style="width:16px;height:16px"></i>
                Save Symptom
              </button>
              <button type="button" id="clear-symptom-btn" class="btn-secondary">
                <i data-lucide="x" style="width:16px;height:16px"></i>
                Clear
              </button>
            </div>
          </form>
        </div>

        <!-- Symptom History -->
        <div class="card">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 class="text-lg font-bold text-white">Symptom History</h2>
            <span class="badge badge-blue">${this._symptoms.length} records</span>
          </div>
          <div id="symptoms-list" class="space-y-3">
            ${this._renderSymptomList()}
          </div>
        </div>
      </div>
    `;
  },

  _renderSymptomList(symptoms = this._symptoms) {
    if (!symptoms.length) {
      return Components.emptyState('file-text', 'No Symptoms Recorded', 'Your symptom history is empty. Use the form above to log your first symptom.');
    }
    return symptoms.map(s => this._symptomCard(s)).join('');
  },

  _symptomCard(s) {
    const badge = Utils.severityBadge(s.severity);
    return `
      <div class="p-4 rounded-2xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all animate-slide-up">
        <div class="flex items-start gap-3">
          <span class="badge ${badge.cls} mt-0.5 flex-shrink-0">${badge.label}</span>
          <div class="flex-1 min-w-0">
            <p class="text-gray-100 font-medium text-sm leading-relaxed">${s.description}</p>
            ${s.tags && s.tags.length ? `
              <div class="flex flex-wrap gap-1 mt-2">
                ${s.tags.map(t => `<span class="badge badge-purple" style="font-size:11px">${t}</span>`).join('')}
              </div>
            ` : ''}
            ${s.aiNote ? `
              <div class="mt-3 p-3 rounded-xl text-xs flex items-start gap-2" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2)">
                <i data-lucide="bot" style="width:14px;height:14px;color:#60A5FA;flex-shrink:0;margin-top:1px"></i>
                <span class="text-blue-300">${s.aiNote}</span>
              </div>
            ` : ''}
            <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <i data-lucide="clock" style="width:12px;height:12px"></i>
              ${s.date} · ${s.time}
            </p>
          </div>
        </div>
      </div>
    `;
  },

  _bindEvents() {
    // Severity radio styles
    document.querySelectorAll('.severity-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.severity-label').forEach(lbl => {
          lbl.style.background = '';
          lbl.style.borderColor = '#374151';
        });
        const selected = document.querySelector(`.severity-label[data-severity="${radio.value}"]`);
        if (selected) {
          const colors = { mild: '#34D399', moderate: '#FCD34D', high: '#F87171' };
          selected.style.background = colors[radio.value] + '22';
          selected.style.borderColor = colors[radio.value] + '88';
        }
      });
    });

    // Initialize first selected
    const checkedRadio = document.querySelector('.severity-radio:checked');
    if (checkedRadio) checkedRadio.dispatchEvent(new Event('change'));

    // Voice recording
    document.getElementById('voice-record-btn').addEventListener('click', () => {
      this._toggleRecording();
    });

    // Form submit
    document.getElementById('symptom-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this._saveSymptom();
    });

    // Clear form
    document.getElementById('clear-symptom-btn').addEventListener('click', () => {
      document.getElementById('symptom-form').reset();
      document.querySelectorAll('.severity-label').forEach(lbl => {
        lbl.style.background = '';
        lbl.style.borderColor = '#374151';
      });
      const mildLabel = document.querySelector('.severity-label[data-severity="mild"]');
      if (mildLabel) { mildLabel.style.background = '#34D39922'; mildLabel.style.borderColor = '#34D39988'; }
    });
  },

  _toggleRecording() {
    this._isRecording = !this._isRecording;
    const btn  = document.getElementById('voice-record-btn');
    const icon = document.getElementById('voice-icon');
    const statusText = document.getElementById('voice-status-text');
    const timer = document.getElementById('voice-timer');

    if (this._isRecording) {
      btn.style.background = 'linear-gradient(135deg,#dc2626,#b91c1c)';
      btn.style.boxShadow = '0 0 30px rgba(220,38,38,0.5), 0 0 0 8px rgba(220,38,38,0.1)';
      icon.setAttribute('data-lucide', 'mic-off');
      statusText.textContent = 'Recording… speak clearly';
      statusText.style.color = '#F87171';
      timer.classList.remove('hidden');
      lucide.createIcons({ nodes: [btn] });

      this._recordingSeconds = 0;
      this._recordingTimer = setInterval(() => {
        this._recordingSeconds++;
        document.getElementById('rec-seconds').textContent = this._recordingSeconds;

        // Auto-stop at 10s and fill mock text
        if (this._recordingSeconds >= 10) this._stopRecordingWithResult();
      }, 1000);
    } else {
      this._stopRecordingWithResult();
    }
  },

  _stopRecordingWithResult() {
    clearInterval(this._recordingTimer);
    this._isRecording = false;

    const btn  = document.getElementById('voice-record-btn');
    const icon = document.getElementById('voice-icon');
    const statusText = document.getElementById('voice-status-text');
    const timer = document.getElementById('voice-timer');

    btn.style.background = 'linear-gradient(135deg,#1e40af,#7c3aed)';
    btn.style.boxShadow = '0 0 30px rgba(124,58,237,0.3)';
    icon.setAttribute('data-lucide', 'mic');
    timer.classList.add('hidden');
    lucide.createIcons({ nodes: [btn] });

    // Simulate transcription result
    const mockTranscriptions = [
      'Mild headache since this morning, felt dizzy after breakfast.',
      'Knee joint pain while walking, especially on stairs.',
      'Feeling unusually tired and short of breath after a short walk.',
      'Stomach upset and nausea after taking morning medicines.',
    ];
    const transcribed = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    document.getElementById('symptom-desc').value = transcribed;
    statusText.textContent = '✅ Voice transcribed successfully';
    statusText.style.color = '#34D399';

    Components.toast('Voice recorded and transcribed!', 'success');
    setTimeout(() => {
      statusText.textContent = 'Tap the mic to describe your symptoms';
      statusText.style.color = '';
    }, 3000);
  },

  async _saveSymptom() {
    const desc  = document.getElementById('symptom-desc').value.trim();
    const sev   = document.querySelector('.severity-radio:checked')?.value || 'mild';
    const tagsRaw = document.getElementById('symptom-tags').value;
    const tags  = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    const errEl = document.getElementById('symptom-desc-err');

    if (!desc) {
      errEl.classList.remove('hidden');
      document.getElementById('symptom-desc').focus();
      return;
    }
    errEl.classList.add('hidden');

    const btn = document.getElementById('save-symptom-btn');
    btn.disabled = true;
    btn.innerHTML = `${Utils.spinner(16)} Saving…`;

    try {
      const res = await API.postSymptom({ description: desc, severity: sev, tags });
      this._symptoms.unshift(res.data);
      document.getElementById('symptoms-list').innerHTML = this._renderSymptomList();
      lucide.createIcons({ nodes: [document.getElementById('symptoms-list')] });
      document.getElementById('symptom-form').reset();
      document.querySelector('.severity-label[data-severity="mild"]').style.background = '#34D39922';
      document.querySelector('.severity-label[data-severity="mild"]').style.borderColor = '#34D39988';
      Components.toast('Symptom saved successfully!', 'success');
    } catch (err) {
      Components.toast(err.message || 'Failed to save symptom.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px"></i> Save Symptom';
      lucide.createIcons({ nodes: [btn] });
    }
  },
};
