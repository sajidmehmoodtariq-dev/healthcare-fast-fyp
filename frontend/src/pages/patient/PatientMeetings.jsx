import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const APP_ID = import.meta.env.VITE_8X8_APP_ID || 'YOUR_APP_ID';
const JOIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes before/after

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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const requestsRes = await api.get('/meetings');
      setRequests(requestsRes.data.meetingRequests || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
          Your video consultations with doctors. Meetings can only be joined near the scheduled appointment time.
        </p>
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
        requests.length === 0 ? (
          <EmptyState
            title="No Upcoming Meetings"
            message="When you have an approved appointment with a doctor, your meeting link will automatically appear here."
          />
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const joinable = isJoinable(req.scheduled_date, req.scheduled_time);
              const minsLeft = minutesUntilJoinable(req.scheduled_date, req.scheduled_time);

              return (
                <div key={req.id} className="rounded-2xl border p-5 bg-green-50 border-green-200">
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
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    {joinable ? (
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
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
