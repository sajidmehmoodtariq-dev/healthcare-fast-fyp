import { supabase } from '../config/supabase.js';
import crypto from 'crypto';
import { logActivity, getIp } from '../utils/activityLogger.js';

// Patient: get doctors they share an approved appointment with (eligible to request meetings)
export const getEligibleDoctors = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('doctor_id, doctor:users!appointments_doctor_id_fkey(id, full_name, specialization, email)')
      .eq('patient_id', patientId)
      .eq('status', 'approved');

    if (error) throw new Error(error.message);

    // Deduplicate by doctor_id
    const seen = new Set();
    const doctors = [];
    for (const apt of appointments) {
      if (!seen.has(apt.doctor_id)) {
        seen.add(apt.doctor_id);
        doctors.push({ ...apt.doctor, appointmentId: apt.id });
      }
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error('Get eligible doctors error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Patient: create a meeting request with a doctor
export const createMeetingRequest = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can request meetings' });
    }

    const patientId = req.user.id;
    const { doctorId, scheduledDate, scheduledTime } = req.body;

    if (!doctorId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ error: 'doctorId, scheduledDate and scheduledTime are required' });
    }

    // Find the approved appointment between this patient and doctor
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id, status')
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId)
      .eq('status', 'approved')
      .limit(1)
      .single();

    if (aptError || !appointment) {
      return res.status(403).json({ error: 'No approved appointment found with this doctor' });
    }

    // Block duplicate pending/accepted requests for the same slot
    const { data: existing } = await supabase
      .from('meeting_requests')
      .select('id, status')
      .eq('appointment_id', appointment.id)
      .eq('scheduled_date', scheduledDate)
      .eq('scheduled_time', scheduledTime)
      .in('status', ['pending', 'accepted']);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'A meeting request already exists for this date and time' });
    }

    const roomName = `healthcare-mtg-${crypto.randomUUID()}`;

    const { data: newRequest, error: insertError } = await supabase
      .from('meeting_requests')
      .insert([{
        appointment_id: appointment.id,
        patient_id: patientId,
        doctor_id: appointment.doctor_id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: 'pending',
        room_name: roomName,
      }])
      .select(`
        *,
        patient:users!meeting_requests_patient_id_fkey(id, full_name, email),
        doctor:users!meeting_requests_doctor_id_fkey(id, full_name, specialization, email)
      `)
      .single();

    if (insertError) throw new Error(insertError.message);

    // Notify the doctor
    await supabase.from('notifications').insert([{
      user_id: appointment.doctor_id,
      type: 'appointment',
      title: 'New Meeting Request',
      message: `${req.user.full_name || 'A patient'} has requested a video meeting on ${scheduledDate} at ${formatTime(scheduledTime)}.`,
      related_id: newRequest.id,
    }]);

    logActivity({
      userId: patientId, userName: req.user.full_name, userRole: 'patient',
      action: 'meeting_requested', entityType: 'meeting_request', entityId: newRequest.id,
      description: `${req.user.full_name || 'Patient'} requested a meeting on ${scheduledDate} at ${formatTime(scheduledTime)}`,
      ipAddress: getIp(req),
    });

    res.status(201).json({ message: 'Meeting request sent', meetingRequest: newRequest });
  } catch (error) {
    console.error('Create meeting request error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Both roles: get meeting requests relevant to the current user
export const getMeetingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('meeting_requests')
      .select(`
        *,
        patient:users!meeting_requests_patient_id_fkey(id, full_name, email),
        doctor:users!meeting_requests_doctor_id_fkey(id, full_name, specialization, email)
      `)
      .order('created_at', { ascending: false });

    if (userRole === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (userRole === 'doctor') {
      query = query.eq('doctor_id', userId);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: requests, error } = await query;
    if (error) throw new Error(error.message);

    res.status(200).json({ meetingRequests: requests || [] });
  } catch (error) {
    console.error('Get meeting requests error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Doctor: accept or reject a meeting request
export const respondToMeeting = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can respond to meeting requests' });
    }

    const doctorId = req.user.id;
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: "action must be 'accept' or 'reject'" });
    }

    // Verify this request belongs to this doctor and is still pending
    const { data: request, error: fetchError } = await supabase
      .from('meeting_requests')
      .select('*')
      .eq('id', id)
      .eq('doctor_id', doctorId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Pending meeting request not found' });
    }

    const updates = {
      status: action === 'accept' ? 'accepted' : 'rejected',
      updated_at: new Date().toISOString(),
    };
    if (action === 'reject' && rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }

    const { data: updated, error: updateError } = await supabase
      .from('meeting_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // Notify the patient
    const doctorName = req.user.full_name || 'Your doctor';
    const timeStr = formatTime(request.scheduled_time);
    const notifMessage = action === 'accept'
      ? `Dr. ${doctorName} accepted your meeting request for ${request.scheduled_date} at ${timeStr}.`
      : `Dr. ${doctorName} declined your meeting request for ${request.scheduled_date} at ${timeStr}.${rejectionReason ? ' Reason: ' + rejectionReason : ''}`;

    await supabase.from('notifications').insert([{
      user_id: request.patient_id,
      type: 'appointment',
      title: action === 'accept' ? 'Meeting Accepted' : 'Meeting Declined',
      message: notifMessage,
      related_id: request.id,
    }]);

    logActivity({
      userId: doctorId, userName: req.user.full_name, userRole: 'doctor',
      action: action === 'accept' ? 'meeting_accepted' : 'meeting_rejected',
      entityType: 'meeting_request', entityId: parseInt(id),
      description: `Dr. ${req.user.full_name} ${action}ed meeting request #${id} for ${request.scheduled_date} at ${formatTime(request.scheduled_time)}`,
      ipAddress: getIp(req),
    });

    res.status(200).json({ message: `Meeting request ${action}ed`, meetingRequest: updated });
  } catch (error) {
    console.error('Respond to meeting error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Both roles: verify meeting can be joined (accepted + within ±15 min window)
export const verifyMeetingAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: request, error } = await supabase
      .from('meeting_requests')
      .select('*')
      .eq('id', id)
      .eq('status', 'accepted')
      .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
      .single();

    if (error || !request) {
      return res.status(403).json({ error: 'Meeting not found or not accepted' });
    }

    // Check time window: allow ±15 minutes around scheduled time
    const now = new Date();
    const scheduledAt = new Date(`${request.scheduled_date}T${request.scheduled_time}`);
    const diffMin = (now - scheduledAt) / 60000;

    if (diffMin < -15) {
      const minutesUntil = Math.ceil(-diffMin);
      return res.status(403).json({
        error: `Meeting starts in ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'}. You can join 15 minutes before.`,
        minutesUntil,
      });
    }

    if (diffMin > 60) {
      return res.status(403).json({ error: 'This meeting time has passed.' });
    }

    res.status(200).json({ allowed: true, roomName: request.room_name });
  } catch (error) {
    console.error('Verify meeting access error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}
