import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Athlete } from '@weightroom/shared-types';
import { AppShell } from './components/layout/AppShell';
import { AthleteCard } from './components/AthleteCard';
import { AnalyticsDashboard } from './views/AnalyticsDashboard';
import { SessionLog } from './views/kiosk/SessionLog';
import { WellnessForm } from './components/kiosk/WellnessForm';
import { apiFetch } from './lib/api';
import { Button } from '@weightroom/ui-components';

function Dashboard() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Athlete[]>('athletes')
      .then(setAthletes)
      .catch(err => {
        console.error(err);
        setAthletes([
          { id: '1', schoolId: 'ub', firstName: 'John', lastName: 'Smith', sport: 'Shot Put', team: 'Buffalo Throws', statusTag: 'GREEN' },
          { id: '2', schoolId: 'ub', firstName: 'Jane', lastName: 'Doe', sport: 'Discus', team: 'Buffalo Throws', statusTag: 'YELLOW' },
          { id: '3', schoolId: 'ub', firstName: 'Mike', lastName: 'Johnson', sport: 'Shot Put', team: 'Buffalo Throws', statusTag: 'RED' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Coach Dashboard</h1>
          <p className="text-zinc-400 mt-1">Real-time athlete readiness and performance tracking.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => window.location.href = '/kiosk'}>Kiosk Mode</Button>
          <Button>Add Athlete</Button>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Active Athletes</h2>
          <span className="text-sm text-zinc-500">{athletes.length} Total</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map(athlete => (
            <AthleteCard 
              key={athlete.id} 
              athlete={athlete} 
              onClick={(a) => window.location.href = `/analytics?athleteId=${a.id}`} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  // Simple check for kiosk mode to hide sidebar
  const isKiosk = window.location.pathname.startsWith('/kiosk') || window.location.pathname.startsWith('/wellness');

  if (isKiosk) {
    return (
      <div className="min-h-screen bg-[hsl(240,6%,10%)] p-4">
        <Routes>
          <Route path="/kiosk" element={<SessionLog athleteId="1" />} />
          <Route path="/wellness" element={<WellnessForm athleteId="1" />} />
        </Routes>
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard athleteId="1" />} />
        <Route path="/athletes" element={<div className="p-8 text-white"><h1 className="text-2xl font-bold">Athlete Directory</h1></div>} />
        <Route path="/settings" element={<div className="p-8 text-white"><h1 className="text-2xl font-bold">Settings</h1></div>} />
      </Routes>
    </AppShell>
  );
}

export default App;
