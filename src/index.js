import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const initApp = () => {
  const container = document.getElementById('chrome-extension-root')
  if (container && !container.hasAttribute('data-react-mounted')) {
    try {
      container.setAttribute('data-react-mounted', 'true')
      const root = createRoot(container)
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      )
      console.log('React app mounted successfully')
    } catch (error) {
      console.error('Error mounting React app:', error)
    }
  }
}

const retryMount = (attempts = 0) => {
  if (attempts >= 5) {
    console.error('Failed to mount React app after 5 attempts')
    return
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp)
  } else {
    setTimeout(() => {
      initApp()
      if (
        !document
          .getElementById('chrome-extension-root')
          ?.hasAttribute('data-react-mounted')
      ) {
        retryMount(attempts + 1)
      }
    }, 1000)
  }
}

retryMount()
