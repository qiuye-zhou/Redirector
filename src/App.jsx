import ReactDOM from 'react-dom/client';
import { ApiConfigProvider } from './context/ApiConfigContext';
import FloatingWindow from './components/FloatingWindow';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ApiConfigProvider>
    <FloatingWindow />
  </ApiConfigProvider>
);