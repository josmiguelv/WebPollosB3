import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
const root = document.getElementById('root');
if (!root) throw new Error('No se encontró la raíz de la aplicación Pollos B3.');
createRoot(root).render(<App/>);
