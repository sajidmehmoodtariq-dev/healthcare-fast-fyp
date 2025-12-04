import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phone_number || user?.phoneNumber || '',
    age: user?.age || '',
    gender: user?.gender || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    licenseNumber: user?.license_number || user?.licenseNumber || '',
    clinicAddress: user?.clinic_address || user?.clinicAddress || '',
    consultationFee: user?.consultation_fee || user?.consultationFee || ''
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
    
    // Validation for age - minimum 20 for doctors
    if (name === 'age') {
      const ageValue = parseInt(value);
      if (value && (ageValue < 20 || ageValue > 120)) {
        return; // Don't update if age is less than 20 or more than 120
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
            {(formData.fullName || 'D')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">Dr. {formData.fullName || 'Doctor'}</h2>
            <p className="text-sm text-gray-500">{formData.specialization || 'Physician'}</p>
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
              <p className="text-xs text-gray-500">Phone Number</p>
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

          {/* Age */}
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
                  min="20"
                  max="120"
                  placeholder="Min 20 years"
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.age || 'Not provided'} years</p>
              )}
            </div>
          </div>

          {/* Gender */}
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-gray-800 capitalize">{formData.gender || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Professional Information</h3>
        
        <div className="space-y-4">
          {/* Specialization */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Specialization</p>
              {isEditing ? (
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.specialization || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Experience</p>
              {isEditing ? (
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.experience || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* License Number */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">License Number</p>
              {isEditing ? (
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.licenseNumber || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Clinic Address */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Clinic Address</p>
              {isEditing ? (
                <input
                  type="text"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleInputChange}
                  className="w-full text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                />
              ) : (
                <p className="text-sm font-medium text-gray-800">{formData.clinicAddress || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Consultation Fee */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Consultation Fee</p>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-0 text-sm font-medium text-gray-500">Rs.</span>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-8 text-sm font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-teal-500 outline-none"
                  />
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-800">
                  {formData.consultationFee ? `Rs. ${formData.consultationFee}` : 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
