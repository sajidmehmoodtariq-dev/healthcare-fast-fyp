import React, { useState } from 'react';

const DoctorNotifications = ({ onNavigate }) => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Request',
      message: 'Sarah Johnson requested an appointment for Dec 5, 2025 at 10:00 AM',
      time: '5 minutes ago',
      unread: true,
      icon: '📅'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Michael Chen sent you a message about his medication',
      time: '1 hour ago',
      unread: true,
      icon: '💬'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Appointment Reminder',
      message: 'You have an appointment with Emily Davis in 30 minutes',
      time: '2 hours ago',
      unread: false,
      icon: '⏰'
    },
    {
      id: 4,
      type: 'review',
      title: 'New Patient Review',
      message: 'Robert Wilson left a 5-star review for your service',
      time: 'Yesterday',
      unread: false,
      icon: '⭐'
    },
    {
      id: 5,
      type: 'system',
      title: 'Profile Update',
      message: 'Your professional profile has been successfully updated',
      time: '2 days ago',
      unread: false,
      icon: '✅'
    }
  ];

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.unread);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl p-6 text-white mb-6">
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
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-colors ${
            filter === 'all'
              ? 'bg-teal-500 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-colors ${
            filter === 'unread'
              ? 'bg-teal-500 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
              notification.unread 
                ? 'border-teal-200 bg-teal-50' 
                : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                notification.unread ? 'bg-teal-100' : 'bg-gray-100'
              }`}>
                {notification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {notification.title}
                    {notification.unread && (
                      <span className="ml-2 w-2 h-2 bg-teal-500 rounded-full inline-block"></span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-gray-500">No notifications to display</p>
        </div>
      )}

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <button className="w-full mt-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors">
          Mark all as read
        </button>
      )}
    </div>
  );
};

export default DoctorNotifications;
