import { supabase } from '../config/supabase.js';

// Create a prescription (Doctor only)
export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId, diagnosis, medications, dosage, instructions, notes } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create prescriptions' });
    }

    if (!patientId || !medications) {
      return res.status(400).json({ error: 'Patient ID and medications are required' });
    }

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id')
      .eq('id', patientId)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // If appointmentId provided, verify it exists and belongs to this doctor and patient
    if (appointmentId) {
      const { data: appointment, error: aptError } = await supabase
        .from('appointments')
        .select('id')
        .eq('id', appointmentId)
        .eq('doctor_id', doctorId)
        .eq('patient_id', patientId)
        .single();

      if (aptError || !appointment) {
        return res.status(400).json({ error: 'Invalid appointment' });
      }
    }

    // Create prescription
    const { data: prescription, error: insertError } = await supabase
      .from('prescriptions')
      .insert([{
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_id: appointmentId || null,
        diagnosis: diagnosis || null,
        medications,
        dosage: dosage || null,
        instructions: instructions || null,
        notes: notes || null
      }])
      .select(`
        *,
        doctor:users!prescriptions_doctor_id_fkey(full_name, specialization),
        patient:users!prescriptions_patient_id_fkey(full_name, age, gender)
      `)
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Create notification for patient
    await supabase
      .from('notifications')
      .insert([{
        user_id: patientId,
        type: 'prescription',
        title: 'New Prescription Available',
        message: `Dr. ${prescription.doctor.full_name} has created a new prescription for you. Diagnosis: ${diagnosis || 'See details'}`,
        related_id: prescription.id
      }]);

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get prescriptions (Patient or Doctor)
export const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:users!prescriptions_doctor_id_fkey(full_name, specialization, phone_number),
        patient:users!prescriptions_patient_id_fkey(full_name, age, gender, phone_number)
      `)
      .order('created_at', { ascending: false });

    // Filter based on role
    if (userRole === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (userRole === 'doctor') {
      query = query.eq('doctor_id', userId);
    } else {
      return res.status(403).json({ error: 'Invalid user role' });
    }

    const { data: prescriptions, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ prescriptions });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get a single prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:users!prescriptions_doctor_id_fkey(full_name, specialization, phone_number, email),
        patient:users!prescriptions_patient_id_fkey(full_name, age, gender, phone_number, email)
      `)
      .eq('id', prescriptionId)
      .single();

    if (error || !prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Verify user has access to this prescription
    if (userRole === 'patient' && prescription.patient_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'doctor' && prescription.doctor_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json({ prescription });
  } catch (error) {
    console.error('Get prescription by ID error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Update a prescription (Doctor only)
export const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const doctorId = req.user.id;
    const { diagnosis, medications, dosage, instructions, notes } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can update prescriptions' });
    }

    // Verify prescription exists and belongs to this doctor
    const { data: existing, error: fetchError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('id', prescriptionId)
      .eq('doctor_id', doctorId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Prescription not found or access denied' });
    }

    // Update prescription
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (medications !== undefined) updateData.medications = medications;
    if (dosage !== undefined) updateData.dosage = dosage;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (notes !== undefined) updateData.notes = notes;

    const { data: prescription, error: updateError } = await supabase
      .from('prescriptions')
      .update(updateData)
      .eq('id', prescriptionId)
      .select(`
        *,
        doctor:users!prescriptions_doctor_id_fkey(full_name, specialization),
        patient:users!prescriptions_patient_id_fkey(full_name, age, gender)
      `)
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    res.status(200).json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Delete a prescription (Doctor only)
export const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const doctorId = req.user.id;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can delete prescriptions' });
    }

    // Verify and delete
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', prescriptionId)
      .eq('doctor_id', doctorId);

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
