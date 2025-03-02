import React, { useEffect, useState } from 'react';
import { SiFacebook } from 'react-icons/si';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide loading screen after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-[#f0f2f5] flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <SiFacebook className="text-[#1877f2] w-32 h-32 md:w-40 md:h-40 animate-pulse" />
        <div className="mt-4 flex space-x-2">
          <div className="w-3 h-3 bg-[#1877f2] rounded-full animate-[bounce_1s_infinite_0ms]"></div>
          <div className="w-3 h-3 bg-[#1877f2] rounded-full animate-[bounce_1s_infinite_200ms]"></div>
          <div className="w-3 h-3 bg-[#1877f2] rounded-full animate-[bounce_1s_infinite_400ms]"></div>
        </div>
      </div>
    </div>
  );
}