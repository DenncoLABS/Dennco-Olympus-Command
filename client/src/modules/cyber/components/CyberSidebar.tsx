import React from 'react';
import { useCyberStore } from '../cyber.store';
import { CYBER_CONFIG } from '../config';

export const CyberSidebar: React.FC = () => {
  const activeCategory = useCyberStore((s) => s.activeCategory);
  const setActiveCategory = useCyberStore((s) => s.setActiveCategory);
  const setActiveEndpoint = useCyberStore((s) => s.setActiveEndpoint);

  const handleCategoryClick = (categoryId: string) => {
    const cat = CYBER_CONFIG.find((c) => c.id === categoryId);
    if (cat && cat.endpoints.length > 0) {
      setActiveCategory(categoryId);
      setActiveEndpoint(cat.endpoints[0].path);
    }
  };

  return (
    <div className="w-[220px] shrink-0 flex flex-col gap-1 h-full bg-intel-panel/90 backdrop-blur-md border border-intel-accent/20 px-3 py-4 rounded shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar pointer-events-auto">
      <p className="text-intel-text-light/30 font-mono text-[10px] tracking-[0.2em] uppercase px-2 mb-2">
        Intelligence Domain
      </p>
      {CYBER_CONFIG.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className="flex items-center gap-3 text-left px-3 py-2.5 rounded transition-all duration-200 group"
            style={{
              background: isActive ? `${cat.color}18` : 'transparent',
              border: `1px solid ${isActive ? cat.color + '55' : 'transparent'}`,
              boxShadow: isActive ? `0 0 12px ${cat.color}22` : 'none',
            }}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span
              className="font-mono text-xs tracking-wider transition-colors"
              style={{ color: isActive ? cat.color : undefined }}
              {...(!isActive && {
                className:
                  'font-mono text-xs tracking-wider text-intel-text-light/50 group-hover:text-intel-text-light transition-colors',
              })}
            >
              {cat.name}
            </span>
            {isActive && (
              <span
                className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
