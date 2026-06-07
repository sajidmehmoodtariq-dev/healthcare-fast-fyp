import { supabase } from '../config/supabase.js';

export async function logActivity({ userId, userName, userRole, action, entityType, entityId, description, ipAddress }) {
  try {
    await supabase.from('activity_logs').insert([{
      user_id: userId || null,
      user_name: userName || null,
      user_role: userRole || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      description,
      ip_address: ipAddress || null,
    }]);
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}

export function getIp(req) {
  return (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
}
