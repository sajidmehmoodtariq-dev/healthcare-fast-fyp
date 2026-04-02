import { GoogleGenAI } from '@google/genai';
import { supabase } from '../config/supabase.js';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AI_DISCLAIMER = 'This is AI-generated advice. Always consult with your healthcare provider for medical decisions.';

export const chatWithAI = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, sessionId } = req.body;
    const effectiveSessionId = sessionId || `session-${userId}-${Date.now()}`;

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

    // Load previous AI chat history for continuity (prefer current session).
    let aiHistory = [];
    let isNewSession = true;
    let previousSessionSummary = null;

    const { data: sessionHistory, error: sessionHistoryError } = await supabase
      .from('ai_chat_history')
      .select('sender_type, message, created_at')
      .eq('user_id', userId)
      .eq('session_id', effectiveSessionId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!sessionHistoryError) {
      aiHistory = sessionHistory || [];
      isNewSession = aiHistory.length === 0;
    } else {
      // Fallback for environments where session_id column is not migrated yet.
      const { data: legacyHistory, error: legacyHistoryError } = await supabase
        .from('ai_chat_history')
        .select('sender_type, message, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!legacyHistoryError) {
        aiHistory = legacyHistory || [];
        isNewSession = aiHistory.length === 0;
      } else {
        console.error('Error fetching AI chat history:', legacyHistoryError);
      }
    }

    // If this is a new session, try to load the previous session's summary
    if (isNewSession) {
      const { data: summaryData, error: summaryError } = await supabase
        .from('ai_session_summaries')
        .select('summary')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!summaryError && summaryData) {
        previousSessionSummary = summaryData.summary;
      }
    }

    const priorUserTurns = (aiHistory || []).filter((entry) => entry.sender_type === 'user').length;
    const currentUserTurn = priorUserTurns + 1;

    // Build context for AI
    let context = `You are a helpful medical AI assistant. You are NOT a replacement for a real doctor, but you can provide general health information and guidance.

PATIENT INFORMATION:
- Name: ${patient.full_name}
- Age: ${patient.age || 'Not provided'}
- Gender: ${patient.gender || 'Not provided'}

`;

    if (aiHistory && aiHistory.length > 0) {
      context += `\nRECENT AI CHAT HISTORY IN THIS SESSION:\n`;
      aiHistory
        .slice()
        .reverse()
        .forEach((entry, idx) => {
          const speaker = entry.sender_type === 'user' ? 'Patient' : 'AI Assistant';
          context += `${idx + 1}. ${speaker}: ${entry.message}\n`;
        });
    } else if (previousSessionSummary) {
      context += `\nPREVIOUS SESSION SUMMARY:\n${previousSessionSummary}\n`;
    }

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

    context += `\nSESSION CONTEXT:
  - Current session id: ${effectiveSessionId}
  - This is ${isNewSession ? 'a new session' : 'an ongoing session'}.
  - Current patient turn in this session: ${currentUserTurn}
  - Clarification policy: Ask narrowing questions only for the first 2-3 patient turns, then provide a best-guess assessment.

  IMPORTANT GUIDELINES:
  1. You are an AI assistant and cannot replace professional medical advice, but do NOT repeat this disclaimer in every response.
     Mention it briefly only in the first response of a new session, or when clinically necessary.
  2. If symptoms could be urgent/emergency (fainting, chest pain, severe shortness of breath, stroke signs, severe dehydration), advise urgent in-person care immediately.
  3. Be empathetic, clear, and supportive.
  4. You MUST use the patient's available medical history, prescriptions, appointments, and recent AI chat context when reasoning.
  5. Do NOT give only a generic list of causes unless absolutely necessary.
  6. Do not diagnose definitively or prescribe medications.
  7. Encourage following their doctor's instructions.

  RESPONSE STRATEGY (MANDATORY):
  TURN-BASED NARROWING POLICY (MANDATORY):
  - If current patient turn is 1 to 3:
    * Ask targeted narrowing questions (max 3 questions in one reply).
    * Keep possibilities brief and tentative.
  - If current patient turn is 4 or more:
    * STOP asking long lists of clarifying questions.
    * Provide a best-guess assessment now using available context.
    * Include top 2 to 4 likely causes ranked by likelihood.
    * Explain why each is likely for this patient.
    * Include confidence level (low/medium/high) and next practical steps.

  A) If information is insufficient to narrow down causes:
  - Start with a brief "What I can infer from your records" section that references relevant patient context.
  - Ask up to 3 targeted clarifying questions to narrow down the cause.
  - Include one brief interim safety note.

  B) If information is sufficient to narrow down causes:
  - Start with a short "Most likely possibilities for you" section.
  - Provide top 2 to 4 likely causes ranked by likelihood and explain WHY each is likely using patient-specific context.
  - Add "What to do next" with practical next steps and red flags.

  WHEN USER REPORTS DIZZINESS (or related terms like lightheaded, vertigo, spinning):
  - First attempt to narrow using context and ask focused questions (onset, triggers, spinning vs faint feeling, hydration/food intake, positional change, recent illness/ear symptoms, medications, blood pressure pattern, associated symptoms like chest pain, palpitations, weakness, headache).
  - Do not output a long generic differential without patient-specific prioritization.

  OUTPUT STYLE:
  - Keep responses concise and structured with headings.
  - Use patient-specific language such as "Based on your history..." when relevant.
  - Do NOT start every response with "Hello <name>". Greet only at natural conversation start.
  - Avoid long boilerplate intros when not needed.

  Now respond to the patient's question: "${message}"`;

    // Persist user message first to reduce risk of losing chat on logout/navigation.
    let { error: userMessageInsertError } = await supabase
      .from('ai_chat_history')
      .insert([
        {
          user_id: userId,
          session_id: effectiveSessionId,
          sender_type: 'user',
          message: message.trim(),
        },
      ]);

    if (userMessageInsertError) {
      // Fallback for environments where session_id column is not migrated yet.
      const fallbackUserInsert = await supabase
        .from('ai_chat_history')
        .insert([
          {
            user_id: userId,
            sender_type: 'user',
            message: message.trim(),
          },
        ]);

      userMessageInsertError = fallbackUserInsert.error;
    }

    if (userMessageInsertError) {
      console.error('Error saving user AI chat message:', userMessageInsertError);
    }

    // Generate response using Gemini
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context
    });
    
    const aiResponse = result.text || 'Sorry, I could not generate a response.';

    // Persist AI response.
    let { error: aiHistoryInsertError } = await supabase
      .from('ai_chat_history')
      .insert([
        {
          user_id: userId,
          session_id: effectiveSessionId,
          sender_type: 'ai',
          message: aiResponse,
          disclaimer: isNewSession ? AI_DISCLAIMER : null,
        },
      ]);

    if (aiHistoryInsertError) {
      // Fallback for environments where session_id column is not migrated yet.
      const fallbackInsert = await supabase
        .from('ai_chat_history')
        .insert([
          {
            user_id: userId,
            sender_type: 'ai',
            message: aiResponse,
            disclaimer: isNewSession ? AI_DISCLAIMER : null,
          },
        ]);

      aiHistoryInsertError = fallbackInsert.error;
    }

    if (aiHistoryInsertError) {
      console.error('Error saving AI chat history:', aiHistoryInsertError);
    }

    res.json({ 
      response: aiResponse,
      disclaimer: isNewSession ? AI_DISCLAIMER : null,
      sessionId: effectiveSessionId,
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI response',
      message: error.message 
    });
  }
};

