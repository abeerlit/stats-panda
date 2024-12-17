// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll both window and any containers to top
    window.scrollTo(0, 0);

    // Get the main content element
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }

    // Handle any other scrollable containers
    document.querySelectorAll('.content-wrapper').forEach((element) => {
      element.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
