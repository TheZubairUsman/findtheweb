import React from 'react';
import { FaTwitter, FaFacebook, FaLinkedin, FaReddit, FaWhatsapp, FaTelegram, FaLink } from 'react-icons/fa';

const SocialShare = ({ url = window.location.href, title = 'Check out this amazing website!' }) => {
  const shareLinks = [
    {
      name: 'Twitter',
      icon: <FaTwitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-blue-500',
      textColor: 'text-blue-500',
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-700',
      textColor: 'text-blue-700',
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin className="w-5 h-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-600',
      textColor: 'text-blue-600',
    },
    {
      name: 'Reddit',
      icon: <FaReddit className="w-5 h-5" />,
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      color: 'hover:bg-orange-500',
      textColor: 'text-orange-500',
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="w-5 h-5" />,
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'hover:bg-green-500',
      textColor: 'text-green-500',
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="w-5 h-5" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-blue-400',
      textColor: 'text-blue-400',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center">Thanks For Your Sharing</h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {shareLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full ${social.color} ${social.textColor} hover:text-white transition-colors duration-200`}
            aria-label={`Share on ${social.name}`}
            title={`Share on ${social.name}`}
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialShare;
