import React from 'react'
import { ApiConfigProvider } from './context/ApiConfigContext'
import FloatingWindow from './components/FloatingWindow'

const App = () => (
  <ApiConfigProvider>
    <FloatingWindow />
  </ApiConfigProvider>
)

export default App