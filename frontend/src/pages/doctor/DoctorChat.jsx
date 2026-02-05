import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://healthcare-fast-fyp.vercel.app/api';

const DoctorChat = ({ onNavigate }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'prescriptions'
  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: '',
    dosage: '',
    instructions: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient && activeTab === 'chat') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    } else if (selectedPatient && activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [selectedPatient, activeTab]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch existing chat conversations
      const chatResponse = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingConversations = chatResponse.data.conversations || [];
      
      // Fetch approved appointments to get patients
      const appointmentsResponse = await axios.get(`${API_URL}/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get unique patients from approved appointments
      const approvedAppointments = appointmentsResponse.data.appointments.filter(
        apt => apt.status === 'approved'
      );
      
      const patientsMap = new Map();
      
      // Add patients from appointments
      approvedAppointments.forEach(apt => {
        const patientId = apt.patient.id || apt.patient_id;
        if (!patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            id: patientId,
            name: apt.patient.full_name,
            age: apt.patient.age || 'N/A',
            gender: apt.patient.gender || 'N/A',
            avatar: apt.patient.gender === 'Male' ? '👨' : apt.patient.gender === 'Female' ? '👩' : '👤',
            lastMessage: 'Start a conversation',
            lastMessageTime: new Date(apt.appointment_date),
            unreadCount: 0
          });
        }
      });
      
      // Update with existing chat conversations
      existingConversations.forEach(conv => {
        if (patientsMap.has(conv.partnerId)) {
          const patient = patientsMap.get(conv.partnerId);
          patient.lastMessage = conv.lastMessage;
          patient.lastMessageTime = new Date(conv.lastMessageTime);
          patient.unreadCount = conv.unreadCount || 0;
        } else {
          patientsMap.set(conv.partnerId, {
            id: conv.partnerId,
            name: conv.partnerName,
            age: 'N/A',
            gender: 'N/A',
            avatar: '👤',
            lastMessage: conv.lastMessage,
            lastMessageTime: new Date(conv.lastMessageTime),
            unreadCount: conv.unreadCount || 0
          });
        }
      });
      
      setPatients(Array.from(patientsMap.values()).sort((a, b) => b.lastMessageTime - a.lastMessageTime));
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedPatient) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/messages/${selectedPatient.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchPrescriptions = async () => {
    if (!selectedPatient) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/prescriptions?patientId=${selectedPatient.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientPrescriptions(response.data.prescriptions);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('chat');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPatient) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/chat/send`,
        {
          receiverId: selectedPatient.id,
          message: inputMessage.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInputMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/prescriptions`,
        {
          patientId: selectedPatient.id,
          diagnosis: prescriptionForm.diagnosis,
          medications: prescriptionForm.medications,
          dosage: prescriptionForm.dosage,
          instructions: prescriptionForm.instructions,
          notes: prescriptionForm.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form
      setPrescriptionForm({
        diagnosis: '',
        medications: '',
        dosage: '',
        instructions: '',
        notes: ''
      });
      
      alert('Prescription added successfully!');
      fetchPrescriptions();
    } catch (err) {
      console.error('Error adding prescription:', err);
      alert('Failed to add prescription');
    }
  };

  const formatTime = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
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
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 text-sm">No patients with approved appointments yet</p>
              </div>
            ) : (
              patients.map(patient => (
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
                      <span className="text-xs text-gray-400">{formatTime(patient.lastMessageTime)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{patient.lastMessage}</p>
                  </div>
                  {patient.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {patient.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
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
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isDoctor = msg.sender_id !== selectedPatient.id;
                      return (
                        <div key={idx} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[70%] ${
                            isDoctor
                              ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' 
                              : 'bg-white text-gray-800 border border-gray-200'
                          } rounded-2xl p-3 md:p-4 shadow-sm`}>
                            <p className="text-sm md:text-base">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isDoctor ? 'text-white text-opacity-70' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                {patientPrescriptions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3">Previous Prescriptions</h3>
                    <div className="space-y-3">
                      {patientPrescriptions.map(prescription => (
                        <div key={prescription.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">Prescription #{prescription.id}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(prescription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {prescription.diagnosis && (
                            <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-900">Diagnosis</p>
                              <p className="text-sm text-blue-700">{prescription.diagnosis}</p>
                            </div>
                          )}
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Medications:</span> {prescription.medications}</p>
                            {prescription.dosage && <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>}
                            {prescription.instructions && <p><span className="font-medium">Instructions:</span> {prescription.instructions}</p>}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                      <input
                        type="text"
                        value={prescriptionForm.diagnosis}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                        placeholder="e.g., Hypertension"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                      <textarea
                        value={prescriptionForm.medications}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, medications: e.target.value})}
                        placeholder="List medications..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                        rows="2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={prescriptionForm.dosage}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                        placeholder="e.g., 10mg twice daily"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      <textarea
                        value={prescriptionForm.instructions}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                        placeholder="e.g., Take with food"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                        placeholder="Additional notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                        rows="2"
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
