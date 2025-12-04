import React, { useState } from 'react';

const PatientChat = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'prescriptions'
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: "Hello! I'm your Physician Assistant. How can I help you today?", time: '10:30 AM' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Mock prescriptions data
  const prescriptions = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      date: 'Dec 1, 2025',
      notes: 'Take with food in the morning',
      status: 'active'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '60 days',
      date: 'Nov 28, 2025',
      notes: 'Take with meals to avoid stomach upset',
      status: 'active'
    },
    {
      id: 3,
      doctor: 'Dr. Sarah Johnson',
      medication: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'Three times daily',
      duration: '7 days',
      date: 'Nov 15, 2025',
      notes: 'Complete the full course',
      status: 'completed'
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage = {
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setInputMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: "I understand. Can you tell me more about when this started and how frequent it is?",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)]">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white p-4 md:p-6 rounded-t-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors lg:hidden"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-base md:text-lg">Healthcare Support</h2>
            <p className="text-xs md:text-sm opacity-90">AI Assistant & Prescriptions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-teal-500'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Assistant
            </span>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
              activeTab === 'prescriptions'
                ? 'bg-white text-teal-500'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Prescriptions
            </span>
          </button>
        </div>
      </div>

      {/* Chat Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] ${msg.type === 'user' ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white' : 'bg-white text-gray-800'} rounded-2xl p-3 md:p-4 shadow-sm`}>
                  <p className="text-sm md:text-base">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white text-opacity-70' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            {chatMessages.length > 2 && (
              <div className="flex justify-center">
                <button className="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-teal-600 transition-colors shadow-lg">
                  View Medical Summary →
                </button>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button className="p-2 md:p-3 text-gray-400 hover:text-teal-500 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
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

      {/* Prescriptions Tab Content */}
      {activeTab === 'prescriptions' && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            {/* Active Prescriptions */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Active Prescriptions</h3>
              <div className="space-y-3">
                {prescriptions.filter(p => p.status === 'active').map(prescription => (
                  <div key={prescription.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-base">{prescription.medication}</h4>
                        <p className="text-sm text-gray-500">Prescribed by {prescription.doctor}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Dosage</p>
                          <p className="text-sm font-medium text-gray-800">{prescription.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Frequency</p>
                          <p className="text-sm font-medium text-gray-800">{prescription.frequency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-800">{prescription.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">Prescribed</p>
                          <p className="text-sm font-medium text-gray-800">{prescription.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    {prescription.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-medium text-blue-900 mb-1">Instructions</p>
                        <p className="text-sm text-blue-700">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Past Prescriptions */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Past Prescriptions</h3>
              <div className="space-y-3">
                {prescriptions.filter(p => p.status === 'completed').map(prescription => (
                  <div key={prescription.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 opacity-75">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-base">{prescription.medication}</h4>
                        <p className="text-sm text-gray-500">Prescribed by {prescription.doctor}</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Dosage</p>
                        <p className="text-sm font-medium text-gray-800">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-800">{prescription.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {prescriptions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No prescriptions available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientChat;
