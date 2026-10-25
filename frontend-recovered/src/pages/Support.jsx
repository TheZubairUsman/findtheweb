import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiMessageSquare, FiHelpCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { OrganizationStructuredData, BreadcrumbStructuredData } from '../components/SEO/StructuredData';

const Support = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Support', url: '/support', isLast: true }
  ];

  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button in the top right corner of the page and follow the registration process.'
    },
    {
      question: 'How can I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and enter your email address. You will receive instructions to reset your password.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for our premium services.'
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach our support team by filling out the contact form on our Contact page or by emailing support@findtheweb.site.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all our premium plans. Please contact our support team for assistance with refunds.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Support Center - FindTheWeb"
        description="Get help and support for FindTheWeb. Find answers to common questions or contact our support team."
        keywords="support, help, FAQ, contact, findtheweb"
      />
      
      <OrganizationStructuredData />
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />
      
      <Header />

      <main className="bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions or get in touch with our support team.
            </p>
            
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  className="w-full px-6 py-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Popular Topics */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Popular Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/faq/account" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Account & Profile</h3>
                <p className="text-gray-600 dark:text-gray-400">Manage your account settings and profile information</p>
              </Link>

              <Link to="/faq/billing" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Billing & Payments</h3>
                <p className="text-gray-600 dark:text-gray-400">Questions about payments, invoices, and subscriptions</p>
              </Link>

              <Link to="/faq/features" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Features & How-Tos</h3>
                <p className="text-gray-600 dark:text-gray-400">Learn how to use our platform's features</p>
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
              </p>
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      className="w-full px-6 py-4 text-left focus:outline-none flex items-center justify-between"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                      {activeFaq === index ? (
                        <FiChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {activeFaq === index && (
                      <div className="px-6 pb-4 pt-0">
                        <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiHelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">Try different search terms or browse our help topics.</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 md:p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still need help?</h2>
              <p className="text-gray-600 dark:text-blue-200 mb-8">
                Our support team is here to help you with any questions or issues you might have.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 inline-flex items-center justify-center"
                >
                  <FiMail className="mr-2 h-5 w-5" />
                  Contact Support
                </Link>
                <a
                  href="mailto:support@findtheweb.site"
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 inline-flex items-center justify-center"
                >
                  support@findtheweb.site
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
