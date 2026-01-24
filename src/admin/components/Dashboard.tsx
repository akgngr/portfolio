import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Eye, MousePointer, Activity, Layout, Cpu, BookOpen, Briefcase } from 'lucide-react';
import StatCard from './StatCard';

const chartData = [
  { name: 'Jan', visits: 4000, views: 2400 },
  { name: 'Feb', visits: 3000, views: 1398 },
  { name: 'Mar', visits: 2000, views: 9800 },
  { name: 'Apr', visits: 2780, views: 3908 },
  { name: 'May', visits: 1890, views: 4800 },
  { name: 'Jun', visits: 2390, views: 3800 },
  { name: 'Jul', visits: 3490, views: 4300 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ projects: 0, skills: 0, blog: 0, experience: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview of your portfolio performance.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm text-slate-600 shadow-sm">
                Last 30 Days
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Projects" 
          value={loading ? '...' : stats.projects.toString()} 
          trend="Total Shipped" 
          trendUp={true} 
          icon={<Layout size={20} className="text-indigo-600" />} 
          color="bg-indigo-50"
        />
        <StatCard 
          title="Skills" 
          value={loading ? '...' : stats.skills.toString()} 
          trend="Tech Matrix" 
          trendUp={true} 
          icon={<Cpu size={20} className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Blog Posts" 
          value={loading ? '...' : stats.blog.toString()} 
          trend="Published" 
          trendUp={true} 
          icon={<BookOpen size={20} className="text-purple-600" />} 
          color="bg-purple-50"
        />
        <StatCard 
          title="Experience" 
          value={loading ? '...' : stats.experience.toString()} 
          trend="Positions" 
          trendUp={true} 
          icon={<Briefcase size={20} className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Visitor Analytics (Simulation)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#475569', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
           <h3 className="text-lg font-semibold text-slate-900 mb-4">Traffic Sources</h3>
           <div className="space-y-4">
              {[
                  { source: 'Direct', value: 40, color: 'bg-indigo-500' },
                  { source: 'Social Media', value: 32, color: 'bg-pink-500' },
                  { source: 'Organic Search', value: 24, color: 'bg-emerald-500' },
                  { source: 'Referral', value: 4, color: 'bg-amber-500' },
              ].map((item) => (
                  <div key={item.source}>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{item.source}</span>
                          <span className="font-medium text-slate-900">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                      </div>
                  </div>
              ))}
           </div>
           
           <div className="mt-8 pt-6 border-t border-slate-100">
               <h4 className="text-sm font-semibold text-slate-900 mb-3">System Info</h4>
               <ul className="space-y-3">
                   <li className="flex gap-3 items-center text-sm">
                       <span className="w-2 h-2 rounded-full bg-green-500"></span>
                       <span className="text-slate-600 truncate">Database: Cloudflare D1</span>
                   </li>
                   <li className="flex gap-3 items-center text-sm">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       <span className="text-slate-600 truncate">Runtime: Cloudflare Workers</span>
                   </li>
                    <li className="flex gap-3 items-center text-sm">
                       <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                       <span className="text-slate-600 truncate">Frontend: Astro 5.0</span>
                   </li>
               </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
