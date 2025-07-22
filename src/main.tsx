import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import setupI18n from './i18n';

setupI18n().then(() => {
  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
});