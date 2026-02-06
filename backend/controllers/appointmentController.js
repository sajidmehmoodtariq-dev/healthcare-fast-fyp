import { supabase } from '../config/supabase.js';
import { uploadFileToSupabase } from '../config/supabase.js';

// Get all approved doctors for booking
export const getApprovedDoctors = async (req, res) => {
  try {
    const { data: doctors, error } = await supabase
      .from('users')
      .select('id, full_name, email, specialization, experience, consultation_fee, clinic_address')
      .eq('role', 'doctor')
      .eq('approval_status', 'approved')
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error('Get approved doctors error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get booked time slots for a doctor on a specific date
export const getDoctorBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get all booked slots for this doctor on this date (pending or approved)
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'approved']);

    if (error) {
      throw new Error(error.message);
    }

    // Extract just the time values
    const bookedSlots = appointments.map(apt => apt.appointment_time);

    res.status(200).json({ bookedSlots });
  } catch (error) {
    console.error('Get booked slots error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Doctor, date, and time are required' });
    }

    // Verify patient role
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    // Check if doctor exists and is approved
    const { data: doctor, error: doctorError } = await supabase
      .from('users')
      .select('id, approval_status')
      .eq('id', doctorId)
      .eq('role', 'doctor')
      .single();

    if (doctorError || !doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.approval_status !== 'approved') {
      return res.status(400).json({ error: 'Doctor is not approved' });
    }

    // Check if the time slot is already booked
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .eq('appointment_time', appointmentTime)
      .in('status', ['pending', 'approved'])
      .single();

    if (existingAppointment) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert([{
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: 'pending'
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Get patient and doctor info for notifications
    const { data: patient } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', patientId)
      .single();

    // Create notification for doctor
    await supabase
      .from('notifications')
      .insert([{
        user_id: doctorId,
        type: 'appointment',
        title: 'New Appointment Request',
        message: `${patient?.full_name || 'A patient'} has booked an appointment with you on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}. Waiting for payment confirmation.`,
        related_id: appointment.id
      }]);

    res.status(201).json({
      message: 'Appointment booked successfully. Please upload payment screenshot within 3 days.',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Upload payment screenshot for appointment
export const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;

    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Payment screenshot is required' });
    }

    // Get appointment and verify ownership
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, users!appointments_patient_id_fkey(full_name)')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patient_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (appointment.status === 'expired') {
      return res.status(400).json({ error: 'This appointment has expired. Please book a new one.' });
    }

    // Upload screenshot to Supabase
    const screenshotUrl = await uploadFileToSupabase(req.file, 'payments');

    // Update appointment with screenshot
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        payment_screenshot_url: screenshotUrl,
        screenshot_uploaded_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Get admin users to notify
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    // Create notification for each admin
    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'system',
        title: 'Payment Screenshot Uploaded',
        message: `${appointment.users.full_name} has uploaded payment screenshot for appointment on ${new Date(appointment.appointment_date).toLocaleDateString()}. Please review.`,
        related_id: appointmentId
      }));

      await supabase
        .from('notifications')
        .insert(adminNotifications);
    }

    res.status(200).json({
      message: 'Payment screenshot uploaded successfully. Waiting for admin approval.',
      screenshotUrl
    });
  } catch (error) {
    console.error('Upload payment screenshot error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:users!appointments_doctor_id_fkey(
          full_name,
          specialization,
          email,
          phone_number,
          consultation_fee
        )
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(
          full_name,
          email,
          phone_number,
          age,
          gender
        )
      `)
      .eq('doctor_id', doctorId)
      .eq('status', 'approved')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get all appointments (Admin only)
export const getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all appointments' });
    }

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(
          full_name,
          email,
          phone_number
        ),
        doctor:users!appointments_doctor_id_fkey(
          full_name,
          specialization,
          consultation_fee
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Update appointment status (Admin only)
export const updateAppointmentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update appointment status' });
    }

    const { appointmentId, status, adminNotes } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({ error: 'Appointment ID and status are required' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected.' });
    }

    // Get appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (!appointment.payment_screenshot_url) {
      return res.status(400).json({ error: 'Cannot approve appointment without payment screenshot' });
    }

    // Update status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: status,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Create notification for patient
    if (status === 'approved') {
      // Get doctor info
      const { data: doctor } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', appointment.doctor_id)
        .single();

      await supabase
        .from('notifications')
        .insert([{
          user_id: appointment.patient_id,
          type: 'appointment',
          title: 'Appointment Approved',
          message: `Your appointment with Dr. ${doctor?.full_name || 'doctor'} on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time} has been approved.`,
          related_id: appointmentId
        }]);
    }

    res.status(200).json({
      message: `Appointment ${status} successfully`
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Check and expire appointments without screenshots after 3 days
export const checkExpiredAppointments = async (req, res) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find appointments that are pending without screenshot for more than 3 days
    const { data: expiredAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('status', 'pending')
      .is('payment_screenshot_url', null)
      .lt('created_at', threeDaysAgo.toISOString());

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (expiredAppointments && expiredAppointments.length > 0) {
      const expiredIds = expiredAppointments.map(a => a.id);

      // Update to expired status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .in('id', expiredIds);

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log(`Expired ${expiredAppointments.length} appointments without payment screenshots`);
    }

    res.status(200).json({
      message: `Checked and expired ${expiredAppointments?.length || 0} appointments`
    });
  } catch (error) {
    console.error('Check expired appointments error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Check for upcoming appointments and create reminder notifications
export const checkUpcomingAppointments = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    // Find approved appointments for tomorrow that haven't been notified
    const { data: upcomingAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        doctor:users!appointments_doctor_id_fkey(full_name)
      `)
      .eq('status', 'approved')
      .eq('appointment_date', tomorrowDate);

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (upcomingAppointments && upcomingAppointments.length > 0) {
      // Create notifications for each upcoming appointment
      const notifications = upcomingAppointments.map(apt => ({
        user_id: apt.patient_id,
        type: 'reminder',
        title: 'Upcoming Appointment Reminder',
        message: `You have an appointment with Dr. ${apt.doctor.full_name} tomorrow at ${apt.appointment_time}`,
        related_id: apt.id
      }));

      // Check if notifications already exist to avoid duplicates
      const { data: existingNotifs } = await supabase
        .from('notifications')
        .select('related_id')
        .eq('type', 'reminder')
        .in('related_id', upcomingAppointments.map(a => a.id));

      const existingIds = new Set(existingNotifs?.map(n => n.related_id) || []);
      const newNotifications = notifications.filter(n => !existingIds.has(n.related_id));

      if (newNotifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(newNotifications);

        if (insertError) {
          throw new Error(insertError.message);
        }

        console.log(`Created ${newNotifications.length} appointment reminder notifications`);
      }
    }

    res.status(200).json({
      message: `Checked ${upcomingAppointments?.length || 0} upcoming appointments, created ${upcomingAppointments?.length || 0} reminders`
    });
  } catch (error) {
    console.error('Check upcoming appointments error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
