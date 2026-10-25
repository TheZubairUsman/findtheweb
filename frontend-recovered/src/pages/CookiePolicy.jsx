import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEO/SEOHead';
import { BreadcrumbStructuredData } from '../components/SEO/StructuredData';

const CookiePolicy = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Cookie Policy', url: '/cookie-policy' }
  ];

  const lastUpdated = "September 1, 2025";

  return (
    <>
      <SEOHead 
        title="Cookie Policy - FindTheWeb"
        description="Learn about how FindTheWeb uses cookies and similar technologies to enhance your browsing experience and provide personalized services."
        canonicalUrl="https://findtheweb.net/cookie-policy"
        type="article"
      />
      
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cookie Policy
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
                  What Are Cookies?
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Cookies are small text files that are placed on your computer or mobile device 
                  when you visit a website. They are widely used to make websites work more 
                  efficiently and provide information to website owners.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  How We Use Cookies
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  FindTheWeb uses cookies for several purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>To remember your preferences and settings</li>
                  <li>To analyze website traffic and usage patterns</li>
                  <li>To provide personalized content and recommendations</li>
                  <li>To ensure website security and prevent fraud</li>
                  <li>To improve our services and user experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Types of Cookies We Use
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Essential Cookies
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      These cookies are necessary for the website to function properly. 
                      They enable core functionality such as security, network management, 
                      and accessibility.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Performance Cookies
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      These cookies collect information about how visitors use our website, 
                      such as which pages are visited most often. This data helps us improve 
                      our website's performance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Functional Cookies
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      These cookies allow the website to remember choices you make and provide 
                      enhanced, more personal features such as remembering your theme preference.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      We use analytics cookies to understand how our website is being used. 
                      This helps us make improvements and provide better content.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Third-Party Cookies
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may use third-party services that place cookies on your device. 
                  These include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Google Analytics for website analytics</li>
                  <li>Social media platforms for sharing functionality</li>
                  <li>Advertising partners for relevant ads</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Managing Your Cookie Preferences
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You can control and manage cookies in several ways:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Use our cookie consent banner when you first visit our site</li>
                  <li>Adjust your browser settings to block or delete cookies</li>
                  <li>Use browser extensions that manage cookies</li>
                  <li>Opt out of third-party analytics and advertising cookies</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  Please note that blocking certain cookies may impact your experience 
                  on our website and limit functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Cookie Retention
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Different cookies have different retention periods:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent cookies:</strong> Remain for a set period or until manually deleted</li>
                  <li><strong>Analytics cookies:</strong> Typically retained for 2 years</li>
                  <li><strong>Preference cookies:</strong> Retained until you change your settings</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Updates to This Policy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may update this Cookie Policy from time to time to reflect changes 
                  in our practices or for other operational, legal, or regulatory reasons.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  If you have any questions about our use of cookies, please contact us at{' '}
                  <a href="mailto:support@findtheweb.site" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@findtheweb.site
                  </a>
                </p>
              </section>

            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default CookiePolicy;
