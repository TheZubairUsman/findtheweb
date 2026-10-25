import React from 'react';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { BreadcrumbStructuredData } from '../components/SEO/StructuredData';

const TermsOfService = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/terms-of-service' }
  ];

  const lastUpdated = "September 1, 2025";

  return (
    <>
      <SEOHead 
        title="Terms of Service - FindTheWeb"
        description="Read FindTheWeb's Terms of Service to understand the rules and guidelines for using our website discovery platform and services."
        canonicalUrl="https://findtheweb.net/terms-of-service"
        type="article"
      />
      
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  By using the Website, whether as a visitor browsing content, a business submitting listings, you agree to these Terms, our <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>, and any additional policies referenced herein. These Terms apply to all users, including individuals (e.g., students, professionals) and businesses submitting listings for inclusion in the directory.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Description of Service
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  FindTheWeb provides:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                  <li>A curated directory of websites across 99+ categories, accessible for free to all users.</li>
                  <li>Features for searching, bookmarking, and filtering websites.</li>
                  <li>Business website owners to submit listings, with free and premium tiers (Featured at $29/month, Premium at $99/month, Enterprise at $299/month).</li>
                  <li>Monetization through advertisements (e.g., Google AdSense) and affiliate links, clearly labeled for transparency.</li>
                  <li>Analytics for business users to track listing performance (e.g., views, clicks).</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice, subject to applicable law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Eligibility
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Business are available to individuals or entities authorized to represent a website or company.</li>
                  <li>You must provide accurate, complete information during registration or listing submission.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Business Listings
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>Submission Process:</strong> Businesses may submit websites for inclusion via the listing submission form. Listings are subject to review and approval by our team to ensure quality and relevance.
                  </li>
                  <li>
                    <strong>Free and Premium Plans:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>Free Basic: Limited visibility, basic listing.</li>
                      <li>Featured ($29/month): Priority placement in categories.</li>
                      <li>Premium ($99/month): Enhanced placement, analytics, and support.</li>
                      <li>Enterprise ($299/month): Top-tier placement, custom features, dedicated support.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Payment Terms:</strong> Payments for premium plans are processed monthly. You may cancel anytime, but no refunds are issued for partial billing cycles.
                  </li>
                  <li>
                    <strong>Content Guidelines:</strong> Listings must not contain illegal, misleading, or harmful content (e.g., malware, phishing). We reserve the right to reject or remove listings at our discretion.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Monetization and Transparency
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>Advertisements:</strong> The Service displays ads (e.g., via Google AdSense) in headers, sidebars, or content areas. Ads are labeled to distinguish them from organic content.
                  </li>
                  <li>
                    <strong>Affiliate Links:</strong> Some website links may include affiliate tracking codes, earning us commissions at no cost to you. These are clearly marked as "Affiliate Link" for transparency.
                  </li>
                  <li>
                    <strong>Sponsored Content:</strong> Premium listings or sponsored placements are labeled as "Sponsored" or "Featured" to maintain ethical standards.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. User Conduct
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Use the Service for illegal purposes or to promote harmful content.</li>
                  <li>Submit false, misleading, or unverified information in listings or accounts.</li>
                  <li>Attempt to bypass security measures (e.g., hacking, reverse-engineering) or interfere with the Service's operation.</li>
                  <li>Use automated tools (e.g., bots, scrapers) to access or extract data without permission.</li>
                  <li>Violate intellectual property rights or privacy of others.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Intellectual Property
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>Our Content:</strong> The Service, including its design, code, and curated database, is owned by FindTheWeb or its licensors and protected by copyright, trademark, and other laws.
                  </li>
                  <li>
                    <strong>User Content:</strong> By submitting listings or other content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content solely for operating the Service.
                  </li>
                  <li>
                    <strong>Feedback:</strong> Any suggestions or feedback you provide may be used by us without obligation or compensation.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Termination
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>By Us:</strong> We may suspend or terminate your listing for violating these Terms, non-payment, or at our discretion with notice where required by law.
                  </li>
                  <li>
                    Upon termination, access to premium features and listings may be removed, but data may be retained per our Privacy Policy.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Changes to Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We may update these Terms at any time, with changes effective upon posting to the Website. Continued use after updates constitutes acceptance. Significant changes will be notified via email or site announcement where required by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  For questions, support, or to report violations, contact:
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@findtheweb.site" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@findtheweb.site
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-4 font-medium">
                  By using FindTheWeb, you acknowledge that you have read, understood, and agree to these Terms of Service.
                </p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
