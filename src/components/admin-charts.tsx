"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { label: string; count: number };

function Chart({ title, data, color }: { title: string; data: Point[]; color: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-semibold">{title}</h3>
      {/* The parent needs a fixed height, or the chart will not show */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" fontSize={12} tickLine={false} />
            <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar dataKey="count" name="Appointments" fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdminCharts({ perDay, perDoctor }: { perDay: Point[]; perDoctor: Point[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Chart title="Appointments per day" data={perDay} color="#7c3aed" />
      <Chart title="Busiest doctors" data={perDoctor} color="#0d9488" />
    </div>
  );
}