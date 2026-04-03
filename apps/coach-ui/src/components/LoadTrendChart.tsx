import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart
} from 'recharts';

interface LoadData {
  date: string;
  dailyLoad: number;
  acuteLoad: number;
  chronicLoad: number;
  acwr: number;
}

export const LoadTrendChart = ({ data }: { data: LoadData[] }) => {
  return (
    <div style={{ width: '100%', height: 400, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
          />
          <YAxis yAxisId="left" label={{ value: 'Training Load (AU)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'ACWR', angle: 90, position: 'insideRight' }} />
          <Tooltip 
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          
          {/* Chronic Load (Fitness) */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="chronicLoad" 
            stroke="#8884d8" 
            name="Chronic Load (Fitness)" 
            strokeWidth={2}
            dot={false}
          />
          
          {/* Acute Load (Fatigue) */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="acuteLoad" 
            stroke="#82ca9d" 
            name="Acute Load (Fatigue)" 
            strokeWidth={2}
            dot={false}
          />

          {/* ACWR */}
          <Line 
            yAxisId="right"
            type="step" 
            dataKey="acwr" 
            stroke="#ff7300" 
            name="ACWR" 
            strokeWidth={3}
          />

          {/* Sweet Spot Reference Area (0.8 - 1.3) */}
          {/* Recharts doesn't have a built-in constant horizontal band easily without data mapping, 
              but we can use a reference line or area if needed */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
