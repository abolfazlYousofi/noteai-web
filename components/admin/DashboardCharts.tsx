'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6'];

export function UserGrowthChart({ data }: { data: any[] }) {
  return (
    <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="var(--text-soft)" fontSize={12} />
          <YAxis stroke="var(--text-soft)" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }} 
            itemStyle={{ color: 'var(--green)' }}
          />
          <Line type="monotone" dataKey="users" stroke="var(--green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--green)' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CountryPieChart({ data }: { data: any[] }) {
  return (
    <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}