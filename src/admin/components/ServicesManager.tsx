import React, { useState } from 'react';
import { Plus, X, Wand2, Loader2, GripVertical } from 'lucide-react';
import type { Service } from '../types';
import { enhanceServiceDescription } from '../services/geminiService';

const MOCK_SERVICES: Service[] = [
  { id: '1', title: 'Web Development', description: 'Building high-performance, responsive websites using React and modern frameworks.', icon: 'monitor' },
  { id: '2', title: 'UI/UX Design', description: 'Creating intuitive and beautiful user interfaces.', icon: 'layout' },
];

const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);

  const startEdit = (service?: Service) => {
    if (service) {
      setIsEditing(service.id);
      setEditForm(service);
    } else {
      setIsEditing('new');
      setEditForm({});
    }
  };

  const handleSave = () => {
    if (!editForm.title || !editForm.description) return;
    
    if (isEditing === 'new') {
      const newService: Service = {
        id: Date.now().toString(),
        title: editForm.title!,
        description: editForm.description!,
        icon: editForm.icon || 'circle',
      };
      setServices([...services, newService]);
    } else {
      setServices(services.map(s => (s.id === isEditing ? { ...s, ...editForm } as Service : s)));
    }
    setIsEditing(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleOptimize = async () => {
      if (!editForm.description) return;
      setIsOptimizing(true);
      const optimized = await enhanceServiceDescription(editForm.description);
      setEditForm(prev => ({ ...prev, description: optimized }));
      setIsOptimizing(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                <p className="text-slate-500">Manage your service offerings.</p>
             </div>
             <button 
                onClick={() => startEdit()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
             >
                <Plus size={18} />
                Add Service
             </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(service)} className="text-slate-400 hover:text-indigo-600 p-1"><Wand2 size={16} /></button>
                        <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-red-600 p-1"><X size={16} /></button>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        <span className="font-bold text-xl">{service.title.charAt(0)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{service.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
                </div>
            ))}
        </div>

        {/* Edit Modal (Inline/Overlay) */}
        {isEditing && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">{isEditing === 'new' ? 'New Service' : 'Edit Service'}</h3>
                        <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Service Title</label>
                            <input 
                                type="text" 
                                value={editForm.title || ''}
                                onChange={e => setEditForm({...editForm, title: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <button 
                                    onClick={handleOptimize}
                                    disabled={!editForm.description || isOptimizing}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                    {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                    Optimize
                                </button>
                             </div>
                            <textarea 
                                value={editForm.description || ''}
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            ></textarea>
                        </div>
                        <button 
                            onClick={handleSave}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Save Service
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ServicesManager;