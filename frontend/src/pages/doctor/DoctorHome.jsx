import React from 'react';

const DoctorHome = ({ user, onNavigate }) => {
  const todayAppointments = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      age: 45,
      time: '10:00 AM',
      type: 'Follow-up',
      avatar: '👩'
    },
    {
      id: 2,
      patient: 'Michael Chen',
      age: 32,
      time: '11:30 AM',
      type: 'New Consultation',
      avatar: '👨'
    },
    {
      id: 3,
      patient: 'Emily Davis',
      age: 28,
      time: '2:00 PM',
      type: 'Check-up',
      avatar: '👩‍🦰'
    }
  ];

  const stats = [
    { label: 'Total Patients', value: '142', icon: '👥', color: 'from-blue-400 to-blue-500' },
    { label: 'Today\'s Appointments', value: '8', icon: '📅', color: 'from-teal-400 to-cyan-500' },
    { label: 'Pending Reviews', value: '5', icon: '⏰', color: 'from-orange-400 to-orange-500' },
  ];

  return (
    <div className="pb-20 lg:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 md:p-8 text-white mb-6">
        <p className="text-sm md:text-base opacity-90 mb-2">Welcome back,</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
          Dr. {user?.full_name || user?.fullName || 'Doctor'}
        </h1>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button 
            onClick={() => onNavigate('patients')}
            className="bg-white text-teal-500 font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm md:text-base">Patients</span>
          </button>
          <button 
            onClick={() => onNavigate('chat')}
            className="bg-white text-teal-500 font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm md:text-base">Messages</span>
          </button>
        </div>

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Today's Appointments</h2>
          <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="space-y-3">
          {todayAppointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl md:text-3xl shrink-0">
                {apt.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">{apt.patient}</h3>
                <p className="text-xs md:text-sm text-gray-500">{apt.age} years • {apt.type}</p>
                <p className="text-xs md:text-sm text-teal-500 font-medium mt-1">{apt.time}</p>
              </div>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0">
            💡
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Daily Reminder</h3>
            <p className="text-sm text-gray-600">Don't forget to review pending patient prescriptions and respond to messages before end of day.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
