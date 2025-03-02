import React from 'react';

export function FacebookFooter() {
  const languages = [
    'English (US)', 'Español', 'Français (France)', 'Português (Brasil)',
    'Italiano', 'Deutsch', '中文(简体)', 'العربية', 'हिन्दी', '日本語'
  ];

  const links = [
    'Sign Up', 'Log In', 'Messenger', 'Facebook Lite', 'Watch', 'Places', 'Games',
    'Marketplace', 'Meta Pay', 'Meta Store', 'Meta Quest', 'Instagram',
    'Fundraisers', 'Services', 'Voting Information Center', 'Privacy Policy',
    'Privacy Center', 'Groups', 'About', 'Create Ad', 'Create Page', 'Developers',
    'Careers', 'Cookies', 'Ad choices', 'Terms', 'Help', 'Contact Uploading & Non-Users'
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white mt-auto py-8">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex flex-wrap gap-x-3 text-[12px] text-[#737373] mb-2">
          {languages.map((lang, index) => (
            <a key={index} href="#" className="hover:underline">{lang}</a>
          ))}
        </div>
        <hr className="my-2 border-gray-300" />
        <div className="flex flex-wrap gap-x-3 text-[12px] text-[#737373] mb-4">
          {links.map((link, index) => (
            <a key={index} href="#" className="hover:underline">{link}</a>
          ))}
        </div>
        <p className="text-[12px] text-[#737373]">Meta © {currentYear}</p>
      </div>
    </footer>
  );
}
