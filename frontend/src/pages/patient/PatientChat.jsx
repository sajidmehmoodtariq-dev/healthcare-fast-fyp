import React, { useState } from 'react';

const PatientChat = ({ onNavigate }) => {
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: "Hello! I'm your Physician Assistant. How can I help you today?", time: '10:30 AM' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

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
      <div className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white p-4 md:p-6 rounded-t-3xl flex items-center gap-3">
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
          <h2 className="font-bold text-base md:text-lg">Physician Assistant</h2>
          <p className="text-xs md:text-sm opacity-90">AI Healthcare Companion</p>
        </div>
      </div>

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
    </div>
  );
};

export default PatientChat;
