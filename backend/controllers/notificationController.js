import { supabase } from '../config/supabase.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly === 'true') {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, relatedId } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in createNotification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ error: 'Failed to update notification' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return res.status(500).json({ error: 'Failed to update notifications' });
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
