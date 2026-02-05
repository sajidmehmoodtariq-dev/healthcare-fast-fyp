import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://healthcare-fast-fyp.vercel.app/api';

const PatientChat = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'chat', or 'prescriptions'
  const [conversations, setConversations] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'doctors') {
      fetchConversations();
    } else if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedDoctor && activeTab === 'chat') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedDoctor, activeTab]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch existing chat conversations
      const chatResponse = await axios.get(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingConversations = chatResponse.data.conversations || [];
      
      // Fetch approved appointments to get doctors
      const appointmentsResponse = await axios.get(`${API_URL}/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get unique doctors from approved appointments
      const approvedAppointments = appointmentsResponse.data.appointments.filter(
        apt => apt.status === 'approved'
      );
      
      const doctorsMap = new Map();
      
      // Add doctors from appointments
      approvedAppointments.forEach(apt => {
        const doctorId = apt.doctor.id || apt.doctor_id;
        if (!doctorsMap.has(doctorId)) {
          doctorsMap.set(doctorId, {
            partnerId: doctorId,
            partnerName: apt.doctor.full_name,
            specialization: apt.doctor.specialization,
            lastMessage: 'Start a conversation',
            lastMessageTime: new Date(),
            unreadCount: 0
          });
        }
      });
      
      // Update with existing chat conversations
      existingConversations.forEach(conv => {
        if (doctorsMap.has(conv.partnerId)) {
          doctorsMap.set(conv.partnerId, conv);
        } else {
          doctorsMap.set(conv.partnerId, conv);
        }
      });
      
      setConversations(Array.from(doctorsMap.values()));
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedDoctor) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/messages/${selectedDoctor.partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(response.data.prescriptions);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedDoctor) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/chat/send`,
        {
          receiverId: selectedDoctor.partnerId,
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

  const startChat = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveTab('chat');
  };

  const backToConversations = () => {
    setSelectedDoctor(null);
    setActiveTab('doctors');
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white p-4 md:p-6 rounded-t-3xl">
        <div className="flex items-center gap-3 mb-4">
          {(activeTab === 'chat' && selectedDoctor) ? (
            <button 
              onClick={backToConversations}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors lg:hidden"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-base md:text-lg">
              {activeTab === 'chat' && selectedDoctor ? selectedDoctor.partnerName : 'Messages & Prescriptions'}
            </h2>
            <p className="text-xs md:text-sm opacity-90">
              {activeTab === 'chat' && selectedDoctor ? 'Doctor' : 'Chat with doctors and view prescriptions'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        {(!selectedDoctor || activeTab !== 'chat') && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'doctors'
                  ? 'bg-white text-teal-500'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Doctors
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'prescriptions'
                  ? 'bg-white text-teal-500'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Prescriptions
            </button>
          </div>
        )}
      </div>

      {/* Doctors List */}
      {activeTab === 'doctors' && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 font-medium">No conversations yet</p>
              <p className="text-gray-500 text-sm mt-2">Book an appointment to start chatting with doctors</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.partnerId}
                  onClick={() => startChat(conv)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      👨‍⚕️
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800">{conv.partnerName}</h3>
                          {conv.specialization && (
                            <p className="text-xs text-teal-600">{conv.specialization}</p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      {conv.lastMessageTime && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.lastMessageTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      {activeTab === 'chat' && selectedDoctor && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No messages yet</p>
                  <p className="text-gray-500 text-sm mt-1">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isCurrentUser = msg.sender_id === user?.id;
                return (
                  <div key={idx} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${
                      isCurrentUser 
                        ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    } rounded-2xl p-3 md:p-4 shadow-sm`}>
                      <p className="text-sm md:text-base">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white text-opacity-70' : 'text-gray-400'}`}>
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
                disabled={!inputMessage.trim()}
                className="p-2 md:p-3 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <p className="text-gray-600 mt-4">Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-medium">No prescriptions</p>
              <p className="text-gray-500 text-sm mt-2">Your prescriptions will appear here</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-base">Prescription #{prescription.id}</h4>
                      <p className="text-sm text-teal-600">Dr. {prescription.doctor.full_name}</p>
                      <p className="text-xs text-gray-500">{prescription.doctor.specialization}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>

                  {prescription.diagnosis && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs font-medium text-blue-900 mb-1">Diagnosis</p>
                      <p className="text-sm text-blue-700">{prescription.diagnosis}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Medications</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{prescription.medications}</p>
                  </div>

                  {prescription.dosage && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Dosage</p>
                      <p className="text-sm text-gray-800">{prescription.dosage}</p>
                    </div>
                  )}

                  {prescription.instructions && (
                    <div className="mb-3 p-3 bg-yellow-50 rounded-xl">
                      <p className="text-xs font-medium text-yellow-900 mb-1">Instructions</p>
                      <p className="text-sm text-yellow-700">{prescription.instructions}</p>
                    </div>
                  )}

                  {prescription.notes && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Additional Notes</p>
                      <p className="text-sm text-gray-600">{prescription.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Prescribed: {new Date(prescription.created_at).toLocaleDateString()}</span>
                    <button 
                      onClick={() => window.print()}
                      className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientChat;
