import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeGestures } from './useGestures';

export interface NavigationSection {
  id: string;
  path: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const useMobileNavigation = (sections: NavigationSection[]) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentSectionIndex = sections.findIndex(
    section => location.pathname.startsWith(section.path)
  );

  const navigateToSection = useCallback((index: number) => {
    if (index >= 0 && index < sections.length) {
      navigate(sections[index].path);
    }
  }, [navigate, sections]);

  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      const nextIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
      if (nextIndex !== currentSectionIndex) {
        navigateToSection(nextIndex);
      }
    },
    onSwipeRight: () => {
      const prevIndex = Math.max(currentSectionIndex - 1, 0);
      if (prevIndex !== currentSectionIndex) {
        navigateToSection(prevIndex);
      }
    },
  }, { enableVertical: false });

  return {
    currentSectionIndex,
    navigateToSection,
    swipeGestures,
    sections,
  };
};