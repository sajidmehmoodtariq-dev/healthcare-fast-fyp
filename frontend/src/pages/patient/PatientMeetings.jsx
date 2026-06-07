import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const APP_ID = import.meta.env.VITE_8X8_APP_ID || 'YOUR_APP_ID';
const JOIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes before/after

const STATUS_STYLES = {
  pending:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  label: 'Pending' },
  accepted: { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   label: 'Accepted' },
  rejected: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Declined' },
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function isJoinable(scheduledDate, scheduledTime) {
  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
  const now = Date.now();
  const diff = now - scheduledAt.getTime();
  return diff >= -JOIN_WINDOW_MS && diff <= 60 * 60 * 1000;
}

function minutesUntilJoinable(scheduledDate, scheduledTime) {
  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
  const diff = scheduledAt.getTime() - Date.now() - JOIN_WINDOW_MS;
  return diff > 0 ? Math.ceil(diff / 60000) : 0;
}

const PatientMeetings = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('requests');          // 'requests' | 'schedule'
  const [doctors, setDoctors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Schedule modal state
  const [modalDoctor, setModalDoctor] = useState(null);
  const [form, setForm] = useState({ doctorId: '', scheduledDate: '', scheduledTime: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active call state
  const [activeRoom, setActiveRoom] = useState(null);
  const jitsiRef = useRef(null);
  const containerRef = useRef(null);

  // Tick to re-evaluate joinable state every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [doctorsRes, requestsRes] = await Promise.all([
        api.get('/meetings/eligible-doctors'),
        api.get('/meetings'),
      ]);
      setDoctors(doctorsRes.data.doctors || []);
      setRequests(requestsRes.data.meetingRequests || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ---------- Schedule form ----------
  const openModal = (doctor) => {
    setModalDoctor(doctor);
    setForm({ doctorId: doctor.id || '', scheduledDate: '', scheduledTime: '' });
    setFormError('');
  };

  const closeModal = () => setModalDoctor(null);

  const submitRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.scheduledDate || !form.scheduledTime) {
      setFormError('Please pick a date and time.');
      return;
    }
    // Must be in the future
    const picked = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
    if (picked <= new Date()) {
      setFormError('Please choose a future date and time.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/meetings/request', {
        doctorId: form.doctorId,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
      });
      closeModal();
      await loadData();
      setTab('requests');
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Join meeting ----------
  const loadJitsiScript = () =>
    new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) { resolve(); return; }
      const s = document.createElement('script');
      s.src = `https://8x8.vc/${APP_ID}/external_api.js`;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load meeting SDK'));
      document.head.appendChild(s);
    });

  const joinMeeting = async (request) => {
    try {
      const { data } = await api.get(`/meetings/verify/${request.id}`);
      setActiveRoom({ ...request, roomName: data.roomName });
      await loadJitsiScript();
      setTimeout(() => {
        if (!containerRef.current) return;
        if (jitsiRef.current) jitsiRef.current.dispose();
        jitsiRef.current = new window.JitsiMeetExternalAPI('8x8.vc', {
          roomName: `${APP_ID}/${data.roomName}`,
          parentNode: containerRef.current,
          userInfo: {
            displayName: user?.full_name || user?.fullName || 'Patient',
            email: user?.email || '',
          },
          configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false, disableDeepLinking: true },
          interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false },
        });
        jitsiRef.current.addEventListener('readyToClose', leaveMeeting);
      }, 100);
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot join meeting yet.');
    }
  };

  const leaveMeeting = () => {
    if (jitsiRef.current) { jitsiRef.current.dispose(); jitsiRef.current = null; }
    setActiveRoom(null);
  };

  // ---------- Full-screen call overlay ----------
  if (activeRoom) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-800 text-white shrink-0">
          <div>
            <p className="font-semibold text-sm">
              Video meeting with Dr. {activeRoom.doctor?.full_name}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(activeRoom.scheduled_date)} · {formatTime(activeRoom.scheduled_time)}
            </p>
          </div>
          <button onClick={leaveMeeting} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
            Leave
          </button>
        </div>
        <div ref={containerRef} className="flex-1 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Video Meetings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Request a video consultation with your doctor. Meetings can only be joined at the scheduled time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['requests', 'schedule'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'requests' ? 'My Requests' : 'Schedule Meeting'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between items-start">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
        </div>
      ) : tab === 'schedule' ? (
        /* ---- Schedule Meeting tab ---- */
        doctors.length === 0 ? (
          <EmptyState
            title="No Connected Doctors"
            message="You need an approved appointment with a doctor before you can request a video meeting."
          />
        ) : (
          <div className="space-y-3">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar name={doc.full_name} color="teal" />
                  <div>
                    <p className="font-semibold text-gray-800">Dr. {doc.full_name}</p>
                    {doc.specialization && <p className="text-xs text-teal-600">{doc.specialization}</p>}
                  </div>
                </div>
                <button
                  onClick={() => openModal(doc)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shrink-0"
                >
                  <VideoIcon />
                  Request Meeting
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ---- My Requests tab ---- */
        requests.length === 0 ? (
          <EmptyState
            title="No Meeting Requests"
            message="Switch to 'Schedule Meeting' to request a video consultation with one of your doctors."
          />
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const s = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
              const joinable = req.status === 'accepted' && isJoinable(req.scheduled_date, req.scheduled_time);
              const minsLeft = req.status === 'accepted' ? minutesUntilJoinable(req.scheduled_date, req.scheduled_time) : 0;

              return (
                <div key={req.id} className={`rounded-2xl border p-5 ${s.bg} ${s.border}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <Avatar name={req.doctor?.full_name} color="teal" />
                      <div>
                        <p className="font-semibold text-gray-800">Dr. {req.doctor?.full_name}</p>
                        {req.doctor?.specialization && (
                          <p className="text-xs text-teal-600">{req.doctor.specialization}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(req.scheduled_date)} · {formatTime(req.scheduled_time)}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.text} ${s.bg} border ${s.border}`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {req.status === 'rejected' && req.rejection_reason && (
                    <p className="mt-3 text-sm text-red-600 bg-white rounded-lg px-3 py-2">
                      Reason: {req.rejection_reason}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    {req.status === 'accepted' && (
                      joinable ? (
                        <button
                          onClick={() => joinMeeting(req)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                          <VideoIcon />
                          Join Meeting
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {minsLeft > 0
                            ? `Available to join in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}`
                            : 'This meeting has ended'}
                        </p>
                      )
                    )}

                    {req.status === 'rejected' && (
                      <button
                        onClick={() => {
                          openModal(req.doctor);
                          setTab('schedule');
                        }}
                        className="px-4 py-2 bg-white border border-teal-300 text-teal-600 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
                      >
                        Request Again
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Schedule modal */}
      {modalDoctor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Request Meeting with Dr. {modalDoctor.full_name}
            </h3>
            <p className="text-sm text-gray-500 mb-5">Choose a date and time for the video consultation.</p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.scheduledDate}
                  onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={form.scheduledTime}
                  onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* -- Shared small components -- */

const Avatar = ({ name, color }) => {
  const colors = { teal: 'bg-teal-100 text-teal-600', cyan: 'bg-cyan-100 text-cyan-600' };
  return (
    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${colors[color] || colors.teal}`}>
      <span className="font-bold text-lg">{(name || '?')[0].toUpperCase()}</span>
    </div>
  );
};

const VideoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const EmptyState = ({ title, message }) => (
  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <VideoIcon />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm max-w-xs mx-auto">{message}</p>
  </div>
);

export default PatientMeetings;