export const getAIChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.query;

    let query = supabase
      .from('ai_chat_history')
      .select('id, sender_type, message, disclaimer, created_at')
      .eq('user_id', userId);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: history, error } = await query.order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to load AI chat history' });
    }

    res.status(200).json({ history: history || [] });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const summarizeChat = async (req, res) => {
  try {
    const { transcript, participantName } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Chat transcript is required' });
    }

    const summaryPrompt = `You are a medical assistant helping summarize a doctor-patient chat.

Create a concise summary using these sections:
1. Main concerns
2. Important clinical details
3. Advice or actions discussed
4. Suggested follow-up

Keep the tone professional and clear.
Do not invent details that are not present in the transcript.
${participantName ? `Patient name: ${participantName}` : ''}

Transcript:
${transcript}`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: summaryPrompt,
    });

    const summary = result.text || 'Unable to generate summary right now.';
    res.status(200).json({ summary });
  } catch (error) {
    console.error('AI Summary Error:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error.message,
    });
  }
};

export const saveSessionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, summary } = req.body;

    if (!sessionId || !summary) {
      return res.status(400).json({ error: 'Session ID and summary are required' });
    }

    // Check if summary already exists for this session
    const { data: existing, error: checkError } = await supabase
      .from('ai_session_summaries')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();

    if (!checkError && existing) {
      // Update existing summary
      const { error: updateError } = await supabase
        .from('ai_session_summaries')
        .update({ summary })
        .eq('user_id', userId)
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error updating session summary:', updateError);
        return res.status(500).json({ error: 'Failed to save summary' });
      }
    } else {
      // Insert new summary
      const { error: insertError } = await supabase
        .from('ai_session_summaries')
        .insert([
          {
            user_id: userId,
            session_id: sessionId,
            summary,
          },
        ]);

      if (insertError) {
        console.error('Error saving session summary:', insertError);
        return res.status(500).json({ error: 'Failed to save summary' });
      }
    }

    res.status(201).json({ 
      message: 'Summary saved successfully',
      sessionId,
    });
  } catch (error) {
    console.error('Save session summary error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getSessionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const { data: summary, error } = await supabase
      .from('ai_session_summaries')
      .select('summary, created_at')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.status(200).json({ summary: summary?.summary, createdAt: summary?.created_at });
  } catch (error) {
    console.error('Get session summary error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
