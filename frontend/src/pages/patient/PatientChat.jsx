import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://healthcare-fast-fyp.vercel.app/api';

const PatientChat = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'chat', 'ai', or 'prescriptions'
  const [conversations, setConversations] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Chat state
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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

  const formatAIText = (text) => {
    // Split text into lines
    const lines = text.split('\n');
    const formatted = [];
    
    lines.forEach((line, idx) => {
      // Handle bold text (**text**)
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${idx}-${match.index}`} className="font-semibold text-gray-900">{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      // Handle bullet points
      if (line.trim().startsWith('*') || line.trim().startsWith('•')) {
        formatted.push(
          <div key={idx} className="flex gap-2 ml-2">
            <span className="text-purple-600 font-bold">•</span>
            <span className="flex-1">{parts.length > 0 ? parts : line.substring(line.indexOf('*') + 1).trim()}</span>
          </div>
        );
      } else if (line.trim() === '') {
        formatted.push(<div key={idx} className="h-2"></div>);
      } else {
        formatted.push(<div key={idx}>{parts.length > 0 ? parts : line}</div>);
      }
    });
    
    return formatted;
  };

  const handleAIChat = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { type: 'user', text: aiInput, time: new Date() };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/ai/chat`,
        { message: aiInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = {
        type: 'ai',
        text: response.data.response,
        disclaimer: response.data.disclaimer,
        time: new Date()
      };
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error with AI chat:', err);
      const errorMessage = {
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        time: new Date()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
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
              className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs md:text-sm transition-colors ${
                activeTab === 'doctors'
                  ? 'bg-white text-teal-500'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              👨‍⚕️ Doctors
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs md:text-sm transition-colors ${
                activeTab === 'ai'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🤖 AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 py-2 px-3 rounded-xl font-medium text-xs md:text-sm transition-colors ${
                activeTab === 'prescriptions'
                  ? 'bg-white text-teal-500'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📋 Prescriptions
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

      {/* AI Assistant Tab */}
      {activeTab === 'ai' && (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* AI Disclaimer */}
          <div className="p-3 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-yellow-800">
                <strong>AI Medical Assistant</strong> - This is an AI helper that can provide general health information. 
                Always consult your doctor for medical advice and treatment.
              </p>
            </div>
          </div>

          {/* AI Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">AI Medical Assistant</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    I can help answer your health questions, explain your prescriptions, and provide general medical information.
                  </p>
                  <div className="text-left bg-white rounded-xl p-3 text-xs text-gray-600 space-y-1">
                    <p>• Ask about your medications</p>
                    <p>• Get general health advice</p>
                    <p>• Understand your symptoms</p>
                    <p>• Learn about wellness tips</p>
                  </div>
                </div>
              </div>
            ) : (
              aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[75%] ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  } rounded-2xl p-3 md:p-4 shadow-sm`}>
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                      </div>
                    )}
                    <div className="text-sm md:text-base leading-relaxed space-y-1">
                      {msg.type === 'ai' ? formatAIText(msg.text) : msg.text}
                    </div>
                    {msg.disclaimer && (
                      <p className="text-xs mt-2 pt-2 border-t border-gray-200 text-gray-500 italic">
                        {msg.disclaimer}
                      </p>
                    )}
                    <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white text-opacity-70' : 'text-gray-400'}`}>
                      {msg.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Chat Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleAIChat()}
                placeholder="Ask me anything about your health..."
                className="flex-1 px-4 py-2 md:py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                disabled={aiLoading}
              />
              <button 
                onClick={handleAIChat}
                disabled={!aiInput.trim() || aiLoading}
                className="p-2 md:p-3 bg-gradient-to-br from-purple-400 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientChat;
