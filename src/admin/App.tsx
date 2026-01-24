import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ServicesManager from './components/ServicesManager';
import SkillsManager from './components/SkillsManager';
import PagesManager from './components/PagesManager';
import BlogManager from './components/BlogManager';
import BlogEditorPage from './components/BlogEditorPage';
import ExperienceManager from './components/ExperienceManager';

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
          <Route path="/blog" element={<BlogManager />} />
          <Route path="/blog/new" element={<BlogEditorPage />} />
          <Route path="/blog/edit/:id" element={<BlogEditorPage />} />
          <Route path="/experience" element={<ExperienceManager />} />
          <Route path="/services" element={<ServicesManager />} />
          <Route path="/skills" element={<SkillsManager />} />
          <Route path="/settings" element={<PagesManager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
