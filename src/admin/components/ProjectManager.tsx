import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Clock, Sparkles, X, Save } from 'lucide-react';
import { generateBlogContent } from '../services/geminiService';
import CategoryManager from './CategoryManager';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  imageUrl: string;
  category: string;
  categoryIds?: number[];
  categories?: any[];
  demoUrl?: string;
  githubUrl?: string;
  role?: string;
  year?: string;
  publishedAt: string;
}

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contentCategories, setContentCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects');
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: 'Web',
    categoryIds: [],
    tags: [],
    imageUrl: '/images/project-placeholder.jpg',
    role: 'Developer',
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [activeTab]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/content-categories?type=project');
      if (res.ok) {
        const data = await res.json();
        setContentCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        ...project,
        categoryIds: project.categories?.map(c => c.id) || []
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        category: 'Web',
        categoryIds: [],
        tags: [],
        imageUrl: '/images/project-placeholder.jpg',
        role: 'Developer',
        year: new Date().getFullYear().toString()
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchProjects();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
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
      setFormData(prev => ({
        ...prev,
        title: topic,
        description: content.substring(0, 150) + '...',
        longDescription: content
      }));
      handleOpenModal();
    } catch (err) {
      alert("AI Generation failed. Please check Gemini API Key.");
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Project Manager</h1>
          <p className="text-slate-500">Manage your portfolio items and descriptions</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded">
           <button 
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'projects' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Projects
           </button>
           <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Categories
           </button>
        </div>
      </div>

      {activeTab === 'projects' ? (
        <>
          {/* AI Assistant Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md p-6 text-white shadow-lg shadow-indigo-200/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} />
                  <h2 className="text-lg font-bold">AI Project Assistant</h2>
                </div>
                <p className="text-indigo-100 text-sm max-w-md">
                  Enter a project topic and let Gemini generate a compelling description or case study for you.
                </p>
              </div>
              <div className="flex-1 max-w-md ml-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Project topic (e.g. E-commerce Dashboard)"
                    className="w-full bg-white/10 border border-white/20 rounded py-2 pl-4 pr-12 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !topic}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex justify-between items-center gap-4">
            <div className="bg-white p-4 rounded-md border border-slate-200 flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-bold"
            >
              <Plus size={20} />
              Add Project
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-md border border-slate-200 h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-md border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(project)}
                        className="p-2 bg-white/90 backdrop-blur shadow-sm rounded text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-2 bg-white/90 backdrop-blur shadow-sm rounded text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {project.categories?.map(c => (
                        <span key={c.id} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {c.name}
                        </span>
                      ))}
                      {(!project.categories || project.categories.length === 0) && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          Uncategorized
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(project.publishedAt).toLocaleDateString()}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider">
                        ID: {project.id.split('-')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <CategoryManager type="project" embedded />
      )}

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Categories</label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                    {contentCategories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-600 transition-colors">
                        <input 
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={formData.categoryIds?.includes(cat.id)}
                          onChange={e => {
                            const ids = new Set(formData.categoryIds || []);
                            if (e.target.checked) ids.add(cat.id);
                            else ids.delete(cat.id);
                            setFormData({ ...formData, categoryIds: Array.from(ids) });
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Short Description</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Case Study (Optional)</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  value={formData.longDescription}
                  onChange={e => setFormData({...formData, longDescription: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Image URL</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Year</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
