import React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './components/Popup'
import { ApiConfigProvider } from './context/ApiConfigContext'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ApiConfigProvider>
      <Popup />
    </ApiConfigProvider>
  </React.StrictMode>
)
