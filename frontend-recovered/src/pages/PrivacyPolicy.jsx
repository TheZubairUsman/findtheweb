import React from 'react';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { BreadcrumbStructuredData } from '../components/SEO/StructuredData';

const PrivacyPolicy = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy-policy' }
  ];

  const lastUpdated = "September 1, 2025";

  return (
    <>
      <SEOHead 
        title="Privacy Policy - FindTheWeb"
        description="Learn how FindTheWeb collects, uses, and protects your personal information. Our comprehensive privacy policy explains our data practices and your rights."
        canonicalUrl="https://findtheweb.net/privacy-policy"
        type="article"
      />
      
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Non-Personal Information
                </h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    Analytics Data
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    We use Google Analytics 4 to track:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                    <li>Page views, clicks, and search queries</li>
                    <li>Device type, browser, IP address (anonymized for GDPR compliance)</li>
                    <li>Session duration and navigation patterns</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    Cookies and Tracking
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    We use cookies for:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                    <li>Essential functions (e.g., maintaining login sessions)</li>
                    <li>Analytics (with your consent)</li>
                    <li>Personalized ads (via Google AdSense, if enabled)</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                    Affiliate Tracking
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    If you click affiliate links, we may collect anonymized click data (e.g., which website was clicked) for commission tracking.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1.2. Submitted Content
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li><strong>Business Listings:</strong> Website URLs, descriptions, logos, and categories submitted via our form.</li>
                  <li><strong>User Interactions:</strong> Bookmarks, search history (stored locally or in your account if logged in).</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use your data to provide, improve, and monetize our services ethically:
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                      Service Delivery
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Display curated website listings and enable search/bookmarking.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                      Analytics and Improvement
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Analyze user behavior (via Google Analytics 4) to optimize site performance and content.</li>
                      <li>Track listing performance (views, clicks) for business dashboards.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                      Monetization
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Display ads via Google AdSense (non-personalized or personalized with consent).</li>
                      <li>Track affiliate link clicks to earn commissions (disclosed as "Affiliate Link").</li>
                      <li>Offer premium business listings (e.g., Featured at $29/month).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                      Communication
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Send account-related emails (e.g., verification, password reset).</li>
                      <li>Notify businesses about listing status (approved, pending) via EmailJS.</li>
                      <li>Share occasional updates or promotions (with opt-out option).</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                  <li><strong>Essential Cookies:</strong> Enable core functions like login and bookmarking.</li>
                  <li><strong>Analytics Cookies:</strong> Track site usage (optional, requires consent).</li>
                  <li><strong>Advertising Cookies:</strong> Deliver relevant ads (optional, requires consent).</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>How to Manage:</strong> You can adjust cookie preferences via our consent popup (GDPR-compliant) or disable cookies in your browser (may limit functionality).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Third-Party Links
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  FindTheWeb.site includes links to external websites and affiliate links (labeled as "Affiliate Link"). 
                  We are not responsible for their privacy practices. Review their policies before sharing data. 
                  Affiliate links may earn us a commission at no cost to you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Changes to This Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update this policy to reflect changes in our practices or legal requirements. 
                  We'll notify you via email or website notice for significant changes. 
                  Check this page regularly for updates.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  For questions, concerns, or to exercise your rights, contact:
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@findtheweb.site" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@findtheweb.site
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-4 font-medium">
                  Thank you for trusting FindTheWeb.site. We're committed to protecting your privacy while delivering a valuable service.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;