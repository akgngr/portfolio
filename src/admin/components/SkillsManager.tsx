import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Zap, Loader2, Code, Server, PenTool, Wrench, Edit2, X, Check, FolderPlus, FolderEdit, Settings2 } from 'lucide-react';
import { generateSkillsList } from '../services/geminiService';

interface Skill {
  id: string;
  name: string;
  category: string;
  categoryId: number;
  level: number;
  icon?: string;
  description?: string;
  categoryName?: string;
}

interface SkillCategory {
  id: number;
  name: string;
  icon?: string;
  sortOrder: number;
}

const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'categories'>('skills');
  
  // Skill form state
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({ level: 50 });
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Category form state
  const [newCategory, setNewCategory] = useState<Partial<SkillCategory>>({ sortOrder: 0 });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [roleInput, setRoleInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [skillsRes, catsRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/categories')
      ]);
      
      if (skillsRes.ok && catsRes.ok) {
        const skillsData = await skillsRes.json();
        const catsData = await catsRes.json();
        setSkills(skillsData);
        setCategories(catsData);
        
        if (catsData.length > 0 && !newSkill.categoryId) {
          setNewSkill(prev => ({ ...prev, categoryId: catsData[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name || !newSkill.categoryId) return;
    
    // Find category name for backward compatibility if needed
    const cat = categories.find(c => c.id === Number(newSkill.categoryId));
    const payload = { ...newSkill, category: cat?.name || '' };

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
        setNewSkill({ categoryId: categories[0]?.id, level: 50, name: '' });
      }
    } catch (error) {
      console.error('Add skill failed:', error);
    }
  };

  const handleUpdateSkill = async (id: string, data: Partial<Skill>) => {
    const cat = categories.find(c => c.id === Number(data.categoryId));
    const payload = { ...data, category: cat?.name || '' };
    
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingSkillId(null);
        fetchData();
      }
    } catch (error) {
      console.error('Update skill failed:', error);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      if (res.ok) {
        fetchData();
        setNewCategory({ sortOrder: 0, name: '' });
      }
    } catch (error) {
      console.error('Add category failed:', error);
    }
  };

  const handleUpdateCategory = async (id: number, data: Partial<SkillCategory>) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setEditingCategoryId(null);
        fetchData();
      }
    } catch (error) {
      console.error('Update category failed:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category? Skills in this category will become uncategorized.')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleAiGenerate = async () => {
    if (!roleInput || categories.length === 0) return;
    setIsGenerating(true);
    try {
      const generatedSkills = await generateSkillsList(roleInput);
      for (const s of generatedSkills) {
        // Try to match generated category to our categories
        const catMatch = categories.find(c => c.name.toLowerCase() === s.category.toLowerCase()) || categories[0];
        
        await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: s.name,
            categoryId: catMatch.id,
            category: catMatch.name,
            level: s.proficiency,
            description: s.description
          })
        });
      }
      fetchData();
      setRoleInput('');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryIcon = (catName: string) => {
    const lowerCat = catName.toLowerCase();
    if (lowerCat.includes('front')) return <Code size={16} className="text-blue-500" />;
    if (lowerCat.includes('back')) return <Server size={16} className="text-green-500" />;
    if (lowerCat.includes('design')) return <PenTool size={16} className="text-pink-500" />;
    return <Wrench size={16} className="text-slate-500" />;
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Skills & Categories</h1>
            <p className="text-slate-500">Manage your technical expertise and group them by categories.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('skills')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'skills' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Skills
             </button>
             <button 
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Categories
             </button>
          </div>
       </div>

       {activeTab === 'skills' ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     {loading ? (
                       <div className="space-y-4">
                         {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
                       </div>
                     ) : categories.map(category => {
                         const catSkills = skills.filter(s => s.categoryId === category.id || s.categoryName === category.name);
                         if (catSkills.length === 0) return null;
                         
                         return (
                             <div key={category.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                 <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                    {getCategoryIcon(category.name)}
                                    <h3 className="font-semibold text-slate-700 capitalize">{category.name}</h3>
                                 </div>
                                 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {catSkills.map(skill => (
                                        <div key={skill.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors group">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-medium text-slate-800">{skill.name}</span>
                                                    <span className="text-xs text-slate-500">{skill.level}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full bg-indigo-500" 
                                                        style={{ width: `${skill.level}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="ml-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleDeleteSkill(skill.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                         );
                     })}
                </div>

                <div className="space-y-6">
                    {/* Add Skill Manual */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" />
                            Add New Skill
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Skill Name</label>
                                <input 
                                    type="text" 
                                    value={newSkill.name || ''}
                                    onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="e.g. Next.js"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Category</label>
                                    <select 
                                        value={newSkill.categoryId}
                                        onChange={e => setNewSkill({...newSkill, categoryId: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Level (%)</label>
                                    <input 
                                        type="number" 
                                        value={newSkill.level}
                                        onChange={e => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        min="0" max="100"
                                    />
                                 </div>
                            </div>
                            <button 
                                onClick={handleAddSkill}
                                disabled={!newSkill.name || !newSkill.categoryId}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                Add Skill
                            </button>
                        </div>
                    </div>

                    {/* AI Import */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-xl shadow-lg text-white">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-300" />
                            AI Skill Generator
                        </h3>
                        <p className="text-indigo-100 text-sm mb-4">Enter a job role and Gemini will suggest relevant skills.</p>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={roleInput}
                                onChange={e => setRoleInput(e.target.value)}
                                placeholder="e.g. UX Designer"
                                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm placeholder-indigo-200 text-white focus:outline-none focus:bg-white/20"
                            />
                            <button 
                                onClick={handleAiGenerate}
                                disabled={isGenerating || !roleInput || categories.length === 0}
                                className="px-3 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-70"
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
           </div>
       ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Category Name</th>
                                <th className="px-6 py-4">Sort Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.map(category => (
                                <tr key={category.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {editingCategoryId === category.id ? (
                                            <input 
                                                type="text" 
                                                defaultValue={category.name}
                                                className="px-2 py-1 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                onBlur={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(category.name)}
                                                <span className="font-medium text-slate-800">{category.name}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingCategoryId === category.id ? (
                                            <input 
                                                type="number" 
                                                defaultValue={category.sortOrder}
                                                className="w-16 px-2 py-1 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                onBlur={(e) => handleUpdateCategory(category.id, { sortOrder: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <span className="text-slate-500 text-sm">{category.sortOrder}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => setEditingCategoryId(category.id)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <FolderPlus size={18} className="text-indigo-600" />
                        Add New Category
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Category Name</label>
                            <input 
                                type="text" 
                                value={newCategory.name || ''}
                                onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="e.g. Cloud"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Sort Order</label>
                            <input 
                                type="number" 
                                value={newCategory.sortOrder}
                                onChange={e => setNewCategory({...newCategory, sortOrder: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="0"
                            />
                        </div>
                        <button 
                            onClick={handleAddCategory}
                            disabled={!newCategory.name}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            Create Category
                        </button>
                    </div>
                </div>
           </div>
       )}
    </div>
  );
};

export default SkillsManager;
