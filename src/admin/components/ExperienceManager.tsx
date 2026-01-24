import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Briefcase } from 'lucide-react';
import CategoryManager from './CategoryManager';

interface Experience {
  id: number;
  company: string;
  position: string;
  period: string;
  description: string[];
  logo?: string;
  categoryId?: number;
  categoryName?: string;
}

const ExperienceManager: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [contentCategories, setContentCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [activeTab, setActiveTab] = useState<'experiences' | 'categories'>('experiences');
  
  const [formData, setFormData] = useState<Partial<Experience>>({
    company: '',
    position: '',
    period: '',
    description: [''],
    categoryId: undefined
  });

  useEffect(() => {
    fetchExperiences();
    fetchCategories();
  }, [activeTab]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/experience');
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/content-categories?type=experience');
      if (res.ok) {
        const data = await res.json();
        setContentCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleOpenModal = (exp?: Experience) => {
    if (exp) {
      setEditingExp(exp);
      setFormData(exp);
    } else {
      setEditingExp(null);
      setFormData({ company: '', position: '', period: '', description: [''], categoryId: contentCategories[0]?.id });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingExp ? `/api/experience/${editingExp.id}` : '/api/experience';
    const method = editingExp ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchExperiences();
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this experience?')) return;
    try {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExperiences();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const addDescLine = () => setFormData({ ...formData, description: [...(formData.description || []), ''] });
  const updateDescLine = (idx: number, val: string) => {
    const newDesc = [...(formData.description || [])];
    newDesc[idx] = val;
    setFormData({ ...formData, description: newDesc });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Experience</h1>
          <p className="text-slate-500">Manage your professional career history.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded">
           <button 
              onClick={() => setActiveTab('experiences')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'experiences' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Experiences
           </button>
           <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Categories
           </button>
        </div>
      </div>

      {activeTab === 'experiences' ? (
        <>
          <div className="flex justify-end">
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-bold">
              <Plus size={20} />
              Add Experience
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-md border border-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map(exp => (
                <div key={exp.id} className="bg-white p-6 rounded-md border border-slate-200 shadow-sm flex justify-between items-start group hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center border border-slate-100 text-slate-400">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{exp.company}</h3>
                        {exp.categoryName && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                            {exp.categoryName}
                          </span>
                        )}
                      </div>
                      <p className="text-indigo-600 text-sm font-medium">{exp.position}</p>
                      <p className="text-slate-400 text-xs mt-1">{exp.period}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(exp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(exp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <CategoryManager type="experience" embedded />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingExp ? 'Edit Experience' : 'Add Experience'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company</label>
                  <input type="text" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Position</label>
                  <input type="text" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Period (e.g. 2021 - Present)</label>
                  <input type="text" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined})}
                  >
                    <option value="">Select Category</option>
                    {contentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Responsibilities</label>
                  <button type="button" onClick={addDescLine} className="text-xs text-indigo-600 font-bold hover:underline">+ Add Line</button>
                </div>
                <div className="space-y-3">
                  {formData.description?.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded outline-none text-sm focus:ring-2 focus:ring-indigo-500/20" value={line} onChange={e => updateDescLine(idx, e.target.value)} placeholder="Achieved X by doing Y..."/>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, description: formData.description?.filter((_, i) => i !== idx)})}
                        className="p-2 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-bold flex items-center gap-2"><Save size={18}/> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceManager;
