import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Calendar, Clock, Sparkles } from 'lucide-react';
import { generateBlogContent } from '../services/geminiService';

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
}

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/admin/index.astro.bak'); // This is a trick to read the old data if needed, or just use the API
      // Actually, I should use the real API
      const res = await fetch('/api/projects'); // I need to create this GET route if it doesn't exist
      if (res.ok) {
          const data = await res.json();
          setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleGenerateAI = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const content = await generateBlogContent(topic);
      // Here you would typically open a modal to edit the generated content
      alert("AI Generated Content:\n\n" + content.substring(0, 200) + "...");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Project Manager</h1>
          <p className="text-slate-500">Manage your portfolio items and descriptions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Plus size={18} />
            Add New Project
          </button>
        </div>
      </div>

      {/* AI Assistant Card */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-sky-200/50">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <h2 className="text-lg font-bold">AI Project Assistant</h2>
            </div>
            <p className="text-sky-100 text-sm max-w-md">
              Enter a project topic and let Gemini generate a compelling description or case study for you.
            </p>
          </div>
          <div className="flex-1 max-w-md ml-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Project topic (e.g. E-commerce Dashboard)"
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-4 pr-12 text-white placeholder:text-sky-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !topic}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
              >
                {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-600 hover:text-sky-600 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-sky-600 bg-sky-50 w-fit px-2 py-1 rounded">
                   Project
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(project.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {project.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
