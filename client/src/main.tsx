import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
// Solo durante el piloto: redirigir cualquier entrada directamente a la Carta.
if (import.meta.env.VITE_B3_CARTA_PILOT !== 'false' && window.location.pathname !== '/carta') {
  window.history.replaceState({}, '', '/carta' + window.location.search + window.location.hash);
}
const root = document.getElementById('root');
if (!root) throw new Error('No se encontró la raíz de la aplicación Pollos B3.');
createRoot(root).render(<App/>);
