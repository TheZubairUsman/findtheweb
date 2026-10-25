import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGitHubUser } from '../hooks/useGitHub';
import { useAnalytics } from '../hooks/useAnalytics';
import GitHubStarsChip from './GitHubStarsChip';
import SocialShare from './SocialShare';
import websites from '../data/websites.json';
import { scrollToTop } from '../utils/scrollToTop';

const Footer = () => {
  const { userData } = useGitHubUser('TheZubairUsman');
  const { trackClick } = useAnalytics();
  const location = useLocation();
  const totalWebsites = websites.length;

  const handleLinkClick = (linkType, linkData, e) => {
    e.preventDefault();
    trackClick('footer_link_click', {
      linkType,
      ...linkData,
      source: 'footer'
    });
    
    // Scroll to top before navigation
    scrollToTop();
    
    // Navigate after a small delay to ensure smooth scroll
    setTimeout(() => {
      window.location.href = linkData.href;
    }, 100);
  };

  // Generate structured data for the footer
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FindTheWeb",
    "url": "https://findtheweb.zus3cu.tech",
    "logo": "https://findtheweb.zus3cu.tech/logo.png",
    "description": "Your ultimate curated collection of the best websites, tools, and resources across the internet.",
    "founder": {
      "@type": "Person",
      "name": "TheZubairUsman",
      "url": "https://github.com/TheZubairUsman"
    },
    "sameAs": [
      "https://github.com/TheZubairUsman"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://findtheweb.zus3cu.tech/contact"
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
    { name: 'Sitemap', href: '/sitemap' }
  ];

  return (
    <>
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />
      
      <footer 
        className="bg-white dark:bg-gray-900 dark:border-gray-700"
        role="contentinfo"
        itemScope
        itemType="https://schema.org/WPFooter"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
            {/* About Section */}
            <div className="space-y-4">
              <h2 
                className="text-lg font-bold text-gray-900 dark:text-white"
                itemProp="name"
              >
                About FindTheWeb
              </h2>
              <p 
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                itemProp="description"
              >
                Your ultimate curated collection of the best websites, tools, and resources across the internet. 
                Discover, save, and organize your favorite web resources in one place.
              </p>
              <div className="text-center w-full max-w-xs bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Our Collection
                </h3>
                <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                  {totalWebsites}+
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Curated Websites
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Quick Links
              </h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors duration-200 focus-visible:focus"
                        onClick={(e) => handleLinkClick('quick_link', { name: link.name, href: link.href }, e)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Legal
              </h3>
              <nav aria-label="Legal links">
                <ul className="space-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors duration-200 focus-visible:focus"
                        onClick={(e) => handleLinkClick('legal_link', { name: link.name, href: link.href }, e)}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Author & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Created by
              </h3>
              <div className="flex items-start space-x-3" itemScope itemType="https://schema.org/Person">
                {userData?.avatar_url && (
                  <img
                    src={userData.avatar_url}
                    alt={`${userData.name || 'TheZubairUsman'} profile picture`}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 seo-image"
                    loading="lazy"
                    itemProp="image"
                    width="48"
                    height="48"
                  />
                )}
                <div className="flex-1">
                  <p 
                    className="font-medium text-gray-900 dark:text-white text-sm"
                    itemProp="name"
                  >
                    {userData?.name || 'TheZubairUsman'}
                  </p>
                  <p 
                    className="text-xs text-gray-500 dark:text-gray-400 mb-2"
                    itemProp="jobTitle"
                  >
                    Cybersecurity | QA Automation | AI + SaaS Dev | Prompt Engineer | Freelancer for Hire
                  </p>
                  <a
                    href={userData?.html_url || 'https://github.com/TheZubairUsman'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center focus-visible:focus"
                    onClick={() => handleLinkClick('github_profile', { url: userData?.html_url || 'https://github.com/TheZubairUsman' })}
                    itemProp="url"
                    aria-label="Visit TheZubairUsman's GitHub profile"
                  >
                    @TheZubairUsman
                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  &copy; {new Date().getFullYear()} FindTheWeb. All rights reserved.
                </p>
                <a 
                  href="https://www.fiverr.com/scoltech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-200 focus-visible:focus"
                  onClick={() => handleLinkClick('developer_link', { url: 'https://scoltech.com' })}
                  aria-label="Visit SCOLTECH GROUP website"
                >
                  Developed by SCOLTECH GROUP
                </a>
              </div>

              {/* Social Sharing */}
              <div className="w-full max-w-xs lg:max-w-sm">
                <SocialShare 
                  title="Check out FindTheWeb - A curated directory of amazing websites and tools!"
                  description="Discover hidden internet gems and useful tools all in one place"
                  hashtags={['FindTheWeb', 'WebTools', 'CuratedList', 'InternetGems']}
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
