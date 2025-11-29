import { supabase } from '../config/supabase.js';

// Get all pending doctors
export const getPendingDoctors = async (req, res) => {
  try {
    const { data: doctors, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get all doctors (with filter)
export const getAllDoctors = async (req, res) => {
  try {
    const { status } = req.query; // pending, approved, rejected, or all

    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor');

    if (status && status !== 'all') {
      query = query.eq('approval_status', status);
    }

    const { data: doctors, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Approve doctor
export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const adminId = req.user.id;

    const { data: doctor, error } = await supabase
      .from('users')
      .update({
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', doctorId)
      .eq('role', 'doctor')
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Reject doctor
export const rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const { data: doctor, error } = await supabase
      .from('users')
      .update({
        approval_status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason || 'No reason provided',
      })
      .eq('id', doctorId)
      .eq('role', 'doctor')
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor rejected', doctor });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get doctor details
export const getDoctorDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const { data: doctor, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', doctorId)
      .eq('role', 'doctor')
      .single();

    if (error || !doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Remove password from response
    delete doctor.password;

    res.status(200).json({ doctor });
  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
