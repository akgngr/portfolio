import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, Code, Settings, LogOut, BookOpen, Layers } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Projects', path: '/projects', icon: <Briefcase size={20} /> },
  { label: 'Blog', path: '/blog', icon: <BookOpen size={20} /> },
  { label: 'Experience', path: '/experience', icon: <Layers size={20} /> },
  { label: 'Skills', path: '/skills', icon: <Code size={20} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-50 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          P
        </div>
        <span className="text-lg font-bold tracking-tight">Portfolio OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className={`${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <a 
          href="https://portfolio-admin-os.cloudflareaccess.com/cdn-cgi/access/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
