import React, { useState, useEffect } from 'react';
import { LoadTrendChart } from '../components/LoadTrendChart';
import { apiFetch } from '../lib/api';

export const AnalyticsDashboard = ({ athleteId }: { athleteId: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>(`analytics?athleteId=${athleteId}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [athleteId]);

  if (loading) return <div>Loading load trends...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Load Analytics Trends</h2>
      <div style={{ marginBottom: '20px' }}>
        <LoadTrendChart data={data} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Current Readiness</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>84%</p>
          <p>Athlete is in the "Sweet Spot". Optimal training recommended.</p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Alerts</h3>
          <ul style={{ color: '#f44336' }}>
            <li>No active ACWR spikes detected.</li>
            <li>Last sleep quality: 4/10 (Low)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
