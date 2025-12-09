import React, { useState } from 'react';

const PatientDoctors = ({ onNavigate }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      rating: 4.9,
      fee: 150,
      location: 'New York Medical Center',
      avatar: '👩‍⚕️'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      rating: 4.8,
      fee: 180,
      location: 'Manhattan Heart Institute',
      avatar: '👨‍⚕️'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Cardiologist',
      rating: 4.7,
      fee: 160,
      location: 'Brooklyn Health Center',
      avatar: '👩‍⚕️'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'General Physician',
      rating: 4.6,
      fee: 120,
      location: 'Queens Medical Plaza',
      avatar: '👨‍⚕️'
    }
  ];

  const dates = [
    { day: 'Mon', date: 25 },
    { day: 'Tue', date: 26 },
    { day: 'Wed', date: 27 },
    { day: 'Thu', date: 28 },
    { day: 'Fri', date: 29 }
  ];

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleConfirmAppointment = () => {
    if (selectedDate && selectedTime) {
      alert(`Appointment confirmed with ${selectedDoctor.name} on ${selectedDate.day} ${selectedDate.date} at ${selectedTime}`);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      onNavigate('home');
    }
  };

  const filteredDoctors = selectedSpecialty === 'All Specialties' 
    ? doctors 
    : doctors.filter(doc => doc.specialty === selectedSpecialty);

  return (
    <div className="pb-20 lg:pb-8 max-w-full overflow-x-hidden">
      {/* Search and Filters */}
      <div className="bg-linear-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 mb-6">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors text-white inline-flex lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Find Doctors</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search doctors..."
            className="w-full px-4 py-3 md:py-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
          />
          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Specialty Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        {['All Specialties', 'Cardiology', 'General Physician'].map(specialty => (
          <button
            key={specialty}
            onClick={() => setSelectedSpecialty(specialty)}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium whitespace-nowrap transition-colors text-sm md:text-base shrink-0 ${
              selectedSpecialty === specialty
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {specialty}
          </button>
        ))}
      </div>

      {/* Doctors Count */}
      <p className="text-sm md:text-base text-gray-600 mb-4">{filteredDoctors.length} doctors available</p>

      {/* Doctors List */}
      <div className="space-y-4 max-w-full">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-linear-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center text-2xl md:text-4xl shrink-0">
                {doctor.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg text-gray-800 mb-1 wrap-break-words">{doctor.name}</h3>
                <p className="text-sm md:text-base text-teal-500 mb-2">{doctor.specialty}</p>
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-medium">{doctor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💵</span>
                    <span className="font-medium">PKR {doctor.fee}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1 mt-2 text-xs md:text-sm text-gray-500">
                  <svg className="w-3 h-3 md:w-4 md:h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="wrap-break-words">{doctor.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleBookAppointment(doctor)}
              className="w-full bg-linear-to-r from-teal-400 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all text-sm md:text-base"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4 overflow-y-auto">
          <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto my-auto">
            {/* Header */}
            <div className="bg-linear-to-br from-teal-400 to-cyan-500 text-white p-5 md:p-6 md:rounded-t-3xl rounded-t-3xl sticky top-0 z-10">
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="mb-3 md:mb-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors inline-flex"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl md:text-3xl font-bold">Book Appointment</h2>
            </div>

            <div className="p-5 md:p-6">
              {/* Doctor Info */}
              <div className="flex items-start gap-3 md:gap-4 mb-6 pb-6 border-b">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-linear-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center text-2xl md:text-4xl shrink-0">
                  {selectedDoctor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base md:text-xl text-gray-800 warp-break-words">{selectedDoctor.name}</h3>
                  <p className="text-teal-500 text-sm md:text-base">{selectedDoctor.specialty}</p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      {selectedDoctor.rating}
                    </span>
                    <span className="flex items-start gap-1">
                      <svg className="w-3 h-3 md:w-4 md:h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="warp-break-words">{selectedDoctor.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-bold text-gray-800 text-sm md:text-lg">Select Date</h3>
                </div>
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
                  {dates.map((date, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`shrink-0 w-14 md:w-20 py-2 md:py-4 rounded-xl border-2 transition-all ${
                        selectedDate?.date === date.date
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="text-xs md:text-sm text-gray-500">{date.day}</div>
                      <div className="text-base md:text-xl font-bold text-gray-800">{date.date}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-bold text-gray-800 text-sm md:text-lg">Select Time</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 md:py-3 rounded-xl border-2 font-medium transition-all text-xs md:text-base ${
                        selectedTime === time
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Fee */}
              <div className="bg-teal-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-teal-700">
                    <span className="text-xl md:text-3xl shrink-0">💵</span>
                    <span className="font-medium text-xs md:text-base">Consultation Fee</span>
                  </div>
                  <span className="text-xl md:text-3xl font-bold text-teal-600 shrink-0">PKR {selectedDoctor.fee}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmAppointment}
                disabled={!selectedDate || !selectedTime}
                className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg transition-all ${
                  selectedDate && selectedTime
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
