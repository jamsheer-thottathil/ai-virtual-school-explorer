import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AiGuideProvider } from './hooks/AiGuideContext';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <AiGuideProvider>
      <RouterProvider router={router} />
    </AiGuideProvider>
  </StrictMode>
);
