// ============================================================
// CareBridge – API Service Layer
// /services/api.js
//
// Structure: All API calls are defined here as async functions.
// They currently use mock data with simulated network delay.
// To connect to a real backend, replace the mock return values
// with actual fetch/axios calls to your server endpoints.
//
// Example replacement:
//   return await fetch('https://your-api.com/medicines').then(r => r.json());
// ============================================================

const API_BASE_URL = 'https://carebridge-api.example.com/v1'; // Replace with backend URL
const SIMULATED_DELAY_MS = 800; // Simulates network latency

/**
 * Simulates an async API call with a delay.
 * @param {*} data - The mock data to return
 * @param {number} [delay] - Optional delay in ms
 * @param {boolean} [shouldFail] - Force a failure for error testing
 */
function simulateAPI(data, delay = SIMULATED_DELAY_MS, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API request failed. Please try again.'));
      } else {
        resolve({ success: true, data, timestamp: new Date().toISOString() });
      }
    }, delay);
  });
}

// ── State cache (simulates server-side state) ──────────────
const _state = {
  medicines: JSON.parse(JSON.stringify(MOCK_DATA.medicines)), // deep copy
  symptoms:  JSON.parse(JSON.stringify(MOCK_DATA.symptoms)),
};

// ============================================================
// MEDICINE APIs
// ============================================================

/**
 * GET /medicines
 * Fetches all medicines for the current patient.
 * Replace with: fetch(`${API_BASE_URL}/medicines`)
 */
async function getMedicines() {
  // Replace with backend API
  return simulateAPI(_state.medicines);
}

/**
 * POST /medicine-status
 * Marks a medicine as taken or not taken.
 * Replace with: fetch(`${API_BASE_URL}/medicine-status`, { method: 'POST', body: JSON.stringify({ id, taken }) })
 * @param {string} id - Medicine ID
 * @param {boolean} taken - Taken status
 */
async function postMedicineStatus(id, taken) {
  // Replace with backend API
  const med = _state.medicines.find(m => m.id === id);
  if (med) med.taken = taken;
  return simulateAPI({ id, taken, updatedAt: new Date().toISOString() }, 400);
}

// ============================================================
// SYMPTOM APIs
// ============================================================

/**
 * GET /symptoms
 * Fetches symptom history for the patient.
 * Replace with: fetch(`${API_BASE_URL}/symptoms`)
 */
async function getSymptoms() {
  // Replace with backend API
  return simulateAPI(_state.symptoms);
}

/**
 * POST /symptoms
 * Saves a new symptom record.
 * Replace with: fetch(`${API_BASE_URL}/symptoms`, { method: 'POST', body: JSON.stringify(symptomData) })
 * @param {{ description: string, severity: string, tags: string[] }} symptomData
 */
async function postSymptom(symptomData) {
  // Replace with backend API
  const newSymptom = {
    id: 's' + Date.now(),
    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    description: symptomData.description,
    severity: symptomData.severity || 'mild',
    tags: symptomData.tags || [],
    aiNote: generateAINote(symptomData.description),
  };
  _state.symptoms.unshift(newSymptom);
  return simulateAPI(newSymptom, 600);
}

// Simple AI note generator for symptoms (mock)
function generateAINote(description) {
  const desc = description.toLowerCase();
  if (desc.includes('chest')) return '⚠ Chest symptoms should be evaluated by a doctor promptly.';
  if (desc.includes('headache') || desc.includes('head')) return 'Monitor blood pressure. Stay hydrated.';
  if (desc.includes('sugar') || desc.includes('thirst')) return 'Check blood glucose levels.';
  if (desc.includes('pain') || desc.includes('ache')) return 'Rest the affected area. Apply warm compress if needed.';
  if (desc.includes('dizzy')) return 'Rise slowly from seated position. Ensure hydration.';
  return 'Symptom logged. Monitor and consult doctor if it worsens.';
}

// ============================================================
// PRESCRIPTION APIs
// ============================================================

/**
 * POST /upload-prescription
 * Uploads a prescription image and receives extracted data.
 * Replace with: multipart/form-data POST with actual OCR backend.
 * @param {File} file - The uploaded prescription file
 */
async function uploadPrescription(file) {
  // Replace with backend API (OCR service)
  console.log('[API] Uploading prescription:', file ? file.name : 'no file');
  return simulateAPI(MOCK_DATA.prescriptionResult, 1500);
}

// ============================================================
// CHAT APIs
// ============================================================

/**
 * GET /chat-response
 * Sends a user message and receives an AI-generated response.
 * Replace with: fetch(`${API_BASE_URL}/chat-response`, { method: 'POST', body: JSON.stringify({ message }) })
 * @param {string} message - User's message
 */
async function getChatResponse(message) {
  // Replace with backend API (AI/LLM service)
  const lower = message.toLowerCase();
  const match = MOCK_DATA.chatResponses.find(r =>
    r.keywords.some(keyword => lower.includes(keyword))
  );
  const response = match ? match.response : MOCK_DATA.defaultChatResponse;
  return simulateAPI({ response, timestamp: new Date().toISOString() }, 1200);
}

// ============================================================
// MEDICINE AVAILABILITY APIs
// ============================================================

/**
 * GET /medicine-availability?name=...
 * Searches nearby pharmacies for medicine availability.
 * Replace with: fetch(`${API_BASE_URL}/medicine-availability?name=${encodeURIComponent(name)}`)
 * @param {string} medicineName - Name of medicine to search
 */
async function getMedicineAvailability(medicineName) {
  // Replace with backend API (pharmacy/inventory API)
  const results = MOCK_DATA.pharmacies.map(ph => ({
    ...ph,
    // Randomly toggle availability for variety
    available: ph.available && Math.random() > 0.2,
  }));
  return simulateAPI(results, 900);
}

// ============================================================
// CAREGIVER / PATIENT MONITORING APIs
// ============================================================

/**
 * GET /patient-status
 * Fetches patient status, adherence, and alerts for caregiver view.
 * Replace with: fetch(`${API_BASE_URL}/patients/P001/status`)
 */
async function getPatientStatus() {
  // Replace with backend API
  return simulateAPI({
    patient: MOCK_DATA.patient,
    adherence: MOCK_DATA.adherenceData,
    alerts: MOCK_DATA.caregiverAlerts,
    vitals: MOCK_DATA.vitals,
    medicines: _state.medicines,
  }, 700);
}

/**
 * GET /vitals
 * Fetches latest patient vitals.
 * Replace with: fetch(`${API_BASE_URL}/patients/P001/vitals`)
 */
async function getVitals() {
  // Replace with backend API
  return simulateAPI(MOCK_DATA.vitals, 500);
}

// ============================================================
// Export (namespace pattern for vanilla JS)
// ============================================================
const API = {
  getMedicines,
  postMedicineStatus,
  getSymptoms,
  postSymptom,
  uploadPrescription,
  getChatResponse,
  getMedicineAvailability,
  getPatientStatus,
  getVitals,
};
