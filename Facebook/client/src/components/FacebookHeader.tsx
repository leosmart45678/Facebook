import React from 'react';
import { SiFacebook } from 'react-icons/si';
import { Link } from 'wouter';

export function FacebookHeader() {
  return (
    <header className="w-full bg-white shadow-sm fixed top-0 z-50">
      <div className="max-w-[1000px] mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/login" className="text-facebook-blue">
          <SiFacebook className="w-8 h-8 md:w-10 md:h-10" />
        </Link>
      </div>
    </header>
  );
}