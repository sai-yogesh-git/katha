// ============================================================
// Medicine Availability Page
// /pages/availability.js
// ============================================================

const AvailabilityPage = {
  _results: [],
  _isSearching: false,
  _lastQuery: '',

  async render() {
    const content = document.getElementById('page-content');
    content.innerHTML = this._buildHTML();
    lucide.createIcons({ nodes: [content] });
    this._bindEvents();
  },

  _buildHTML() {
    const suggestions = ['Metformin', 'Amlodipine', 'Aspirin', 'Atorvastatin', 'Pantoprazole', 'Vitamin D3'];

    return `
      <div class="animate-fade-in space-y-6">

        ${Components.pageHeader(
          'Medicine Availability',
          'Find medicines at nearby pharmacies',
          'search',
          'Medicine Availability'
        )}

        <!-- Search Bar -->
        <div class="card">
          <div class="relative">
            <div class="absolute left-4 top-1/2 -translate-y-1/2">
              <i data-lucide="search" style="width:18px;height:18px;color:#4B5563"></i>
            </div>
            <input type="text" id="med-search-input" class="input-field"
              placeholder="Search medicine name…"
              style="padding-left:44px;padding-right:120px;font-size:16px"
              autocomplete="off"
              aria-label="Search medicine" />
            <button id="med-search-btn" class="btn-primary absolute right-2 top-1/2 -translate-y-1/2"
              style="padding:9px 18px;font-size:14px">
              Search
            </button>
          </div>

          <!-- Quick Suggestions -->
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="text-xs text-gray-500 font-medium flex items-center">Quick search:</span>
            ${suggestions.map(s => `
              <button class="suggestion-btn px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-800 text-gray-300 border border-gray-700 hover:border-primary-500 hover:text-primary-300 transition-all"
                data-medicine="${s}">${s}</button>
            `).join('')}
          </div>
        </div>

        <!-- Location Bar -->
        <div class="flex items-center gap-3 p-4 rounded-2xl border border-gray-700 bg-gray-900/60">
          <i data-lucide="map-pin" style="width:18px;height:18px;color:#34D399"></i>
          <div class="flex-1">
            <div class="text-sm font-semibold text-gray-200">Anna Nagar, Chennai</div>
            <div class="text-xs text-gray-500">Searching within 5 km radius</div>
          </div>
          <button class="text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors">Change</button>
        </div>

        <!-- Results -->
        <div id="availability-results">
          ${Components.emptyState(
            'search',
            'Search for a Medicine',
            'Enter a medicine name above to find nearby pharmacies with availability information.',
          )}
        </div>
      </div>
    `;
  },

  _renderResults(medicineName, pharmacies) {
    const available = pharmacies.filter(p => p.available);
    const unavail   = pharmacies.filter(p => !p.available);

    return `
      <div class="space-y-4 animate-slide-up">

        <!-- Result Summary -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-base font-bold text-white">Results for "<span class="gradient-text">${medicineName}</span>"</h2>
            <p class="text-xs text-gray-500 mt-0.5">${pharmacies.length} pharmacies found · ${available.length} have it in stock</p>
          </div>
          <div class="flex gap-2">
            <span class="badge badge-green">${available.length} Available</span>
            <span class="badge badge-red">${unavail.length} Unavailable</span>
          </div>
        </div>

        <!-- Best Price Banner -->
        ${available.length ? (() => {
          const best = available.reduce((a, b) => {
            const ap = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const bp = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return ap < bp ? a : b;
          });
          return `
            <div class="p-4 rounded-2xl flex items-center gap-3" style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.2)">
              <i data-lucide="tag" style="width:20px;height:20px;color:#34D399"></i>
              <div>
                <div class="text-sm font-bold text-green-300">Best Price: ${best.price} at ${best.name}</div>
                <div class="text-xs text-gray-500">${best.distance} away · ${best.hours}</div>
              </div>
              <button onclick="AvailabilityPage._callPharmacy('${best.phone}')" class="ml-auto btn-success" style="padding:8px 16px;font-size:13px">
                <i data-lucide="phone" style="width:14px;height:14px"></i> Call
              </button>
            </div>
          `;
        })() : ''}

        <!-- Pharmacy Cards -->
        ${pharmacies.map(p => this._pharmacyCard(p)).join('')}
      </div>
    `;
  },

  _pharmacyCard(pharmacy) {
    return `
      <div class="pharmacy-card">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style="background:${pharmacy.available ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'};border:1px solid ${pharmacy.available ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}">
            <i data-lucide="building-2" style="width:20px;height:20px;color:${pharmacy.available ? '#34D399' : '#F87171'}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 class="text-base font-bold text-white">${pharmacy.name}</h3>
                <p class="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  <i data-lucide="map-pin" style="width:12px;height:12px"></i>
                  ${pharmacy.address} · ${pharmacy.distance}
                </p>
              </div>
              <span class="badge ${pharmacy.available ? 'badge-green' : 'badge-red'}">
                ${pharmacy.available ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
            </div>

            <div class="flex flex-wrap gap-4 mt-3 text-sm">
              <div class="flex items-center gap-1 text-gray-300">
                <i data-lucide="indian-rupee" style="width:14px;height:14px;color:#FCD34D"></i>
                <span class="font-semibold">${pharmacy.price}</span>
              </div>
              <div class="flex items-center gap-1 text-gray-400">
                <i data-lucide="clock" style="width:13px;height:13px"></i>
                ${pharmacy.hours}
              </div>
              <div class="text-amber-400 font-semibold" style="font-size:13px">
                ${Utils.stars(pharmacy.rating)} ${pharmacy.rating}
              </div>
            </div>

            <div class="flex gap-2 mt-3 flex-wrap">
              <button onclick="AvailabilityPage._callPharmacy('${pharmacy.phone}')" class="btn-secondary flex-1" style="padding:9px 14px;font-size:13px">
                <i data-lucide="phone" style="width:14px;height:14px"></i> ${pharmacy.phone}
              </button>
              <button onclick="AvailabilityPage._getDirections('${pharmacy.address}')" class="btn-secondary" style="padding:9px 14px;font-size:13px">
                <i data-lucide="navigation" style="width:14px;height:14px"></i> Directions
              </button>
              ${pharmacy.available ? `
                <button class="btn-primary" style="padding:9px 14px;font-size:13px">
                  <i data-lucide="shopping-bag" style="width:14px;height:14px"></i> Order
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _callPharmacy(phone) {
    Components.toast(`Calling ${phone}… (Demo mode)`, 'info');
  },

  _getDirections(address) {
    Components.toast(`Opening maps for ${address}… (Demo mode)`, 'info');
  },

  async _search(medicineName) {
    if (!medicineName.trim()) {
      Components.toast('Please enter a medicine name to search.', 'info');
      return;
    }
    if (this._isSearching) return;

    this._isSearching = true;
    this._lastQuery   = medicineName;
    const resultsDiv  = document.getElementById('availability-results');
    const searchBtn   = document.getElementById('med-search-btn');

    resultsDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 gap-3">
        ${Utils.spinner(36)}
        <p class="text-gray-400 font-medium">Checking nearby pharmacies…</p>
      </div>
    `;

    searchBtn.disabled = true;
    searchBtn.innerHTML = `${Utils.spinner(14)} Searching…`;

    try {
      const res = await API.getMedicineAvailability(medicineName);
      this._results  = res.data;
      resultsDiv.innerHTML = this._renderResults(medicineName, this._results);
      lucide.createIcons({ nodes: [resultsDiv] });
    } catch (err) {
      resultsDiv.innerHTML = Components.errorState(err.message);
      lucide.createIcons({ nodes: [resultsDiv] });
      Components.toast('Search failed. Please try again.', 'error');
    } finally {
      this._isSearching = false;
      searchBtn.disabled = false;
      searchBtn.innerHTML = 'Search';
    }
  },

  _bindEvents() {
    const input = document.getElementById('med-search-input');
    const btn   = document.getElementById('med-search-btn');

    btn.addEventListener('click', () => this._search(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._search(input.value);
    });

    document.querySelectorAll('.suggestion-btn').forEach(s => {
      s.addEventListener('click', () => {
        input.value = s.dataset.medicine;
        this._search(s.dataset.medicine);
      });
    });
  },
};
