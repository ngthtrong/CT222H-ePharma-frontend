import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Enhanced ScrollToTop component with more options
 * @param {Object} props - Component props
 * @param {boolean} props.smooth - Whether to use smooth scrolling
 * @param {number} props.delay - Delay before scrolling in milliseconds
 * @param {Array<string>} props.excludeRoutes - Routes to exclude from auto-scroll
 */
const ScrollToTopAdvanced = ({ 
  smooth = false, 
  delay = 0, 
  excludeRoutes = [] 
}) => {
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

  return null;
};

export default ScrollToTopAdvanced;
