import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

console.log('React entry point loaded');

const initApp = () => {
  const container = document.getElementById('chrome-extension-root');
  if (container && !container.hasAttribute('data-react-mounted')) {
    console.log('Found container, attempting to mount React app');
    try {
      container.setAttribute('data-react-mounted', 'true');
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('React app mounted successfully');
    } catch (error) {
      console.error('Error mounting React app:', error);
    }
  } else {
    console.log('Container status:', {
      exists: !!container,
      mounted: container?.hasAttribute('data-react-mounted')
    });
  }
};

// 重试机制
const retryMount = (attempts = 0) => {
  if (attempts >= 5) {
    console.error('Failed to mount React app after 5 attempts');
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp());
  } else {
    setTimeout(() => {
      console.log(`Attempt ${attempts + 1} to mount React app`);
      initApp();
      if (!document.getElementById('chrome-extension-root')?.hasAttribute('data-react-mounted')) {
        retryMount(attempts + 1);
      }
    }, 1000);
  }
};

retryMount();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
