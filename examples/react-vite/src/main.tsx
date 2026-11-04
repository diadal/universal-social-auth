import { createRoot } from 'react-dom/client';
import { App } from './App';

// Browser-only entry. The popup opens from a click handler, never during render.
createRoot(document.getElementById('root') as HTMLElement).render(<App />);
