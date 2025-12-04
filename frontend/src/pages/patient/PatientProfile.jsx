import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phone_number || user?.phoneNumber || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bloodType: user?.blood_type || 'O+',
    height: user?.height || '',
    weight: user?.weight || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for name fields - only letters and spaces
    if (name === 'fullName') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Save profile changes to backend
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const medicalHistory = [
    { condition: 'Mild Hypertension', year: '2024' },
    { condition: 'Seasonal Allergies', year: '2022' }
  ];

  return (
    <div className="pb-20 lg:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 mb-6 text-white">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors inline-flex lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {(formData.fullName || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{formData.fullName || 'User'}</h2>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Email</p>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.email}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Phone</p>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.phoneNumber || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Age</p>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{formData.age || '-'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Gender</p>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-800">{formData.gender || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Health Information */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Health Information</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Blood Type</p>
            <p className="text-lg font-bold text-gray-800">{formData.bloodType}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Height</p>
            <p className="text-lg font-bold text-gray-800">{formData.height || '-'}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Weight</p>
            <p className="text-lg font-bold text-gray-800">{formData.weight || '-'}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Medical History</p>
          {medicalHistory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <p className="text-sm text-gray-800">{item.condition}</p>
              <span className="text-xs text-gray-500">{item.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-3xl p-4 mb-6 shadow-sm border border-gray-100 space-y-2">
        <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-800">Medical Records</p>
            <p className="text-xs text-gray-500">View your health history</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-800">Settings</p>
            <p className="text-xs text-gray-500">App preferences and privacy</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-800">Help & Support</p>
            <p className="text-xs text-gray-500">Get help and contact us</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full bg-white border-2 border-red-500 text-red-500 font-semibold py-4 rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">Physician Assistant v1.0.0</p>
    </div>
  );
};

export default PatientProfile;
