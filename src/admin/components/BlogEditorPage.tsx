import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, Image as ImageIcon, Globe, Search, 
  BarChart, MessageSquare, Sparkles, Loader2, CheckCircle2,
  Settings, Layout, Eye, History, Clock, Tag, ChevronRight
} from 'lucide-react';
import LexicalEditor from './LexicalEditor/LexicalEditor';
import { generateBlogContent } from '../services/geminiService';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  categoryIds: number[];
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogImageUrl: string;
}

const slugify = (text: string) => {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'i', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  
  let result = text;
  for (const key in trMap) {
    result = result.replace(new RegExp(key, 'g'), trMap[key]);
  }

  return result
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '');          // Trim - from end of text
};

const BlogEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentCategories, setContentCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1000',
    category: 'Tech',
    categoryIds: [],
    readTime: '5 min read',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    ogImageUrl: ''
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ...data,
          categoryIds: data.categories?.map((c: any) => c.id) || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/content-categories?type=blog');
      if (res.ok) {
        const data = await res.json();
        setContentCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const title = e.target.value;
    const updates: Partial<BlogPost> = { title };
    
    if (!id || !formData.slug) {
      updates.slug = slugify(title);
    }
    if (!id || !formData.metaTitle) {
      updates.metaTitle = title;
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setSaving(true);
    const url = id ? `/api/blog/${id}` : '/api/blog';
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        navigate('/blog');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 animate-pulse">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-gray-900 font-bold text-xl">Workspace is being prepared</p>
          <p className="text-gray-400 text-sm">Organizing your creative tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Navbar UI */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/blog')}
            className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded text-gray-400 hover:text-purple-600 transition-all border border-gray-100 shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Edit Story</h1>
              <ChevronRight size={16} className="text-gray-300" />
              <span className="text-xs font-black bg-amber-50 text-amber-600 px-2 py-1 rounded text-center uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Draft Saved
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1.5">
                <History size={14} className="text-gray-300" />
                Last edited 2 mins ago
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3 text-gray-600 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded transition-all font-bold text-sm">
            <Eye size={18} />
            Preview
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 bg-gray-900 text-white px-10 py-3 rounded hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 font-black text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Update Story
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Writing Experience */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-8">
            <textarea 
              rows={1}
              placeholder="Start with a bold title..."
              className="w-full text-6xl font-black bg-transparent border-none focus:ring-0 placeholder:text-gray-100 text-gray-900 resize-none overflow-hidden leading-[1.1] p-0 tracking-tight"
              value={formData.title}
              onChange={handleTitleChange}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded text-sm font-bold group focus-within:bg-white focus-within:shadow-md transition-all">
                <Globe size={16} className="text-gray-300 group-focus-within:text-purple-500 transition-colors" />
                <span className="text-gray-400">/blog/</span>
                <input 
                  type="text"
                  className="bg-transparent border-none p-0 focus:ring-0 text-purple-600 font-black min-w-[150px] placeholder:text-gray-200"
                  placeholder="your-slug-here"
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                />
              </div>
              
              <div className="flex items-center p-1.5 bg-gray-50/50 rounded border border-gray-100">
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'content' 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Layout size={16} />
                  Editor
                </button>
                <button 
                  onClick={() => setActiveTab('seo')}
                  className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === 'seo' 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Settings size={16} />
                  SEO
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'content' ? (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-700">
              <LexicalEditor 
                content={formData.content || ''}
                onChange={(content: string) => setFormData({...formData, content})}
                placeholder="Write something that matters..."
              />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-2xl">
              <div className="bg-white p-10 rounded-md border border-gray-100 space-y-10 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">SEO Strategy</h3>
                  <p className="text-gray-400 text-sm font-medium">How should your story appear to the world?</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Meta Title</label>
                    <input 
                      type="text"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded focus:bg-white focus:ring-4 focus:ring-purple-500/5 outline-none transition-all font-bold text-gray-900"
                      placeholder="Catchy title for Google..."
                      value={formData.metaTitle}
                      onChange={e => setFormData({...formData, metaTitle: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Meta Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded focus:bg-white focus:ring-4 focus:ring-purple-500/5 outline-none transition-all font-bold text-gray-900 resize-none leading-relaxed"
                      placeholder="Summarize your story in 160 characters..."
                      value={formData.metaDescription}
                      onChange={e => setFormData({...formData, metaDescription: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-10 bg-gray-50/50 rounded-md border border-gray-100 space-y-6">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Google Search Preview</p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-medium">yoursite.com › blog › {formData.slug || '...'}</p>
                    <h4 className="text-2xl text-blue-600 font-bold leading-tight hover:underline cursor-pointer">
                      {formData.metaTitle || formData.title || 'Your Story Title'}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                      {formData.metaDescription || 'Add a meta description to see how your story will look in search results.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-md border border-gray-100 shadow-sm space-y-10">
            <div className="space-y-8">
              {/* Cover Image Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Story Cover</label>
                <div className="aspect-[4/3] rounded overflow-hidden bg-gray-50 border border-gray-100 group relative shadow-inner">
                  <img src={formData.imageUrl} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:blur-[2px]" alt="Cover" />
                  <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => {
                        const url = window.prompt('Image URL', formData.imageUrl);
                        if (url) setFormData({...formData, imageUrl: url});
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-white rounded text-gray-900 font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      <ImageIcon size={16} />
                      Replace
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Category</label>
                <div className="flex flex-wrap gap-2.5">
                  {contentCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const ids = new Set(formData.categoryIds || []);
                        if (ids.has(cat.id)) ids.delete(cat.id);
                        else ids.add(cat.id);
                        setFormData({ ...formData, categoryIds: Array.from(ids) });
                      }}
                      className={`px-5 py-2.5 rounded text-xs font-black transition-all border uppercase tracking-widest ${
                        formData.categoryIds?.includes(cat.id)
                          ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-100 scale-105'
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-purple-200 hover:text-purple-500 hover:bg-white'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Read Time Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Reading Time</label>
                <div className="relative group">
                  <input 
                    type="text"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-md text-sm font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-purple-500/5 transition-all outline-none"
                    value={formData.readTime}
                    onChange={e => setFormData({...formData, readTime: e.target.value})}
                  />
                  <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-[#fcfaff] p-10 rounded-md border border-purple-100/50 space-y-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 text-purple-100/50 rotate-12 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-[20deg]">
              <Sparkles size={180} />
            </div>
            
            <div className="relative space-y-6">
              <div className="flex items-center gap-3 text-purple-700 font-black text-xs uppercase tracking-[0.2em]">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <BarChart size={16} />
                </div>
                <span>Story Insight</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-black text-sm">Readability</span>
                  <span className="text-purple-600 font-black text-sm">92%</span>
                </div>
                <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div className="w-[92%] h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-4">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Synced to cloud
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorPage;
