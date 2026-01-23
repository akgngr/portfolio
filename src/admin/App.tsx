import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ServicesManager from './components/ServicesManager';
import SkillsManager from './components/SkillsManager';
import PagesManager from './components/PagesManager';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectManager />} />
          <Route path="/services" element={<ServicesManager />} />
          <Route path="/skills" element={<SkillsManager />} />
          <Route path="/pages" element={<PagesManager />} />
          <Route path="/settings" element={<div className="text-slate-500">Settings page placeholder</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;