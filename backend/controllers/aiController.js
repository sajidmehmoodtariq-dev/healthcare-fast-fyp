import { GoogleGenAI } from '@google/genai';
import { supabase } from '../config/supabase.js';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithAI = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('full_name, age, gender, email')
      .eq('id', userId)
      .single();

    if (patientError) {
      console.error('Error fetching patient:', patientError);
      return res.status(500).json({ error: 'Failed to fetch patient data' });
    }

    // Fetch patient's prescriptions
    const { data: prescriptions, error: prescError } = await supabase
      .from('prescriptions')
      .select(`
        id,
        diagnosis,
        medications,
        dosage,
        instructions,
        notes,
        created_at,
        doctor:doctor_id (full_name, specialization)
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (prescError) {
      console.error('Error fetching prescriptions:', prescError);
    }

    // Fetch recent appointments
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        doctor:doctor_id (full_name, specialization)
      `)
      .eq('patient_id', userId)
      .order('appointment_date', { ascending: false })
      .limit(5);

    if (aptError) {
      console.error('Error fetching appointments:', aptError);
    }

    // Fetch medical history
    const { data: medicalHistory, error: historyError } = await supabase
      .from('medical_history')
      .select('*')
      .eq('patient_id', userId)
      .order('diagnosed_year', { ascending: false });

    if (historyError) {
      console.error('Error fetching medical history:', historyError);
    }

    // Build context for AI
    let context = `You are a helpful medical AI assistant. You are NOT a replacement for a real doctor, but you can provide general health information and guidance.

PATIENT INFORMATION:
- Name: ${patient.full_name}
- Age: ${patient.age || 'Not provided'}
- Gender: ${patient.gender || 'Not provided'}

`;

    if (medicalHistory && medicalHistory.length > 0) {
      context += `\nMEDICAL HISTORY:\n`;
      medicalHistory.forEach((history, idx) => {
        context += `\n${idx + 1}. ${history.condition}${history.diagnosed_year ? ` (Diagnosed: ${history.diagnosed_year})` : ''}
   Status: ${history.is_active ? 'Active' : 'Resolved'}
   ${history.notes ? `Notes: ${history.notes}` : ''}
`;
      });
    }

    if (prescriptions && prescriptions.length > 0) {
      context += `\nPATIENT'S RECENT PRESCRIPTIONS:\n`;
      prescriptions.forEach((rx, idx) => {
        context += `\n${idx + 1}. Prescription from Dr. ${rx.doctor?.full_name} (${rx.doctor?.specialization})
   Date: ${new Date(rx.created_at).toLocaleDateString()}
   Diagnosis: ${rx.diagnosis || 'Not specified'}
   Medications: ${rx.medications}
   Dosage: ${rx.dosage || 'See instructions'}
   Instructions: ${rx.instructions || 'Follow doctor\'s advice'}
   ${rx.notes ? `Notes: ${rx.notes}` : ''}
`;
      });
    }

    if (appointments && appointments.length > 0) {
      context += `\nRECENT APPOINTMENTS:\n`;
      appointments.forEach((apt, idx) => {
        context += `\n${idx + 1}. Appointment with Dr. ${apt.doctor?.full_name} (${apt.doctor?.specialization})
   Date: ${new Date(apt.appointment_date).toLocaleDateString()} at ${apt.appointment_time}
   Status: ${apt.status}
`;
      });
    }

    context += `\nIMPORTANT GUIDELINES:
1. Always remind the patient that you're an AI assistant and cannot replace professional medical advice
2. If the question is about serious symptoms or emergencies, strongly advise them to see a doctor immediately
3. Be empathetic, clear, and supportive
4. Reference their medical history, prescriptions and appointments when relevant
5. Never diagnose conditions or prescribe medications
6. Provide general health information and wellness advice
7. Encourage following their doctor's instructions

Now respond to the patient's question: "${message}"`;

    // Generate response using Gemini
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: context
    });
    
    const aiResponse = result.text || 'Sorry, I could not generate a response.';

    res.json({ 
      response: aiResponse,
      disclaimer: 'This is AI-generated advice. Always consult with your healthcare provider for medical decisions.'
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI response',
      message: error.message 
    });
  }
};
