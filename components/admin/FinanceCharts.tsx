'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-soft)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-soft)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', color: 'var(--text)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} 
            itemStyle={{ color: 'var(--green)', fontWeight: 'bold' }}
            formatter={(value: any) => [`${Number(value || 0).toLocaleString('fa-IR')} تومان`, 'درآمد']}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--green)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlanPieChart({ data }: { data: any[] }) {
  return (
    <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name" stroke="none">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', color: 'var(--text)' }} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: 'var(--text-soft)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}