import React, { useState } from 'react';

const DoctorPatients = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const patients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 45,
      gender: 'Female',
      lastVisit: 'Dec 2, 2025',
      status: 'active',
      condition: 'Hypertension',
      avatar: '👩'
    },
    {
      id: 2,
      name: 'Michael Chen',
      age: 32,
      gender: 'Male',
      lastVisit: 'Dec 1, 2025',
      status: 'active',
      condition: 'Diabetes Type 2',
      avatar: '👨'
    },
    {
      id: 3,
      name: 'Emily Davis',
      age: 28,
      gender: 'Female',
      lastVisit: 'Nov 28, 2025',
      status: 'follow-up',
      condition: 'Asthma',
      avatar: '👩‍🦰'
    },
    {
      id: 4,
      name: 'Robert Wilson',
      age: 56,
      gender: 'Male',
      lastVisit: 'Nov 25, 2025',
      status: 'active',
      condition: 'Arthritis',
      avatar: '👨‍🦳'
    },
    {
      id: 5,
      name: 'Jennifer Martinez',
      age: 39,
      gender: 'Female',
      lastVisit: 'Nov 22, 2025',
      status: 'follow-up',
      condition: 'Migraine',
      avatar: '👩‍🦱'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 text-white mb-6">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors inline-flex lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">My Patients</h1>
        <p className="text-sm md:text-base opacity-90">Total: {patients.length} patients</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search patients by name or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'active'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('follow-up')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'follow-up'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Follow-up
          </button>
        </div>
      </div>

      {/* Patients List */}
      <div className="space-y-3">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {patient.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{patient.name}</h3>
                    <p className="text-sm text-gray-500">{patient.age} years • {patient.gender}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    patient.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {patient.status === 'active' ? 'Active' : 'Follow-up'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm text-gray-600">{patient.condition}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Last visit: {patient.lastVisit}</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors">
                    View Records
                  </button>
                  <button 
                    onClick={() => onNavigate('chat')}
                    className="px-4 py-2 border border-teal-500 text-teal-500 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No patients found</p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
