import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://healthcare-fast-fyp.vercel.app/api';

const PatientAppointments = ({ onNavigate }) => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Booking form data
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/appointments/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data.doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/appointments/patient`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/appointments/book`,
        {
          doctorId: selectedDoctor.id,
          appointmentDate,
          appointmentTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Appointment booked! Please upload payment screenshot within 3 days.');
      setShowBookingModal(false);
      fetchAppointments();
      setAppointmentDate('');
      setAppointmentTime('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadScreenshot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('appointmentId', selectedAppointment.id);
      formData.append('screenshot', paymentScreenshot);

      await axios.post(
        `${API_URL}/appointments/upload-screenshot`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Payment screenshot uploaded successfully!');
      setShowUploadModal(false);
      setPaymentScreenshot(null);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload screenshot');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Book Appointments</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Approved Doctors List */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg text-gray-800">{doctor.full_name}</h3>
              <p className="text-sm text-teal-600 mb-2">{doctor.specialization}</p>
              <p className="text-sm text-gray-600 mb-1">Experience: {doctor.experience} years</p>
              <p className="text-sm text-gray-600 mb-3">Fee: PKR {doctor.consultation_fee}</p>
              <button
                onClick={() => onNavigate('doctors')}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg transition-colors"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Appointments */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">My Appointments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{appointment.doctor.full_name}</p>
                      <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(appointment.appointment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{appointment.appointment_time}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">PKR {appointment.doctor.consultation_fee}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {appointment.status === 'pending' && !appointment.payment_screenshot_url && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowUploadModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Upload Payment
                      </button>
                    )}
                    {appointment.payment_screenshot_url && appointment.status === 'pending' && (
                      <span className="text-yellow-600 text-sm">Pending Approval</span>
                    )}
                    {appointment.status === 'approved' && (
                      <span className="text-green-600 text-sm">Confirmed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Book Appointment</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-teal-50 rounded-lg">
              <p className="font-semibold text-gray-800">{selectedDoctor?.full_name}</p>
              <p className="text-sm text-teal-600">{selectedDoctor?.specialization}</p>
              <p className="text-sm text-gray-600 mt-2">Consultation Fee: PKR {selectedDoctor?.consultation_fee}</p>
            </div>

            <form onSubmit={handleBookAppointment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={getTodayDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please upload payment screenshot within 3 days, or this appointment will expire.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Screenshot Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Upload Payment Screenshot</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Doctor: <span className="font-semibold">{selectedAppointment?.doctor.full_name}</span></p>
              <p className="text-sm text-gray-600">Date: {new Date(selectedAppointment?.appointment_date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Time: {selectedAppointment?.appointment_time}</p>
              <p className="text-sm text-gray-600">Fee: PKR {selectedAppointment?.doctor.consultation_fee}</p>
            </div>

            <form onSubmit={handleUploadScreenshot}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload a screenshot of your payment to the doctor</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
