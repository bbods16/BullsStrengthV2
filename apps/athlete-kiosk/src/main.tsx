import React from 'react';
import ReactDOM from 'react-dom/client';
import { SessionLog } from './views/SessionLog';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* For demo, we just render the SessionLog view. 
        In production, this would have routing for login and athlete selection. */}
    <div className="min-h-screen bg-[hsl(240,6%,10%)] text-white">
      <SessionLog athleteId="1" />
    </div>
  </React.StrictMode>
);
