import React, { useState } from 'react';
import { Trash2, Plus, Zap, Loader2, Code, Server, PenTool, Wrench } from 'lucide-react';
import type { Skill } from '../types';
import { generateSkillsList } from '../services/geminiService';

const MOCK_SKILLS: Skill[] = [
  { id: '1', name: 'React', category: 'frontend', proficiency: 90 },
  { id: '2', name: 'TypeScript', category: 'frontend', proficiency: 85 },
  { id: '3', name: 'Node.js', category: 'backend', proficiency: 75 },
  { id: '4', name: 'Figma', category: 'design', proficiency: 80 },
];

const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({ category: 'frontend', proficiency: 50 });
  const [roleInput, setRoleInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAdd = () => {
    if (!newSkill.name) return;
    setSkills([...skills, { ...newSkill, id: Date.now().toString() } as Skill]);
    setNewSkill({ category: 'frontend', proficiency: 50, name: '' });
  };

  const handleDelete = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleAiGenerate = async () => {
      if (!roleInput) return;
      setIsGenerating(true);
      const generatedSkills = await generateSkillsList(roleInput);
      const formattedSkills = generatedSkills.map((s, i) => ({
          ...s,
          id: (Date.now() + i).toString(),
          category: s.category as any
      }));
      setSkills(prev => [...prev, ...formattedSkills]);
      setIsGenerating(false);
      setRoleInput('');
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'frontend': return <Code size={16} className="text-blue-500" />;
        case 'backend': return <Server size={16} className="text-green-500" />;
        case 'design': return <PenTool size={16} className="text-pink-500" />;
        default: return <Wrench size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills & Technologies</h1>
          <p className="text-slate-500">Showcase your technical expertise.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 {/* Skill List Grouped */}
                 {['frontend', 'backend', 'design', 'tools'].map(category => {
                     const catSkills = skills.filter(s => s.category === category);
                     if (catSkills.length === 0) return null;
                     
                     return (
                         <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                             <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                {getCategoryIcon(category)}
                                <h3 className="font-semibold text-slate-700 capitalize">{category}</h3>
                             </div>
                             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {catSkills.map(skill => (
                                    <div key={skill.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors group">
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium text-slate-800">{skill.name}</span>
                                                <span className="text-xs text-slate-500">{skill.proficiency}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        category === 'frontend' ? 'bg-blue-500' : 
                                                        category === 'backend' ? 'bg-green-500' :
                                                        category === 'design' ? 'bg-pink-500' : 'bg-slate-500'
                                                    }`} 
                                                    style={{ width: `${skill.proficiency}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(skill.id)}
                                            className="ml-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                             </div>
                         </div>
                     );
                 })}
            </div>

            <div className="space-y-6">
                {/* Add Manual */}
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
                                    value={newSkill.category}
                                    onChange={e => setNewSkill({...newSkill, category: e.target.value as any})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                >
                                    <option value="frontend">Frontend</option>
                                    <option value="backend">Backend</option>
                                    <option value="design">Design</option>
                                    <option value="tools">Tools</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Proficiency</label>
                                <input 
                                    type="number" 
                                    value={newSkill.proficiency}
                                    onChange={e => setNewSkill({...newSkill, proficiency: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    min="0" max="100"
                                />
                             </div>
                        </div>
                        <button 
                            onClick={handleAdd}
                            disabled={!newSkill.name}
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
                    <p className="text-indigo-100 text-sm mb-4">Enter a job role (e.g. "Full Stack Developer") and Gemini will suggest relevant skills.</p>
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
                            disabled={isGenerating || !roleInput}
                            className="px-3 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-70"
                        >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        </button>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default SkillsManager;