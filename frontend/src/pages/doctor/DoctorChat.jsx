import React, { useState } from 'react';

const DoctorChat = ({ onNavigate }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'prescriptions'
  const [chatMessages, setChatMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });

  // Patient prescriptions stored in state
  const [patientPrescriptions, setPatientPrescriptions] = useState({
    1: [
      {
        id: 1,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        date: 'Dec 1, 2025',
        notes: 'Take with food in the morning'
      }
    ],
    2: [
      {
        id: 1,
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '60 days',
        date: 'Nov 28, 2025',
        notes: 'Take with meals'
      }
    ],
    3: []
  });

  const patients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 45,
      avatar: '👩',
      lastMessage: 'Thank you doctor!',
      unread: 2,
      time: '10:30 AM'
    },
    {
      id: 2,
      name: 'Michael Chen',
      age: 32,
      avatar: '👨',
      lastMessage: 'When should I take the medication?',
      unread: 0,
      time: 'Yesterday'
    },
    {
      id: 3,
      name: 'Emily Davis',
      age: 28,
      avatar: '👩‍🦰',
      lastMessage: 'I feel much better now',
      unread: 1,
      time: 'Nov 30'
    }
  ];

  const defaultMessages = {
    1: [
      { type: 'patient', text: 'Hello doctor, I have a question about my medication', time: '10:15 AM' },
      { type: 'doctor', text: 'Hello Sarah! Of course, what would you like to know?', time: '10:20 AM' },
      { type: 'patient', text: 'Thank you doctor!', time: '10:30 AM' }
    ],
    2: [
      { type: 'patient', text: 'When should I take the medication?', time: 'Yesterday' },
      { type: 'doctor', text: 'Take it twice daily with your meals - once in the morning and once in the evening.', time: 'Yesterday' }
    ],
    3: [
      { type: 'patient', text: 'I feel much better now', time: 'Nov 30' }
    ]
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('chat');
    if (!chatMessages[patient.id]) {
      setChatMessages(prev => ({
        ...prev,
        [patient.id]: defaultMessages[patient.id] || []
      }));
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedPatient) return;
    
    const newMessage = {
      type: 'doctor',
      text: inputMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => ({
      ...prev,
      [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMessage]
    }));
    setInputMessage('');
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;
    
    // Create new prescription
    const newPrescription = {
      id: Date.now(), // Using timestamp as unique ID
      medication: prescriptionForm.medication,
      dosage: prescriptionForm.dosage,
      frequency: prescriptionForm.frequency,
      duration: prescriptionForm.duration,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: prescriptionForm.notes
    };
    
    // Add prescription to patient's prescription list
    setPatientPrescriptions(prev => ({
      ...prev,
      [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newPrescription]
    }));
    
    // Reset form
    setPrescriptionForm({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    });
    
    alert('Prescription added successfully!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white p-4 md:p-6 rounded-t-3xl">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors inline-flex lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Patient Messages</h1>
      </div>

      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* Patient List */}
        <div className={`${selectedPatient ? 'hidden lg:block' : 'block'} w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto`}>
          <div className="p-4">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
          <div className="divide-y divide-gray-100">
            {patients.map(patient => (
              <button
                key={patient.id}
                onClick={() => handlePatientSelect(patient)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                  selectedPatient?.id === patient.id ? 'bg-teal-50' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {patient.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{patient.name}</h3>
                    <span className="text-xs text-gray-400">{patient.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{patient.lastMessage}</p>
                </div>
                {patient.unread > 0 && (
                  <div className="w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {patient.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat/Prescription Area */}
        {selectedPatient ? (
          <div className="flex-1 flex flex-col">
            {/* Patient Info Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center text-xl">
                {selectedPatient.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{selectedPatient.name}</h3>
                <p className="text-xs text-gray-500">{selectedPatient.age} years old</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'chat'
                    ? 'text-teal-500 border-b-2 border-teal-500'
                    : 'text-gray-500'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </span>
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'prescriptions'
                    ? 'text-teal-500 border-b-2 border-teal-500'
                    : 'text-gray-500'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Prescriptions
                </span>
              </button>
            </div>

            {/* Chat Content */}
            {activeTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(chatMessages[selectedPatient.id] || []).map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] ${
                        msg.type === 'doctor' 
                          ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      } rounded-2xl p-3 md:p-4 shadow-sm`}>
                        <p className="text-sm md:text-base">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.type === 'doctor' ? 'text-white text-opacity-70' : 'text-gray-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 md:py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm md:text-base"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="p-2 md:p-3 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Prescriptions Content */}
            {activeTab === 'prescriptions' && (
              <div className="flex-1 overflow-y-auto p-4">
                {/* Previous Prescriptions */}
                {patientPrescriptions[selectedPatient.id]?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3">Previous Prescriptions</h3>
                    <div className="space-y-3">
                      {patientPrescriptions[selectedPatient.id].map(prescription => (
                        <div key={prescription.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{prescription.medication}</h4>
                            <span className="text-xs text-gray-500">{prescription.date}</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                            <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                            <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                            {prescription.notes && (
                              <p className="text-xs text-gray-500 mt-2 italic">{prescription.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Prescription Form */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Add New Prescription</h3>
                  <form onSubmit={handlePrescriptionSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={prescriptionForm.medication}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={prescriptionForm.dosage}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                        placeholder="e.g., 10mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={prescriptionForm.frequency}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})}
                        placeholder="e.g., Twice daily"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={prescriptionForm.duration}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                        placeholder="e.g., 30 days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                        placeholder="Additional instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                        rows="3"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      Add Prescription
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;
