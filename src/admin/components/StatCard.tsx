import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
           {React.cloneElement(icon as React.ReactElement<any>, { className: `text-${color.split('-')[1]}-600` })}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
          trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trendUp ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
          {trend}
        </span>
        <span className="text-slate-400 text-xs">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;