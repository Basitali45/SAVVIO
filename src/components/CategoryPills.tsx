import React from 'react';
import { Category } from '../types.ts';

interface CategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const allTabs = [
    { id: 'all', name: 'All Products', slug: 'all' },
    ...categories.filter((c) => c.is_active),
  ];

  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-none">
      <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-3 px-4 min-w-max">
        {allTabs.map((tab) => {
          const isActive = activeCategory === tab.slug;
          return (
            <button
              key={tab.slug}
              onClick={() => onSelectCategory(tab.slug)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-neutral-950 text-white shadow-md scale-105'
                  : 'bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800'
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
