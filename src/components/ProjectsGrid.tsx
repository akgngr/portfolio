import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  category: string;
}

interface ProjectsGridProps {
  projects: Project[];
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Web', 'Mobile', 'Open Source'];

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 justify-start mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-all border
              ${filter === cat 
                ? 'bg-white text-[#1a1d29] border-white' 
                : 'bg-transparent text-[#8b8d98] border-white/10 hover:border-white/30 hover:text-white'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <a 
            key={project.id}
            href={`/projects/${project.id}`}
            className="bg-[#23262f]/20 border border-white/5 rounded-2xl overflow-hidden flex flex-col group h-full cursor-pointer hover:border-white/10 transition-all duration-300"
          >
            <div className="h-[240px] w-full overflow-hidden relative border-b border-white/5">
              <div className="absolute inset-0 bg-[#1a1d29]/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
              <img 
                src={project.imageUrl} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 z-20 bg-[#1a1d29]/80 backdrop-blur-sm text-[#5a5c66] text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border border-white/10">
                {project.category}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                   <div className="bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20">
                       <ArrowUpRight className="text-white" size={24} />
                   </div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col bg-[#23262f]/30 group-hover:bg-[#23262f]/50 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {project.title}
              </h3>
              <p className="text-[#8b8d98] text-sm leading-relaxed mb-6 flex-1 line-clamp-2">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs font-medium text-[#5a5c66] bg-white/5 px-2 py-1 rounded border border-white/5">
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                    <span className="text-xs font-medium text-[#5a5c66] bg-white/5 px-2 py-1 rounded border border-white/5">
                      +{project.tags.length - 3}
                    </span>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-sm font-semibold text-[#6366F1]">
                  View Case Study <ArrowUpRight size={14} className="ml-1" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ProjectsGrid;
