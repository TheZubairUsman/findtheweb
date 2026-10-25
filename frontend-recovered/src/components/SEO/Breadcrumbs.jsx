import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import { BreadcrumbStructuredData } from './StructuredData';

const Breadcrumbs = ({ customBreadcrumbs = null, showHome = true }) => {
  const location = useLocation();
  
  // Generate breadcrumbs from URL path if no custom breadcrumbs provided
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;
    
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];
    
    if (showHome) {
      breadcrumbs.push({
        name: 'Home',
        url: '/',
        icon: HomeIcon
      });
    }
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name: name,
        url: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  
  // Prepare structured data for breadcrumbs
  const structuredDataBreadcrumbs = breadcrumbs.map(crumb => ({
    name: crumb.name,
    url: `https://findtheweb.zus3cu.tech${crumb.url}`
  }));

  if (breadcrumbs.length <= 1) return null;

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbStructuredData breadcrumbs={structuredDataBreadcrumbs} />
      
      {/* Visual Breadcrumbs */}
      <nav 
        className="flex items-center space-x-2 text-sm text-gray-600 mb-6 px-4 py-2 bg-gray-50 rounded-lg"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
          {breadcrumbs.map((crumb, index) => (
            <li 
              key={index} 
              className="flex items-center"
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={index + 1} />
              
              {crumb.isLast ? (
                <span 
                  className="text-gray-900 font-medium flex items-center"
                  itemProp="name"
                  aria-current="page"
                >
                  {crumb.icon && (
                    <crumb.icon className="w-4 h-4 mr-1" aria-hidden="true" />
                  )}
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={crumb.url}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                  itemProp="item"
                >
                  <span itemProp="name">
                    {crumb.icon && (
                      <crumb.icon className="w-4 h-4 mr-1" aria-hidden="true" />
                    )}
                    {crumb.name}
                  </span>
                </Link>
              )}
              
              {!crumb.isLast && (
                <ChevronRightIcon 
                  className="w-4 h-4 mx-2 text-gray-400" 
                  aria-hidden="true" 
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
