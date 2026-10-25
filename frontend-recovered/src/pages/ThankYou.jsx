import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { OrganizationStructuredData, BreadcrumbStructuredData } from '../components/SEO/StructuredData';

const ThankYou = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Thank You', url: '/thank-you', isLast: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Thank You - FindTheWeb"
        description="Thank you for contacting us. We'll get back to you soon!"
        keywords="thank you, contact form submitted, message received"
        url="https://findtheweb.site/thank-you"
        type="website"
      />

      <OrganizationStructuredData />
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-12 w-12 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Thank You!
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We've received your message and will get back to you as soon as possible.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Back to Home
            </Link>
            <Link
              to="/contact"
              className="text-base font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Send another message <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-10">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Didn't receive a confirmation?
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Check your spam folder or{' '}
              <Link
                to="/contact"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                contact us
              </Link>{' '}
              again if you don't see an email from us within 24 hours.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThankYou;
