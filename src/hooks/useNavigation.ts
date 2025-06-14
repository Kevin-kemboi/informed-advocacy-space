
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface NavigationState {
  canGoBack: boolean;
  canGoForward: boolean;
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
}

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      const lastPath = newHistory[newHistory.length - 1];
      
      if (lastPath !== currentPath) {
        newHistory.push(currentPath);
        setCurrentIndex(newHistory.length - 1);
      }
      
      return newHistory.slice(-10); // Keep only last 10 entries
    });
  }, [location.pathname]);

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      navigate(navigationHistory[newIndex]);
    } else {
      navigate(-1);
    }
  };

  const goForward = () => {
    if (currentIndex < navigationHistory.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      navigate(navigationHistory[newIndex]);
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const navigationState: NavigationState = {
    canGoBack: currentIndex > 0 || navigationHistory.length > 1,
    canGoForward: currentIndex < navigationHistory.length - 1,
    currentPath: location.pathname,
    breadcrumbs: getBreadcrumbs()
  };

  return {
    ...navigationState,
    goBack,
    goForward,
    navigate
  };
}
