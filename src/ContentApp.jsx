import React from 'react';
import { ApiConfigProvider } from './context/ApiConfigContext';
import FloatingWindow from './components/FloatingWindow';

const ContentApp = () => (
  <ApiConfigProvider>
    <FloatingWindow />
  </ApiConfigProvider>
);

export default ContentApp;