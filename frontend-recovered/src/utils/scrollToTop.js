/**
 * Utility function to smoothly scroll to the top of the page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Wrapper component that scrolls to top when path changes
 */
export const ScrollToTop = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  return children || null;
};
