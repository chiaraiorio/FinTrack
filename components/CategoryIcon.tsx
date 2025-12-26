
import React from 'react';
import { CATEGORY_ICON_PATHS } from '../constants';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  color?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = "w-6 h-6", color = "currentColor" }) => {
  const path = CATEGORY_ICON_PATHS[iconName] || CATEGORY_ICON_PATHS['generic'];
  
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke={color} 
      viewBox="0 0 24 24" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
};

export default CategoryIcon;
