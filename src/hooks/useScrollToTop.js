import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to top when route changes
 * @param {Object} options - Configuration options
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: false)
 * @param {number} options.delay - Delay before scrolling in milliseconds (default: 0)
 * @param {Array<string>} options.excludeRoutes - Routes to exclude from auto-scroll
 */
const useScrollToTop = (options = {}) => {
  const { 
    smooth = false, 
    delay = 0, 
    excludeRoutes = [] 
  } = options;
  
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if current route should be excluded
    const shouldExclude = excludeRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (!shouldExclude) {
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'instant'
        });
      };

      if (delay > 0) {
        const timer = setTimeout(scrollToTop, delay);
        return () => clearTimeout(timer);
      } else {
        scrollToTop();
      }
    }
  }, [pathname, smooth, delay, excludeRoutes]);
};

export default useScrollToTop;
