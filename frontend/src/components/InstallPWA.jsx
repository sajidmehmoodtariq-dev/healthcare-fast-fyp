import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
  // Check if running on iOS
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  // Check if already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || window.navigator.standalone 
    || document.referrer.includes('android-app://');
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (isStandalone) {
      return;
    }

    // Listen for PWA install availability
    const handleInstallAvailable = () => {
      setShowInstallPrompt(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // For iOS, show prompt after a delay if not installed
    if (isIOS) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('pwa-install-available', handleInstallAvailable);
      };
    }

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, [isIOS, isStandalone]);

  const handleInstallClick = () => {
    if (isIOS) {
      // iOS doesn't support programmatic install, just show instructions
      return; // Keep the banner visible for iOS users
    }
    
    // Trigger the install prompt
    window.dispatchEvent(new Event('pwa-install-click'));
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if user dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl shadow-2xl p-5 text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex-1 pr-6">
            <h3 className="font-bold text-lg mb-1">Install Physician Assistant</h3>
            <p className="text-sm text-white text-opacity-90 mb-4">
              {isIOS 
                ? 'Tap the share button and select "Add to Home Screen"'
                : 'Install our app for quick access and offline use!'
              }
            </p>

            {isIOS ? (
              <div className="flex items-center gap-2 text-sm bg-white bg-opacity-20 rounded-lg p-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Safari menu → Add to Home Screen</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full bg-white text-teal-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Install Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
