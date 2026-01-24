import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryManager from './CategoryManager';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
  category: string;
  categoryIds?: number[];
  categories?: any[];
  readTime: string;
}

const BlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Manager</h1>
          <p className="text-slate-500">Write and manage your articles.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded">
           <button 
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'posts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Articles
           </button>
           <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
              Categories
           </button>
        </div>
      </div>

      {activeTab === 'posts' ? (
        <>
          {/* Quick Action Card */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-md p-8 text-white shadow-xl shadow-indigo-200/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-yellow-300" />
                <h2 className="text-2xl font-black italic">Start Your Next Masterpiece</h2>
              </div>
              <p className="text-indigo-100 font-medium">Use our new Notion-like editor to write beautiful articles with ease.</p>
            </div>
            <button 
              onClick={() => navigate('/blog/new')}
              className="bg-white text-indigo-600 px-8 py-4 rounded font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Write Article
            </button>
          </div>

          {/* Search & Stats */}
          <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Showing {filteredPosts.length} articles
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-xl hover:shadow-indigo-100 transition-all hover:-translate-y-1">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => navigate(`/blog/edit/${post.id}`)}
                        className="p-2 bg-white/90 backdrop-blur shadow-sm rounded text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 bg-white/90 backdrop-blur shadow-sm rounded text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {post.categories?.map(c => (
                        <span key={c.id} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-slate-800 line-clamp-2 min-h-[3rem] group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {post.date}
                      </div>
                      <div className="uppercase tracking-widest text-[10px]">
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <CategoryManager type="blog" embedded />
      )}
    </div>
  );
};

export default BlogManager;
