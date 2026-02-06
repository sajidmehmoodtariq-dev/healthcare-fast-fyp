import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PatientNotifications = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const newNotifications = notifications.filter(n => !n.is_read);
  const earlierNotifications = notifications.filter(n => n.is_read);

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'prescription':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'reminder':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-500';
      case 'message':
        return 'bg-teal-500';
      case 'prescription':
        return 'bg-purple-500';
      case 'reminder':
        return 'bg-yellow-500';
      case 'system':
        return 'bg-gray-500';
      default:
        return 'bg-teal-500';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return createdAt.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="pb-20 lg:pb-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 mb-6 text-white">
        <button 
          onClick={() => onNavigate('home')}
          className="mb-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors inline-flex lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-sm md:text-base opacity-90">
          You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* New Notifications */}
      {newNotifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 px-1">New</h2>
          <div className="space-y-3">
            {newNotifications.map(notification => (
              <div 
                key={notification.id} 
                onClick={() => handleMarkAsRead(notification.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-teal-200 hover:border-teal-300 transition-colors cursor-pointer relative"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${getIconColor(notification.type)} rounded-xl flex items-center justify-center shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm md:text-base">{notification.title}</h3>
                      <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-1"></div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Earlier Notifications */}
      {earlierNotifications.length > 0 && (
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 px-1">Earlier</h2>
          <div className="space-y-3">
            {earlierNotifications.map(notification => (
              <div 
                key={notification.id} 
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${getIconColor(notification.type)} rounded-xl flex items-center justify-center shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">{notification.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Notifications</h3>
          <p className="text-sm text-gray-500">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default PatientNotifications;
