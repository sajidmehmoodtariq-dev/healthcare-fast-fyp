import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const APP_ID = import.meta.env.VITE_8X8_APP_ID || 'YOUR_APP_ID';
const JOIN_WINDOW_MS = 15 * 60 * 1000;

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
  const diff = Date.now() - scheduledAt.getTime();
  return diff >= -JOIN_WINDOW_MS && diff <= 60 * 60 * 1000;
}

function minutesUntilJoinable(scheduledDate, scheduledTime) {
  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
  const diff = scheduledAt.getTime() - Date.now() - JOIN_WINDOW_MS;
  return diff > 0 ? Math.ceil(diff / 60000) : 0;
}

const DoctorMeetings = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [responding, setResponding] = useState(false);

  // Active call state
  const [activeRoom, setActiveRoom] = useState(null);
  const jitsiRef = useRef(null);
  const containerRef = useRef(null);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/meetings');
      setRequests(data.meetingRequests || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load meeting requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const pending  = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');
  const history  = requests.filter(r => r.status === 'rejected');

  // ---------- Accept ----------
  const accept = async (req) => {
    setResponding(true);
    try {
      await api.put(`/meetings/${req.id}/respond`, { action: 'accept' });
      await loadRequests();
      setTab('accepted');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept');
    } finally {
      setResponding(false);
    }
  };

  // ---------- Reject ----------
  const openRejectModal = (req) => { setRejectTarget(req); setRejectReason(''); };
  const closeRejectModal = () => setRejectTarget(null);

  const confirmReject = async () => {
    setResponding(true);
    try {
      await api.put(`/meetings/${rejectTarget.id}/respond`, {
        action: 'reject',
        rejectionReason: rejectReason.trim() || undefined,
      });
      closeRejectModal();
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject');
    } finally {
      setResponding(false);
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
            displayName: `Dr. ${user?.full_name || user?.fullName || 'Doctor'}`,
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
            <p className="font-semibold text-sm">Meeting with {activeRoom.patient?.full_name}</p>
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

  const TABS = [
    { key: 'pending',  label: 'Pending',  count: pending.length },
    { key: 'accepted', label: 'Upcoming', count: accepted.length },
    { key: 'history',  label: 'History',  count: history.length },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Video Meetings</h2>
        <p className="text-sm text-gray-500 mt-1">Review patient meeting requests and join at the scheduled time.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-linear-to-r from-teal-400 to-cyan-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                tab === t.key ? 'bg-white/30 text-white' : 'bg-teal-100 text-teal-700'
              }`}>
                {t.count}
              </span>
            )}
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
      ) : (
        <>
          {/* Pending tab */}
          {tab === 'pending' && (
            pending.length === 0 ? (
              <EmptyState title="No Pending Requests" message="New meeting requests from patients will appear here." />
            ) : (
              <div className="space-y-4">
                {pending.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar name={req.patient?.full_name} color="cyan" />
                      <div>
                        <p className="font-semibold text-gray-800">{req.patient?.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(req.scheduled_date)} · {formatTime(req.scheduled_time)}
                        </p>
                      </div>
                      <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                        Pending
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => accept(req)}
                        disabled={responding}
                        className="flex-1 py-2.5 bg-linear-to-r from-teal-400 to-cyan-500 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => openRejectModal(req)}
                        disabled={responding}
                        className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Upcoming/Accepted tab */}
          {tab === 'accepted' && (
            accepted.length === 0 ? (
              <EmptyState title="No Upcoming Meetings" message="Accepted meetings will appear here with a join button when the time arrives." />
            ) : (
              <div className="space-y-4">
                {accepted.map(req => {
                  const joinable = isJoinable(req.scheduled_date, req.scheduled_time);
                  const minsLeft = minutesUntilJoinable(req.scheduled_date, req.scheduled_time);
                  return (
                    <div key={req.id} className="bg-green-50 border border-green-200 rounded-2xl p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar name={req.patient?.full_name} color="cyan" />
                        <div>
                          <p className="font-semibold text-gray-800">{req.patient?.full_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(req.scheduled_date)} · {formatTime(req.scheduled_time)}
                          </p>
                        </div>
                        <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                          Accepted
                        </span>
                      </div>
                      {joinable ? (
                        <button
                          onClick={() => joinMeeting(req)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-teal-400 to-cyan-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <VideoIcon />
                          Join Meeting
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          {minsLeft > 0
                            ? `Available in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}`
                            : 'This meeting has ended'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* History tab */}
          {tab === 'history' && (
            history.length === 0 ? (
              <EmptyState title="No History" message="Declined meeting requests will appear here." />
            ) : (
              <div className="space-y-3">
                {history.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={req.patient?.full_name} color="cyan" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{req.patient?.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(req.scheduled_date)} · {formatTime(req.scheduled_time)}
                        </p>
                        {req.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1">Reason: {req.rejection_reason}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 shrink-0">
                        Declined
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Decline Meeting Request</h3>
            <p className="text-sm text-gray-500 mb-4">
              Declining meeting with {rejectTarget.patient?.full_name} on {formatDate(rejectTarget.scheduled_date)} at {formatTime(rejectTarget.scheduled_time)}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Not available at that time, please pick another slot."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                disabled={responding}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {responding ? 'Declining…' : 'Decline Request'}
              </button>
              <button
                onClick={closeRejectModal}
                disabled={responding}
                className="px-5 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default DoctorMeetings;
