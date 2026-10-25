import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { OrganizationStructuredData, BreadcrumbStructuredData } from '../components/SEO/StructuredData';

const Contact = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact', isLast: true }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const form = e.target;
    form.submit();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Contact Us - FindTheWeb"
        description="Get in touch with our team. We'd love to hear from you!"
        keywords="contact, support, help, get in touch"
      />
      
      <OrganizationStructuredData />
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />
      
      <Header />

      <main className="bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We'd love to hear from you! Get in touch with our team.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Have questions or need assistance? Fill out the form and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-600 dark:text-blue-300">
                    <FiMail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Us</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      support@findtheweb.site
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 p-3 rounded-full text-green-600 dark:text-green-300">
                    <FiPhone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Call Us</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      +92 (300) 525-8451
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Mon-Fri 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 p-3 rounded-full text-purple-600 dark:text-purple-300">
                    <FiMapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Our Office</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      Sadar, Rawalpindi<br />
                      Pakistan, 46000
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">Need help?</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Check out our <Link to="/faq" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">FAQ page</Link> or <Link to="/support" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">support center</Link> for quick answers to common questions.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>
              <form 
                action="https://formsubmit.co/support@findtheweb.site" 
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <input type="hidden" name="_subject" value="New Contact Form Submission" />
                <input type="hidden" name="_next" value="https://findtheweb.site/thank-you" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="text" name="_honey" className="hidden" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your message here..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <div className="flex items-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 w-full sm:w-auto"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
