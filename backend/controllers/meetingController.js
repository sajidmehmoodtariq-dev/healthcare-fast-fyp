import { supabase } from '../config/supabase.js';
import { logActivity, getIp } from '../utils/activityLogger.js';

// Both roles: get meetings (which are just approved appointments) relevant to the current user
export const getMeetingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        patient:users!appointments_patient_id_fkey(id, full_name, email),
        doctor:users!appointments_doctor_id_fkey(id, full_name, specialization, email)
      `)
      .eq('status', 'approved')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (userRole === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (userRole === 'doctor') {
      query = query.eq('doctor_id', userId);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: appointments, error } = await query;
    if (error) throw new Error(error.message);

    // Map to expected format
    const meetings = (appointments || []).map(apt => ({
      id: apt.id,
      scheduled_date: apt.appointment_date,
      scheduled_time: apt.appointment_time,
      patient: apt.patient,
      doctor: apt.doctor,
      status: 'accepted',
      room_name: `healthcare-mtg-${apt.id}`,
    }));

    res.status(200).json({ meetingRequests: meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Both roles: verify meeting can be joined (approved appointment + within ±15 min window)
export const verifyMeetingAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
      .single();

    if (error || !appointment) {
      return res.status(403).json({ error: 'Meeting not found or not approved' });
    }

    // Check time window: allow ±15 minutes around scheduled time
    const now = new Date();
    const scheduledAt = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
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

    res.status(200).json({ allowed: true, roomName: `healthcare-mtg-${appointment.id}` });
  } catch (error) {
    console.error('Verify meeting access error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
