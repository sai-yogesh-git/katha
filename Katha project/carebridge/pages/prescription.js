// ============================================================
// Prescription Scanner Page
// /pages/prescription.js
// ============================================================

const PrescriptionPage = {
  _result: null,
  _uploadedFile: null,

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = this._buildHTML();
    lucide.createIcons({ nodes: [content] });
    this._bindEvents();
  },

  _buildHTML() {
    return `
      <div class="animate-fade-in space-y-6">

        ${Components.pageHeader(
          'Prescription Scanner',
          'Upload your prescription to extract medicine details automatically',
          'scan',
          'Prescription Scanner'
        )}

        <!-- Upload Zone -->
        <div class="card">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="upload-cloud" style="width:20px;height:20px;color:#60A5FA"></i>
            Upload Prescription
          </h2>

          <div id="upload-drop-zone" class="upload-zone" role="button" aria-label="Upload prescription image">
            <div class="flex flex-col items-center gap-4" id="upload-zone-content">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center" style="background:rgba(59,130,246,0.1);border:2px dashed rgba(59,130,246,0.3)">
                <i data-lucide="file-image" style="width:28px;height:28px;color:#60A5FA"></i>
              </div>
              <div>
                <p class="text-base font-semibold text-gray-200">Drag & drop your prescription</p>
                <p class="text-sm text-gray-500 mt-1">or click to browse files</p>
                <p class="text-xs text-gray-600 mt-2">Supports: JPG, PNG, PDF (max 10MB)</p>
              </div>
              <button id="browse-btn" class="btn-primary" style="padding:10px 24px;font-size:14px">
                <i data-lucide="folder-open" style="width:16px;height:16px"></i>
                Browse Files
              </button>
            </div>
            <input type="file" id="file-input" class="hidden" accept="image/*,.pdf" />
          </div>

          <!-- File Preview Bar -->
          <div id="file-preview" class="hidden mt-4 flex items-center gap-3 p-4 rounded-xl border border-blue-800/40 bg-blue-900/10">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-800/40">
              <i data-lucide="file-check" style="width:20px;height:20px;color:#60A5FA"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p id="file-name" class="text-sm font-semibold text-gray-200 truncate">prescription.jpg</p>
              <p id="file-size" class="text-xs text-gray-500">2.4 MB</p>
            </div>
            <button id="remove-file-btn" class="btn-danger" style="padding:6px 12px;font-size:12px">
              <i data-lucide="x" style="width:12px;height:12px"></i> Remove
            </button>
          </div>

          <button id="scan-btn" class="btn-primary w-full mt-4 hidden">
            <i data-lucide="scan" style="width:18px;height:18px"></i>
            Scan & Extract Data
          </button>
        </div>

        <!-- Scan Result (shown after upload) -->
        <div id="scan-result" class="hidden space-y-4">
          <!-- Result content injected here -->
        </div>

        <!-- Info Tips -->
        <div class="card" style="background:rgba(245,158,11,0.05);border-color:rgba(245,158,11,0.2)">
          <div class="flex items-start gap-3">
            <i data-lucide="lightbulb" style="width:20px;height:20px;color:#FCD34D;flex-shrink:0;margin-top:2px"></i>
            <div>
              <h3 class="text-sm font-bold text-amber-300 mb-1">Tips for Best Results</h3>
              <ul class="text-sm text-gray-400 space-y-1">
                <li>• Take a clear, well-lit photo of the prescription</li>
                <li>• Ensure the text is not blurry or cut off</li>
                <li>• Lay the prescription flat on a surface before scanning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderResult(data) {
    return `
      <div class="card animate-slide-up" style="border-color:#1e3a8a;background:linear-gradient(135deg,#0c1a40,#0f172a)">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-green-900/40 border border-green-700/40 flex items-center justify-center">
            <i data-lucide="check-circle" style="width:20px;height:20px;color:#34D399"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Extraction Complete</h2>
            <p class="text-xs text-gray-400">Review and edit the extracted information below</p>
          </div>
        </div>

        <!-- Doctor & Hospital Info -->
        <div class="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="label">Doctor Name</label>
            <input type="text" class="input-field" id="rx-doctor" value="${data.doctorName}" />
          </div>
          <div>
            <label class="label">Hospital / Clinic</label>
            <input type="text" class="input-field" id="rx-hospital" value="${data.hospitalName}" />
          </div>
          <div>
            <label class="label">Patient Name</label>
            <input type="text" class="input-field" id="rx-patient" value="${data.patientName}" />
          </div>
          <div>
            <label class="label">Prescription Date</label>
            <input type="date" class="input-field" id="rx-date" value="${data.prescriptionDate}" />
          </div>
        </div>

        <!-- Medicines Extracted -->
        <div class="mb-6">
          <h3 class="text-base font-bold text-white mb-3 flex items-center gap-2">
            <i data-lucide="pill" style="width:16px;height:16px;color:#60A5FA"></i>
            Prescribed Medicines
          </h3>
          <div class="space-y-3">
            ${data.medicines.map((med, i) => `
              <div class="p-4 rounded-2xl border border-gray-700 bg-gray-800/50 relative">
                <div class="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label class="label">Medicine Name</label>
                    <input type="text" class="input-field" value="${med.name}" id="rx-med-${i}-name" />
                  </div>
                  <div>
                    <label class="label">Instructions</label>
                    <input type="text" class="input-field" value="${med.instructions}" id="rx-med-${i}-instructions" />
                  </div>
                  <div>
                    <label class="label">Duration</label>
                    <input type="text" class="input-field" value="${med.duration}" id="rx-med-${i}-duration" />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button id="add-medicine-btn" class="btn-secondary mt-3 text-sm" style="padding:9px 18px">
            <i data-lucide="plus" style="width:14px;height:14px"></i> Add Medicine
          </button>
        </div>

        <!-- Doctor Notes -->
        <div class="mb-6">
          <label class="label">Doctor's Notes</label>
          <textarea class="input-field" id="rx-notes" rows="3" style="resize:vertical">${data.notes}</textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 flex-wrap">
          <button id="save-rx-btn" class="btn-primary flex-1">
            <i data-lucide="save" style="width:16px;height:16px"></i> Save to Profile
          </button>
          <button id="add-to-reminders-btn" class="btn-success">
            <i data-lucide="bell" style="width:16px;height:16px"></i> Add to Reminders
          </button>
          <button id="rescan-btn" class="btn-secondary">
            <i data-lucide="refresh-cw" style="width:16px;height:16px"></i> Rescan
          </button>
        </div>
      </div>
    `;
  },

  _bindEvents() {
    const dropZone = document.getElementById('upload-drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');

    browseBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
      if (e.target === dropZone || e.target.id === 'upload-zone-content') fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this._handleFile(e.target.files[0]);
    });

    // Drag & drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) this._handleFile(e.dataTransfer.files[0]);
    });
  },

  _handleFile(file) {
    this._uploadedFile = file;
    const preview = document.getElementById('file-preview');
    const scanBtn  = document.getElementById('scan-btn');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    preview.classList.remove('hidden');
    scanBtn.classList.remove('hidden');
    lucide.createIcons({ nodes: [preview, scanBtn] });

    document.getElementById('remove-file-btn').addEventListener('click', () => {
      this._uploadedFile = null;
      preview.classList.add('hidden');
      scanBtn.classList.add('hidden');
      document.getElementById('file-input').value = '';
      document.getElementById('scan-result').classList.add('hidden');
    });

    document.getElementById('scan-btn').addEventListener('click', async () => {
      await this._scanPrescription();
    });
  },

  async _scanPrescription() {
    const scanBtn = document.getElementById('scan-btn');
    scanBtn.disabled = true;
    scanBtn.innerHTML = `${Utils.spinner(18)} Scanning… (AI processing)`;

    const resultContainer = document.getElementById('scan-result');
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = `
      <div class="card flex flex-col items-center justify-center py-12 gap-4">
        ${Utils.spinner(40)}
        <p class="text-gray-400 font-medium">AI is reading your prescription…</p>
        <p class="text-xs text-gray-600">Extracting medicine names, dosages, and instructions</p>
      </div>
    `;

    try {
      const res = await API.uploadPrescription(this._uploadedFile);
      this._result = res.data;
      resultContainer.innerHTML = this._renderResult(this._result);
      lucide.createIcons({ nodes: [resultContainer] });
      this._bindResultEvents();
      Components.toast('Prescription scanned successfully!', 'success');
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      resultContainer.innerHTML = Components.errorState(err.message, 'PrescriptionPage._scanPrescription');
      lucide.createIcons({ nodes: [resultContainer] });
      Components.toast('Scan failed. Please try again.', 'error');
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = '<i data-lucide="scan" style="width:18px;height:18px"></i> Scan & Extract Data';
      lucide.createIcons({ nodes: [scanBtn] });
    }
  },

  _bindResultEvents() {
    document.getElementById('save-rx-btn')?.addEventListener('click', () => {
      Components.toast('Prescription saved to your health profile!', 'success');
    });
    document.getElementById('add-to-reminders-btn')?.addEventListener('click', () => {
      Components.toast('Medicines added to your reminder schedule!', 'success');
      setTimeout(() => App.navigate('reminder'), 1200);
    });
    document.getElementById('rescan-btn')?.addEventListener('click', () => {
      document.getElementById('scan-result').classList.add('hidden');
      document.getElementById('file-preview').classList.add('hidden');
      document.getElementById('scan-btn').classList.add('hidden');
      this._uploadedFile = null;
      document.getElementById('file-input').value = '';
    });

    let medCount = this._result.medicines.length;
    document.getElementById('add-medicine-btn')?.addEventListener('click', () => {
      const container = document.querySelector('#scan-result .space-y-3');
      const idx = medCount++;
      const div = document.createElement('div');
      div.className = 'p-4 rounded-2xl border border-gray-700 bg-gray-800/50';
      div.innerHTML = `
        <div class="grid sm:grid-cols-3 gap-3">
          <div><label class="label">Medicine Name</label><input type="text" class="input-field" placeholder="Medicine name" id="rx-med-${idx}-name"/></div>
          <div><label class="label">Instructions</label><input type="text" class="input-field" placeholder="Instructions" id="rx-med-${idx}-instructions"/></div>
          <div><label class="label">Duration</label><input type="text" class="input-field" placeholder="Duration" id="rx-med-${idx}-duration"/></div>
        </div>
      `;
      container.appendChild(div);
    });
  },
};
