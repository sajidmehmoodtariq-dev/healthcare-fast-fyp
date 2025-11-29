import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isApproved = user?.approval_status === 'approved' || user?.approvalStatus === 'approved';
  const isPending = user?.approval_status === 'pending' || user?.approvalStatus === 'pending';
  const isRejected = user?.approval_status === 'rejected' || user?.approvalStatus === 'rejected';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-teal-500">
              Physician Assistant
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
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
              <svg
                className="w-12 h-12 text-yellow-500 mr-4 shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-yellow-800 mb-2">Account Pending Approval</h2>
                <p className="text-yellow-700">
                  Your account is currently under review by our admin team. You will be notified once your account is approved.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Admin will review your credentials and documents</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verification typically takes 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You will receive an email notification once approved</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Once approved, you'll have full access to all features</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Rejected State */}
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex items-start mb-4">
              <svg
                className="w-12 h-12 text-red-500 mr-4 shrink-0"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-red-800 mb-2">Account Rejected</h2>
                <p className="text-red-700">
                  Unfortunately, your account could not be approved at this time.
                </p>
                {(user?.rejection_reason || user?.rejectionReason) && (
                  <p className="text-red-600 mt-2 font-medium">
                    Reason: {user?.rejection_reason || user?.rejectionReason}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600">
                Please contact our support team if you believe this was a mistake or if you have any questions.
              </p>
            </div>
          </div>
        )}

        {/* Approved State - Full Access */}
        {isApproved && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <svg
                className="w-12 h-12 text-green-500 mr-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Hello Doctor</h2>
                <p className="text-gray-600 mt-1">Welcome, Dr. {user?.fullName || user?.full_name}! Your account is active and approved.</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="font-semibold text-teal-800 mb-2">Patients</h3>
                <p className="text-3xl font-bold text-teal-600">0</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Appointments</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Consultations</h3>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
                {(user?.phoneNumber || user?.phone_number) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-800">{user?.phoneNumber || user?.phone_number}</p>
                  </div>
                )}
                {user?.specialization && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Specialization</p>
                    <p className="font-medium text-gray-800">{user.specialization}</p>
                  </div>
                )}
                {user?.experience && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium text-gray-800">{user.experience} years</p>
                  </div>
                )}
                {(user?.licenseNumber || user?.license_number) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="font-medium text-gray-800">{user?.licenseNumber || user?.license_number}</p>
                  </div>
                )}
                {user?.cnic && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">CNIC</p>
                    <p className="font-medium text-gray-800">{user.cnic}</p>
                  </div>
                )}
                {(user?.clinicAddress || user?.clinic_address) && (
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600">Previous Clinic/Hospital Address</p>
                    <p className="font-medium text-gray-800">{user?.clinicAddress || user?.clinic_address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
