import React from 'react';
import { Helmet } from 'react-helmet-async';

// Website Schema Component
export const WebsiteSchema = ({ name, url, description, author, sameAs = [] }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "sameAs": sameAs
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Organization Schema Component
export const OrganizationSchema = ({ 
  name, 
  url, 
  logo, 
  description, 
  sameAs = [],
  contactPoint = null,
  address = null 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "sameAs": sameAs
  };

  if (contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      "telephone": contactPoint.telephone,
      "contactType": contactPoint.contactType || "customer service",
      "email": contactPoint.email
    };
  }

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Breadcrumb Schema Component
export const BreadcrumbSchema = ({ breadcrumbs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// ItemList Schema Component (for categories and websites)
export const ItemListSchema = ({ 
  name, 
  description, 
  items, 
  url,
  numberOfItems 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "url": url,
    "numberOfItems": numberOfItems || items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "description": item.description,
      "url": item.url,
      "image": item.image
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Software Application Schema Component
export const SoftwareApplicationSchema = ({ 
  name, 
  description, 
  url, 
  applicationCategory,
  operatingSystem = "Web Browser",
  offers = null,
  aggregateRating = null 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": applicationCategory,
    "operatingSystem": operatingSystem
  };

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      "price": offers.price,
      "priceCurrency": offers.priceCurrency || "USD",
      "availability": offers.availability || "https://schema.org/InStock"
    };
  }

  if (aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": aggregateRating.bestRating || 5,
      "worstRating": aggregateRating.worstRating || 1
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Article Schema Component
export const ArticleSchema = ({ 
  headline, 
  description, 
  author, 
  datePublished, 
  dateModified,
  image,
  url,
  publisher = null
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "image": image,
    "url": url
  };

  if (publisher) {
    schema.publisher = {
      "@type": "Organization",
      "name": publisher.name,
      "logo": {
        "@type": "ImageObject",
        "url": publisher.logo
      }
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Review Schema Component
export const ReviewSchema = ({ 
  itemReviewed, 
  author, 
  reviewRating, 
  reviewBody, 
  datePublished 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Thing",
      "name": itemReviewed.name,
      "url": itemReviewed.url
    },
    "author": {
      "@type": "Person",
      "name": author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": reviewRating.ratingValue,
      "bestRating": reviewRating.bestRating || 5,
      "worstRating": reviewRating.worstRating || 1
    },
    "reviewBody": reviewBody,
    "datePublished": datePublished
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// FAQ Schema Component
export const FAQSchema = ({ faqs }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Collection Page Schema Component
export const CollectionPageSchema = ({ 
  name, 
  description, 
  url, 
  mainEntity 
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "name": mainEntity.name,
      "numberOfItems": mainEntity.numberOfItems,
      "itemListElement": mainEntity.items
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default {
  WebsiteSchema,
  OrganizationSchema,
  BreadcrumbSchema,
  ItemListSchema,
  SoftwareApplicationSchema,
  ArticleSchema,
  ReviewSchema,
  FAQSchema,
  CollectionPageSchema
};

// Alias exports to match expected import names
export const OrganizationStructuredData = OrganizationSchema;
export const BreadcrumbStructuredData = BreadcrumbSchema;
export const ArticleStructuredData = ArticleSchema;
export const CollectionPageStructuredData = CollectionPageSchema;
