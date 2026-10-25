import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Initialize Google Analytics
const initializeGA = () => {
  // Replace with your actual Google Analytics Measurement ID
  const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID';
  
  if (typeof window !== 'undefined' && !window.gtag) {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: title,
      page_location: url,
    });
  }
};

// Track events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track conversions
export const trackConversion = (conversionId, conversionLabel) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${conversionId}/${conversionLabel}`,
    });
  }
};

// Track website clicks
export const trackWebsiteClick = (websiteName, category, url) => {
  trackEvent('click', 'website', `${category} - ${websiteName}`, 1);
  trackEvent('outbound_link', 'engagement', url, 1);
};

// Track search events
export const trackSearch = (searchTerm, category, resultsCount) => {
  trackEvent('search', 'site_search', searchTerm, resultsCount);
  if (category) {
    trackEvent('search_category', 'site_search', category, 1);
  }
};

// Track bookmark events
export const trackBookmark = (action, websiteName, category) => {
  trackEvent(action, 'bookmark', `${category} - ${websiteName}`, 1);
};

// Track category views
export const trackCategoryView = (categoryName, websiteCount) => {
  trackEvent('view_category', 'navigation', categoryName, websiteCount);
};

// Track user engagement
export const trackEngagement = (action, element, duration) => {
  trackEvent(action, 'engagement', element, duration);
};

// Analytics component
export const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on component mount
    initializeGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    const url = window.location.origin + location.pathname + location.search;
    const title = document.title;
    trackPageView(url, title);
  }, [location]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        trackEvent('scroll_depth', 'engagement', `${scrollPercent}%`, scrollPercent);
      }
    };

    window.addEventListener('scroll', trackScrollDepth);
    return () => window.removeEventListener('scroll', trackScrollDepth);
  }, [location]);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      if (timeOnPage > 10) { // Only track if user spent more than 10 seconds
        trackEvent('time_on_page', 'engagement', location.pathname, timeOnPage);
      }
    };
  }, [location]);

  return null; // This component doesn't render anything
};

// Custom hook for analytics
export const useAnalytics = () => {
  return {
    trackPageView,
    trackEvent,
    trackConversion,
    trackWebsiteClick,
    trackSearch,
    trackBookmark,
    trackCategoryView,
    trackEngagement,
  };
};

export default Analytics;
