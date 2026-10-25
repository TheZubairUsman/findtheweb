import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { OrganizationStructuredData, BreadcrumbStructuredData } from '../components/SEO/StructuredData';
import categories from '../data/categories.json';
import websites from '../data/websites.json';

const About = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about', isLast: true }
  ];

  const teamMembers = [
    {
      name: "Zubair Usman",
      role: "Founder & CEO",
      bio: "Passionate about discovering and sharing the best tools on the web. 4+ years in tech.",
      image: "/team/ceo.png",
      social: {
        twitter: "https://twitter.com/thezubairusman",
        linkedin: "https://www.linkedin.com/in/TheZubairUsman"
      }
    },
    {
      name: "Tehniyat Usman",
      role: "Head of UI/UX designer",
      bio: "Specialist in designing user-friendly interfaces and seamless digital experiences.",
      image: "/team/c_co.png",
      social: {
        twitter: "https://threads.com/@tehniyat_usman",
        linkedin: "https://linkedin.com/in/tehniyat-usman1"
      }
    }
  ];

  const stats = [
    { number: categories.length.toString(), label: "Curated Categories" },
    { number: websites.length.toString(), label: "Curated Websites" },
    { number: "100,000+", label: "Monthly Users" },
    { number: "4.8/5", label: "User Rating" }
  ];

  const values = [
    {
      title: "Quality Over Quantity",
      description: "We carefully curate every website to ensure it provides real value to our users.",
      icon: "🎯"
    },
    {
      title: "User-Centric Design",
      description: "Every feature is designed with our users' needs and productivity in mind.",
      icon: "👥"
    },
    {
      title: "Continuous Discovery",
      description: "We're always exploring the web to find new tools and hidden gems.",
      icon: "🔍"
    },
    {
      title: "Community Driven",
      description: "Our community helps us discover and validate the best tools on the web.",
      icon: "🤝"
    }
  ];

  return (
    <>
      <SEOHead
        title="About FindTheWeb - Discover Hidden Internet Gems"
        description="Learn about FindTheWeb's mission to help you discover the best tools, websites, and hidden gems on the internet. Meet our team and discover our story."
        keywords="about findtheweb, team, mission, web discovery, productivity tools, hidden gems"
        url="https://findtheweb.zus3cu.tech/about"
        type="website"
      />

      <OrganizationStructuredData
        name="FindTheWeb"
        description="A curated platform for discovering the best tools, websites, and hidden gems on the internet"
        url="https://findtheweb.zus3cu.tech"
        logo="https://findtheweb.zus3cu.tech/logo.png"
        foundingDate="2025"
        founders={["Zubair Usman"]}
        address={{
          streetAddress: "123 Tech Street",
          addressLocality: "San Francisco",
          addressRegion: "CA",
          postalCode: "94105",
          addressCountry: "US"
        }}
        contactPoint={{
          telephone: "+1-555-123-4567",
          contactType: "customer service",
          email: "support@findtheweb.site"
        }}
        sameAs={[
          "https://twitter.com/findtheweb",
          "https://linkedin.com/company/findtheweb",
          "https://github.com/findtheweb"
        ]}
      />

      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About FindTheWeb
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to help you discover the best tools, websites, and hidden gems 
              on the internet. Our curated collection saves you time and boosts your productivity.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Story Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16 border border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Our Story
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 text-justify">
                <p className="mb-6">
                  FindTheWeb was born out of frustration. Our founder, <strong>Zubair Usman</strong>, spent countless 
                  hours searching for the right tools to boost productivity and streamline workflows. 
                  The internet is vast, but finding quality resources was like searching for a needle 
                  in a haystack.
                </p>
                <p className="mb-6">
                  In early 2025, We decided to solve this problem. We started curating the best websites, 
                  tools, and resources across different categories, making them easily discoverable 
                  for everyone. What began as a personal project quickly grew into a platform that 
                  thousands of users rely on daily.
                </p>
                <p>
                  Today, FindTheWeb is more than just a directory. It's a community-driven platform 
                  where users discover, share, and bookmark the best the internet has to offer. 
                  We're committed to maintaining the highest quality standards while continuously 
                  expanding our collection.
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Meet Our Team
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {member.bio}
                    </p>
                    <div className="flex space-x-4">
                      <a
                        href={member.social.twitter}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter
                      </a>
                      <a
                        href={member.social.linkedin}
                        className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-16 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              To democratize access to the best tools and resources on the internet, 
              helping individuals and teams work smarter, not harder.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Discover</h3>
                <p className="opacity-90">Find new tools and resources you never knew existed</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Save Time</h3>
                <p className="opacity-90">Skip the endless searching and get straight to the good stuff</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Boost Productivity</h3>
                <p className="opacity-90">Use the right tools to work more efficiently</p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want to Get in Touch?
            </h2>
            <p className="text-gray-600 mb-6">
              We'd love to hear from you. Whether you have a suggestion, feedback, 
              or just want to say hello, don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Contact Us
              </Link>
              <a
                href="mailto:support@findtheweb.site"
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
