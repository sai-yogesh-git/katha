// ============================================================
// CareBridge – Mock Data
// /data/mockData.js
// ============================================================

const MOCK_DATA = {

  // ── Patient Info ──────────────────────────────────────────
  patient: {
    id: 'P001',
    name: 'Rajesh Kumar',
    age: 72,
    gender: 'Male',
    initials: 'RK',
    bloodGroup: 'O+',
    doctor: 'Dr. Shalini Verma',
    lastVisit: '2026-03-28',
    conditions: ['Hypertension', 'Type 2 Diabetes', 'Arthritis'],
    caregiver: 'Priya Kumar',
    emergencyContact: '+91 98765 43210',
  },

  // ── Medicines ─────────────────────────────────────────────
  medicines: [
    {
      id: 'm1', name: 'Metformin', dose: '500mg',
      time: 'Morning (8:00 AM)', slot: 'morning',
      purpose: 'Blood Sugar Control', taken: false,
      refillDate: '2026-04-20', pillsLeft: 14,
    },
    {
      id: 'm2', name: 'Amlodipine', dose: '5mg',
      time: 'Morning (9:00 AM)', slot: 'morning',
      purpose: 'Blood Pressure Control', taken: false,
      refillDate: '2026-04-18', pillsLeft: 7,
    },
    {
      id: 'm3', name: 'Pantoprazole', dose: '40mg',
      time: 'Afternoon (1:00 PM)', slot: 'afternoon',
      purpose: 'Acid Reflux Relief', taken: true,
      refillDate: '2026-04-25', pillsLeft: 21,
    },
    {
      id: 'm4', name: 'Vitamin D3', dose: '1000IU',
      time: 'Afternoon (2:00 PM)', slot: 'afternoon',
      purpose: 'Bone Health', taken: false,
      refillDate: '2026-05-10', pillsLeft: 30,
    },
    {
      id: 'm5', name: 'Atorvastatin', dose: '10mg',
      time: 'Evening (7:00 PM)', slot: 'evening',
      purpose: 'Cholesterol Management', taken: false,
      refillDate: '2026-04-22', pillsLeft: 5,
    },
    {
      id: 'm6', name: 'Aspirin', dose: '75mg',
      time: 'Night (9:00 PM)', slot: 'night',
      purpose: 'Blood Thinner', taken: false,
      refillDate: '2026-04-30', pillsLeft: 18,
    },
  ],

  // ── Symptoms ──────────────────────────────────────────────
  symptoms: [
    {
      id: 's1', date: '2026-04-10', time: '08:30 AM',
      description: 'Mild headache and slight dizziness after morning walk',
      severity: 'mild', tags: ['headache', 'dizziness'],
      aiNote: 'Could be related to blood pressure fluctuation. Monitor BP.',
    },
    {
      id: 's2', date: '2026-04-09', time: '03:15 PM',
      description: 'Knee joint pain while climbing stairs',
      severity: 'moderate', tags: ['knee pain', 'joint'],
      aiNote: 'Arthritis symptom. Apply cold compress and rest.',
    },
    {
      id: 's3', date: '2026-04-08', time: '10:00 AM',
      description: 'Increased thirst and frequent urination',
      severity: 'moderate', tags: ['thirst', 'urination', 'diabetes'],
      aiNote: 'Possible blood sugar spike. Check glucose levels.',
    },
    {
      id: 's4', date: '2026-04-07', time: '06:45 PM',
      description: 'Mild chest discomfort after lunch. Lasted 10 minutes.',
      severity: 'high', tags: ['chest', 'discomfort'],
      aiNote: '⚠ Consult doctor immediately if symptom recurs.',
    },
  ],

  // ── Prescription OCR Result (mock) ───────────────────────
  prescriptionResult: {
    doctorName: 'Dr. Shalini Verma',
    hospitalName: 'Apollo Hospitals, Chennai',
    prescriptionDate: '2026-03-28',
    patientName: 'Rajesh Kumar',
    medicines: [
      { name: 'Metformin 500mg', instructions: 'Twice daily after meals', duration: '30 days' },
      { name: 'Amlodipine 5mg',  instructions: 'Once daily morning', duration: '30 days' },
      { name: 'Aspirin 75mg',    instructions: 'Once daily at night',   duration: '30 days' },
    ],
    notes: 'Monitor BP daily. Low salt, low sugar diet. Walk 30 min/day.',
  },

  // ── Chat Responses ────────────────────────────────────────
  chatResponses: [
    {
      keywords: ['headache', 'head'],
      response: '🧠 Headaches in elderly patients can be due to dehydration, high blood pressure, or vision issues. Make sure you are drinking 6–8 glasses of water daily. If the headache is severe or sudden, please contact your doctor immediately.',
    },
    {
      keywords: ['sugar', 'diabetes', 'glucose'],
      response: '🩸 Maintaining blood sugar levels is very important. Take Metformin regularly as prescribed. Avoid sweets and refined carbs. Check blood glucose levels ideally twice daily. If levels are very high (>250 mg/dL), consult Dr. Shalini Verma.',
    },
    {
      keywords: ['bp', 'blood pressure', 'pressure'],
      response: '❤️ Your Amlodipine helps control blood pressure. Take it every morning without fail. Reduce salt intake, avoid stress, and check BP daily. Ideal range: 120/80 mmHg. Values above 140/90 need doctor attention.',
    },
    {
      keywords: ['pain', 'knee', 'joint', 'arthritis'],
      response: '🦴 Joint pain is common with arthritis. Apply a warm/cold compress for relief. Avoid straining the joints. Gentle exercises like swimming or walking on flat ground help. Your doctor can adjust pain management if needed.',
    },
    {
      keywords: ['medicine', 'tablet', 'pill', 'medication'],
      response: '💊 Your medicines are: Metformin (morning), Amlodipine (morning), Pantoprazole (afternoon), Vitamin D3 (afternoon), Atorvastatin (evening), and Aspirin (night). Never skip doses. The reminder section keeps track for you!',
    },
    {
      keywords: ['dizzy', 'dizziness', 'lightheaded'],
      response: '😵 Dizziness can result from low BP, dehydration, or sudden position changes. Always rise slowly from bed or chair. Stay hydrated. If dizziness is frequent or causes falls, inform Dr. Shalini immediately.',
    },
    {
      keywords: ['sleep', 'insomnia', 'tired'],
      response: '😴 Good sleep is essential for health. Aim for 7–8 hours. Avoid screens before bed, maintain a consistent sleep schedule. Chamomile tea or light stretching before bed can help. If sleep issues persist, consult your doctor.',
    },
    {
      keywords: ['diet', 'food', 'eat'],
      response: '🥗 For your conditions: Low sugar foods for diabetes, low-sodium for blood pressure. Include fiber-rich vegetables, whole grains, and lean protein. Avoid fried food, excessive tea/coffee. Drink at least 2 liters of water daily.',
    },
    {
      keywords: ['hello', 'hi', 'hey', 'namaste'],
      response: '🙏 Hello! I am your CareBridge AI assistant. I am here to help you with health queries, medication information, and symptom guidance. How can I assist you today?',
    },
  ],

  defaultChatResponse: '🤖 Thank you for your question. I recommend consulting with Dr. Shalini Verma for specific medical advice. I can help with general health guidance, medication reminders, and symptom tracking. Is there something specific I can assist you with?',

  // ── Pharmacy Data ─────────────────────────────────────────
  pharmacies: [
    {
      id: 'ph1', name: 'Apollo Pharmacy',
      distance: '0.4 km', address: 'Anna Nagar, Chennai',
      available: true, price: '₹45.00/strip', hours: '24 hours',
      rating: 4.8, phone: '+91 44-2615-0000',
    },
    {
      id: 'ph2', name: 'MedPlus Health',
      distance: '0.9 km', address: 'T. Nagar, Chennai',
      available: true, price: '₹42.50/strip', hours: '7AM – 11PM',
      rating: 4.5, phone: '+91 44-2434-5678',
    },
    {
      id: 'ph3', name: 'Netmeds Local Store',
      distance: '1.2 km', address: 'Mylapore, Chennai',
      available: false, price: '₹48.00/strip', hours: '8AM – 10PM',
      rating: 4.3, phone: '+91 44-9876-5432',
    },
    {
      id: 'ph4', name: 'Wellness Forever',
      distance: '1.8 km', address: 'Adyar, Chennai',
      available: true, price: '₹40.00/strip', hours: '8AM – 9PM',
      rating: 4.6, phone: '+91 44-2491-1234',
    },
  ],

  // ── Caregiver / Patient Adherence ─────────────────────────
  adherenceData: {
    weekly: [
      { day: 'Mon', taken: 6, total: 6 },
      { day: 'Tue', taken: 5, total: 6 },
      { day: 'Wed', taken: 6, total: 6 },
      { day: 'Thu', taken: 4, total: 6 },
      { day: 'Fri', taken: 6, total: 6 },
      { day: 'Sat', taken: 5, total: 6 },
      { day: 'Sun', taken: 3, total: 6 },
    ],
    overall: 86,
  },

  caregiverAlerts: [
    {
      id: 'a1', type: 'warning', time: '09:15 AM',
      title: 'Missed Morning Dose',
      message: 'Amlodipine (5mg) was not marked as taken.',
    },
    {
      id: 'a2', type: 'error', time: 'Yesterday 06:45 PM',
      title: 'High Severity Symptom',
      message: 'Chest discomfort reported. Doctor follow-up recommended.',
    },
    {
      id: 'a3', type: 'info', time: '2 days ago',
      title: 'Low Pill Count',
      message: 'Atorvastatin has only 5 pills left. Refill needed by Apr 22.',
    },
  ],

  vitals: {
    bp: { value: '132/84', unit: 'mmHg', status: 'slightly-high', label: 'Blood Pressure' },
    glucose: { value: '118', unit: 'mg/dL', status: 'normal', label: 'Blood Glucose' },
    heartRate: { value: '74', unit: 'bpm', status: 'normal', label: 'Heart Rate' },
    weight: { value: '72', unit: 'kg', status: 'normal', label: 'Weight' },
  },

  quickStats: {
    medicinesTaken: 1,
    medicinesTotal: 6,
    symptomsThisWeek: 4,
    adherenceRate: 86,
    nextAppointment: '2026-04-24',
  },

};
