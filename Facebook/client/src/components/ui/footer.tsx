import { MetaLogo } from "./meta-logo";

export function Footer() {
  return (
    <footer className="w-full bg-[#f0f2f5] dark:bg-gray-800">
      <div className="max-w-[396px] mx-auto">
        <MetaLogo />
        <div className="flex justify-center gap-4 text-[12px] text-[#737373] dark:text-gray-400 mt-2 mb-4">
          <a href="#" className="hover:underline">About</a>
          <span>•</span>
          <a href="#" className="hover:underline">Help</a>
          <span>•</span>
          <a href="#" className="hover:underline">More</a>
        </div>
      </div>
    </footer>
  );
}
