import { supabase } from '../config/supabase.js';

// Get all medical history for the current patient
export const getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user.role === 'doctor' ? req.query.patientId : req.user.id;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const { data, error } = await supabase
      .from('medical_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('diagnosed_year', { ascending: false });

    if (error) {
      console.error('Error fetching medical history:', error);
      return res.status(500).json({ error: 'Failed to fetch medical history' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getMedicalHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a medical history record
export const addMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { condition, diagnosedYear, notes, isActive } = req.body;

    if (!condition) {
      return res.status(400).json({ error: 'Condition is required' });
    }

    const { data, error } = await supabase
      .from('medical_history')
      .insert([{
        patient_id: patientId,
        condition,
        diagnosed_year: diagnosedYear || null,
        notes: notes || null,
        is_active: isActive !== undefined ? isActive : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding medical history:', error);
      return res.status(500).json({ error: 'Failed to add medical history' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in addMedicalHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a medical history record
export const updateMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;
    const { condition, diagnosedYear, notes, isActive } = req.body;

    const updateData = {};
    if (condition !== undefined) updateData.condition = condition;
    if (diagnosedYear !== undefined) updateData.diagnosed_year = diagnosedYear;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('medical_history')
      .update(updateData)
      .eq('id', id)
      .eq('patient_id', patientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating medical history:', error);
      return res.status(500).json({ error: 'Failed to update medical history' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in updateMedicalHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a medical history record
export const deleteMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const { error } = await supabase
      .from('medical_history')
      .delete()
      .eq('id', id)
      .eq('patient_id', patientId);

    if (error) {
      console.error('Error deleting medical history:', error);
      return res.status(500).json({ error: 'Failed to delete medical history' });
    }

    res.json({ message: 'Medical history deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMedicalHistory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
