import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  console.log('PWA install prompt available');
  
  // Dispatch custom event that components can listen to
  window.dispatchEvent(new CustomEvent('pwa-install-available', { detail: e }));
});

// Handle PWA install
window.addEventListener('pwa-install-click', async () => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);
  
  // Clear the deferredPrompt for next time
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
