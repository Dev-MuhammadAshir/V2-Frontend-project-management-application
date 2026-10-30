import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { MockAuthProvider } from './context/MockAuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <MockAuthProvider>
    <App />
  </MockAuthProvider>
);
