import React from 'react';

const PatientHome = ({ user, onNavigate }) => {
  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: 'Nov 25, 2025',
      time: '10:00 AM',
      avatar: '👩‍⚕️'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'General Physician',
      date: 'Nov 28, 2025',
      time: '2:30 PM',
      avatar: '👨‍⚕️'
    }
  ];

  const healthTips = [
    'Drink at least 8 glasses of water daily',
    'Get 7-8 hours of sleep for optimal health',
    'Take a 30-minute walk every day'
  ];

  return (
    <div className="pb-20 lg:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 md:p-8 text-white mb-6">
        <p className="text-sm md:text-base opacity-90 mb-2">Welcome back,</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
          Hello, {user?.full_name || user?.fullName || 'Sajid Mehmood Tariq'}
        </h1>
        
        {/* Talk to Physician Button */}
        <button 
          onClick={() => onNavigate('chat')}
          className="w-full bg-white text-teal-500 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg mb-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Talk to Physician Assistant</span>
        </button>

        {/* Icon Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('notifications')}
            className="w-14 h-14 bg-white rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center shadow-md"
          >
            <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="w-14 h-14 bg-white rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center shadow-md"
          >
            <svg className="w-6 h-6 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Upcoming Appointments</h2>
          <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl md:text-3xl shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">{apt.doctor}</h3>
                <p className="text-xs md:text-sm text-gray-500">{apt.specialty}</p>
                <p className="text-xs md:text-sm text-teal-500 font-medium mt-1">{apt.date} • {apt.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Tips */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Health Tips</h2>
          <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="bg-teal-50 rounded-2xl p-4 md:p-5 space-y-3">
          {healthTips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
              <p className="text-sm md:text-base text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Last Summary</h2>
          <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 md:w-7 md:h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Cardiology Consultation</h3>
            <p className="text-xs md:text-sm text-gray-500">Generated on Nov 20, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
