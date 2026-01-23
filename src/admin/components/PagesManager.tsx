import React from 'react';
import { ExternalLink, Edit } from 'lucide-react';

const PagesManager: React.FC = () => {
    const pages = [
        { id: 1, name: 'Home', slug: '/', status: 'Published', lastUpdated: '2 days ago' },
        { id: 2, name: 'About Me', slug: '/about', status: 'Published', lastUpdated: '1 month ago' },
        { id: 3, name: 'Contact', slug: '/contact', status: 'Published', lastUpdated: '3 months ago' },
        { id: 4, name: 'Portfolio Detail', slug: '/portfolio/:id', status: 'Published', lastUpdated: '1 week ago' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
                <p className="text-slate-500">Manage structure and SEO settings for your site pages.</p>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Page Name</th>
                            <th className="px-6 py-4">URL Slug</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Updated</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pages.map(page => (
                            <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{page.name}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm font-mono">{page.slug}</td>
                                <td className="px-6 py-4">
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {page.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{page.lastUpdated}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-4">Edit</button>
                                    <button className="text-slate-400 hover:text-slate-600"><ExternalLink size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PagesManager;
