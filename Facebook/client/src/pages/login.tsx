import { FacebookLogo } from "@/components/ui/facebook-logo";
import { LanguageSelector } from "@/components/ui/language-selector";
import { MetaLogo } from "@/components/ui/meta-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f0f2f5] via-[#fff] to-[#f0f2f5]">
      <div className="w-[90%] max-w-[400px] mx-auto min-h-screen flex flex-col">
        {/* Language Selector */}
        <div className="w-full text-center pt-4">
          <LanguageSelector />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
          {/* Facebook Logo */}
          <div className="mb-6">
            <FacebookLogo />
          </div>

          {/* Login Form */}
          <div className="w-full space-y-3">
            <Input 
              type="text"
              placeholder="Mobile number or email address"
              className="w-full h-[50px] px-4 bg-white border border-[#dddfe2] rounded-md text-[17px] placeholder:text-[#90949c]"
            />
            <Input 
              type="password"
              placeholder="Password"
              className="w-full h-[50px] px-4 bg-white border border-[#dddfe2] rounded-md text-[17px] placeholder:text-[#90949c]"
            />
            <Button 
              type="submit"
              className="w-full h-[50px] bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-[17px] rounded-md"
            >
              Log in
            </Button>

            <div className="text-center pt-3">
              <a href="#" className="text-[#1877F2] text-[14px] hover:underline">
                Forgotten Password?
              </a>
            </div>

            <Button 
              variant="secondary"
              className="w-full h-[50px] mt-4 bg-[#42b72a] hover:bg-[#36a420] text-white border-none font-semibold text-[17px] rounded-md"
            >
              Create new account
            </Button>
          </div>
        </div>

        {/* Meta Logo Footer */}
        <div className="mt-auto mb-6 text-center">
          <MetaLogo />
        </div>
      </div>
    </div>
  );
}