import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for analytics management
 * Handles Google Analytics 4 integration, event tracking, conversion tracking, and performance monitoring
 */
export const useAnalytics = () => {
  const location = useLocation();
  const sessionStartTime = useRef(Date.now());
  const pageStartTime = useRef(Date.now());
  const scrollDepth = useRef(0);
  const maxScrollDepth = useRef(0);
  const isScrollTracking = useRef(false);

  // Check if gtag is available
  const isGtagAvailable = () => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  };

  // Track page views
  const trackPageView = useCallback((path = location.pathname, title = document.title) => {
    if (!isGtagAvailable()) return;

    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;

    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title,
      custom_map: {
        custom_parameter_1: 'user_engagement_level'
      }
    });

    // Track page view event
    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: window.location.href,
      page_path: path,
      content_group1: getContentGroup(path),
      content_group2: getPageType(path)
    });
  }, [location.pathname]);

  // Get content group based on path
  const getContentGroup = (path) => {
    if (path.startsWith('/blog')) return 'Blog';
    if (path.startsWith('/category')) return 'Category';
    if (path === '/bookmarks') return 'Bookmarks';
    if (path === '/about') return 'About';
    if (path === '/contact') return 'Contact';
    return 'Main';
  };

  // Get page type based on path
  const getPageType = (path) => {
    if (path === '/') return 'Homepage';
    if (path.startsWith('/blog/') && path !== '/blog') return 'Blog Post';
    if (path.startsWith('/category/')) return 'Category Page';
    if (path.startsWith('/programmatic/')) return 'Programmatic Page';
    return 'Static Page';
  };

  // Track custom events
  const trackEvent = useCallback((eventName, parameters = {}) => {
    if (!isGtagAvailable()) return;

    const eventData = {
      event_category: parameters.category || 'engagement',
      event_label: parameters.label || '',
      value: parameters.value || 0,
      custom_parameter_1: parameters.custom1 || '',
      custom_parameter_2: parameters.custom2 || '',
      page_path: location.pathname,
      timestamp: Date.now(),
      ...parameters
    };

    window.gtag('event', eventName, eventData);
  }, [location.pathname]);

  // Track user interactions
  const trackClick = useCallback((element, category = 'click') => {
    trackEvent('click', {
      category,
      label: element,
      element_type: 'button',
      interaction_type: 'click'
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm, resultsCount = 0) => {
    trackEvent('search', {
      search_term: searchTerm,
      category: 'search',
      label: searchTerm,
      value: resultsCount,
      results_count: resultsCount
    });
  }, [trackEvent]);

  const trackBookmark = useCallback((websiteUrl, action = 'add') => {
    trackEvent('bookmark', {
      category: 'bookmark',
      label: websiteUrl,
      action,
      website_url: websiteUrl
    });
  }, [trackEvent]);

  const trackShare = useCallback((platform, url, title) => {
    trackEvent('share', {
      category: 'social',
      label: platform,
      platform,
      shared_url: url,
      shared_title: title
    });
  }, [trackEvent]);

  const trackDownload = useCallback((fileName, fileType) => {
    trackEvent('file_download', {
      category: 'download',
      label: fileName,
      file_name: fileName,
      file_type: fileType
    });
  }, [trackEvent]);

  const trackFormSubmission = useCallback((formName, success = true) => {
    trackEvent('form_submit', {
      category: 'form',
      label: formName,
      form_name: formName,
      success: success ? 'true' : 'false'
    });
  }, [trackEvent]);

  // Track scroll depth
  const trackScrollDepth = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

    scrollDepth.current = scrollPercent;

    if (scrollPercent > maxScrollDepth.current) {
      maxScrollDepth.current = scrollPercent;

      // Track milestone scroll depths
      const milestones = [25, 50, 75, 90, 100];
      const milestone = milestones.find(m => scrollPercent >= m && maxScrollDepth.current < m);
      
      if (milestone) {
        trackEvent('scroll', {
          category: 'engagement',
          label: `${milestone}%`,
          value: milestone,
          scroll_depth: milestone
        });
      }
    }
  }, [trackEvent]);

  // Track time on page
  const trackTimeOnPage = useCallback(() => {
    const timeSpent = Math.round((Date.now() - pageStartTime.current) / 1000);
    
    if (timeSpent > 0) {
      trackEvent('time_on_page', {
        category: 'engagement',
        label: location.pathname,
        value: timeSpent,
        time_spent: timeSpent
      });
    }
  }, [trackEvent, location.pathname]);

  // Track conversion events
  const trackConversion = useCallback((conversionType, value = 0, currency = 'USD') => {
    if (!isGtagAvailable()) return;

    window.gtag('event', 'conversion', {
      send_to: 'GA_MEASUREMENT_ID',
      value: value,
      currency: currency,
      conversion_type: conversionType,
      page_path: location.pathname
    });

    // Also track as custom event
    trackEvent('conversion', {
      category: 'conversion',
      label: conversionType,
      value: value,
      conversion_type: conversionType,
      currency: currency
    });
  }, [trackEvent, location.pathname]);

  // Track user engagement level
  const trackEngagement = useCallback((level = 'medium') => {
    trackEvent('user_engagement', {
      category: 'engagement',
      label: level,
      engagement_level: level,
      session_duration: Math.round((Date.now() - sessionStartTime.current) / 1000),
      max_scroll_depth: maxScrollDepth.current
    });
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback((errorMessage, errorType = 'javascript') => {
    trackEvent('exception', {
      description: errorMessage,
      fatal: false,
      category: 'error',
      error_type: errorType,
      error_message: errorMessage
    });
  }, [trackEvent]);

  // Track performance metrics
  const trackPerformance = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = window.performance.getEntriesByType('navigation')[0];
    if (!navigation) return;

    const metrics = {
      page_load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      first_paint: Math.round(navigation.responseEnd - navigation.fetchStart),
      dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcp_connect: Math.round(navigation.connectEnd - navigation.connectStart)
    };

    trackEvent('page_performance', {
      category: 'performance',
      label: location.pathname,
      value: metrics.page_load_time,
      ...metrics
    });
  }, [trackEvent, location.pathname]);

  // Set up scroll tracking
  useEffect(() => {
    if (typeof window === 'undefined' || isScrollTracking.current) return;

    const handleScroll = () => trackScrollDepth();
    window.addEventListener('scroll', handleScroll, { passive: true });
    isScrollTracking.current = true;

    return () => {
      window.removeEventListener('scroll', handleScroll);
      isScrollTracking.current = false;
    };
  }, [trackScrollDepth]);

  // Track page view on route change
  useEffect(() => {
    trackPageView();
    
    // Track performance metrics after a short delay
    const performanceTimer = setTimeout(() => {
      trackPerformance();
    }, 1000);

    // Track time on page when leaving
    return () => {
      clearTimeout(performanceTimer);
      trackTimeOnPage();
    };
  }, [location.pathname, trackPageView, trackPerformance, trackTimeOnPage]);

  // Set up error tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event) => {
      trackError(event.error?.message || 'Unknown error', 'javascript');
    };

    const handleUnhandledRejection = (event) => {
      trackError(event.reason?.message || 'Promise rejection', 'promise');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  // Enhanced user identification
  const identifyUser = useCallback((userId, userProperties = {}) => {
    if (!isGtagAvailable()) return;

    window.gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
      custom_map: {
        custom_parameter_1: 'user_type',
        custom_parameter_2: 'user_segment'
      }
    });

    // Set user properties
    window.gtag('set', {
      user_id: userId,
      user_properties: userProperties
    });
  }, []);

  return {
    // Core tracking functions
    trackPageView,
    trackEvent,
    
    // Interaction tracking
    trackClick,
    trackSearch,
    trackBookmark,
    trackShare,
    trackDownload,
    trackFormSubmission,
    
    // Engagement tracking
    trackScrollDepth,
    trackTimeOnPage,
    trackEngagement,
    
    // Conversion tracking
    trackConversion,
    
    // Error and performance tracking
    trackError,
    trackPerformance,
    
    // User management
    identifyUser,
    
    // Utility functions
    isGtagAvailable,
    getContentGroup,
    getPageType,
    
    // Current state
    currentScrollDepth: scrollDepth.current,
    maxScrollDepth: maxScrollDepth.current
  };
};

export default useAnalytics;
