import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import DoctorHome from './doctor/DoctorHome';
import DoctorPatients from './doctor/DoctorPatients';
import DoctorChat from './doctor/DoctorChat';
import DoctorProfile from './doctor/DoctorProfile';
import DoctorNotifications from './doctor/DoctorNotifications';

const DoctorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  
  const isApproved = user?.approval_status === 'approved' || user?.approvalStatus === 'approved';
  const isPending = user?.approval_status === 'pending' || user?.approvalStatus === 'pending';
  const isRejected = user?.approval_status === 'rejected' || user?.approvalStatus === 'rejected';

  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.fullName || '',
    phoneNumber: user?.phone_number || user?.phoneNumber || '',
    age: user?.age || '',
    gender: user?.gender || '',
    cnic: user?.cnic || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    licenseNumber: user?.license_number || user?.licenseNumber || '',
    clinicAddress: user?.clinic_address || user?.clinicAddress || '',
    consultationFee: user?.consultation_fee || user?.consultationFee || '',
  });
  const [cnicImage, setCnicImage] = useState(null);
  const [degreeImage, setDegreeImage] = useState(null);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (!isApproved) return null;
    
    switch (activeTab) {
      case 'home':
        return <DoctorHome user={user} onNavigate={setActiveTab} />;
      case 'patients':
        return <DoctorPatients onNavigate={setActiveTab} />;
      case 'chat':
        return <DoctorChat onNavigate={setActiveTab} />;
      case 'notifications':
        return <DoctorNotifications onNavigate={setActiveTab} />;
      case 'profile':
        return <DoctorProfile onNavigate={setActiveTab} />;
      default:
        return <DoctorHome user={user} onNavigate={setActiveTab} />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'cnic') {
        setCnicImage(file);
      } else if (type === 'degree') {
        setDegreeImage(file);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('age', formData.age);
      submitData.append('gender', formData.gender);
      submitData.append('cnic', formData.cnic);
      submitData.append('specialization', formData.specialization);
      submitData.append('experience', formData.experience);
      submitData.append('licenseNumber', formData.licenseNumber);
      submitData.append('clinicAddress', formData.clinicAddress);
      
      if (cnicImage) submitData.append('cnicImage', cnicImage);
      if (degreeImage) submitData.append('degreeImage', degreeImage);

      const response = await api.put('/auth/update-profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user context
      updateUser(response.data.user);
      
      alert('Profile updated successfully! Your account is now pending approval.');
      setShowEditForm(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-teal-500">Physician Assistant</h1>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Pending Approval State */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <div className="flex items-start mb-4">
              <svg className="w-12 h-12 text-yellow-500 mr-4 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-yellow-800 mb-2">Account Pending Approval</h2>
                <p className="text-yellow-700">Your account is currently under review by our admin team. You will be notified once your account is approved.</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Admin will review your credentials and documents</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verification typically takes 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Once approved, you'll have full access to all features</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Rejected State with Edit Form */}
        {isRejected && !showEditForm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex items-start mb-4">
              <svg className="w-12 h-12 text-red-500 mr-4 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-800 mb-2">Account Rejected</h2>
                <p className="text-red-700">Unfortunately, your account application was rejected.</p>
                {(user?.rejection_reason || user?.rejectionReason) && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Rejection Reason:</p>
                    <p className="text-red-600 mt-1">{user?.rejection_reason || user?.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                You can update your information and resubmit your application for approval.
              </p>
              <button
                onClick={() => setShowEditForm(true)}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                Update Profile & Resubmit
              </button>
            </div>
          </div>
        )}

        {/* Edit Form for Rejected Doctors */}
        {isRejected && showEditForm && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Your Profile</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              {/* Full Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* CNIC */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Specialization */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Cardiologist, Neurologist"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Experience and License */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Clinic Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Clinic/Hospital Address</label>
                <textarea
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* File Uploads */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Image (Optional - upload new if updating)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cnic')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree Image (Optional - upload new if updating)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'degree')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update & Resubmit for Approval'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};

const ApprovedDoctorDashboard = ({ user, logout, activeTab, setActiveTab, renderContent }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-lg font-bold bg-linear-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Physician Assistant
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
              activeTab === 'home' 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
              activeTab === 'patients' 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">Patients</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
              activeTab === 'chat' 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="font-medium">Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Profile</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 md:p-6">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-teal-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
            activeTab === 'patients' ? 'text-teal-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs font-medium">Patients</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
            activeTab === 'chat' ? 'text-teal-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-medium">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
            activeTab === 'notifications' ? 'text-teal-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs font-medium">Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-teal-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
};

// Main Component Export
const DoctorDashboardWrapper = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  
  const isApproved = user?.approval_status === 'approved' || user?.approvalStatus === 'approved';
  const isPending = user?.approval_status === 'pending' || user?.approvalStatus === 'pending';
  const isRejected = user?.approval_status === 'rejected' || user?.approvalStatus === 'rejected';

  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.fullName || '',
    phoneNumber: user?.phone_number || user?.phoneNumber || '',
    age: user?.age || '',
    gender: user?.gender || '',
    cnic: user?.cnic || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    licenseNumber: user?.license_number || user?.licenseNumber || '',
    clinicAddress: user?.clinic_address || user?.clinicAddress || '',
    consultationFee: user?.consultation_fee || user?.consultationFee || '',
  });
  const [cnicImage, setCnicImage] = useState(null);
  const [degreeImage, setDegreeImage] = useState(null);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (!isApproved) return null;
    
    switch (activeTab) {
      case 'home':
        return <DoctorHome user={user} onNavigate={setActiveTab} />;
      case 'patients':
        return <DoctorPatients onNavigate={setActiveTab} />;
      case 'chat':
        return <DoctorChat onNavigate={setActiveTab} />;
      case 'notifications':
        return <DoctorNotifications onNavigate={setActiveTab} />;
      case 'profile':
        return <DoctorProfile onNavigate={setActiveTab} />;
      default:
        return <DoctorHome user={user} onNavigate={setActiveTab} />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'cnic') {
        setCnicImage(file);
      } else if (type === 'degree') {
        setDegreeImage(file);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('age', formData.age);
      submitData.append('gender', formData.gender);
      submitData.append('cnic', formData.cnic);
      submitData.append('specialization', formData.specialization);
      submitData.append('experience', formData.experience);
      submitData.append('licenseNumber', formData.licenseNumber);
      submitData.append('clinicAddress', formData.clinicAddress);
      
      if (cnicImage) submitData.append('cnicImage', cnicImage);
      if (degreeImage) submitData.append('degreeImage', degreeImage);

      const response = await api.put('/auth/update-profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user context
      updateUser(response.data.user);
      
      alert('Profile updated successfully! Your account is now pending approval.');
      setShowEditForm(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // If approved, use the new dashboard layout
  if (isApproved) {
    return (
      <ApprovedDoctorDashboard 
        user={user}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderContent={renderContent}
      />
    );
  }

  // Otherwise, use the original approval/rejection flow
  return (
    <DoctorDashboard 
      user={user}
      logout={logout}
      updateUser={updateUser}
      navigate={navigate}
      isApproved={isApproved}
      isPending={isPending}
      isRejected={isRejected}
      showEditForm={showEditForm}
      setShowEditForm={setShowEditForm}
      loading={loading}
      formData={formData}
      handleInputChange={handleInputChange}
      cnicImage={cnicImage}
      degreeImage={degreeImage}
      handleFileChange={handleFileChange}
      error={error}
      handleUpdateProfile={handleUpdateProfile}
    />
  );
};

export default DoctorDashboardWrapper;
