import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SiFacebook } from 'react-icons/si';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { MetaLogo } from '@/components/ui/meta-logo';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Mobile number or email address required")
    .refine((value) => {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Simple phone validation (basic format)
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }, "Please enter a valid mobile number or email address"),
  password: z
    .string()
    .min(1, "The password you've entered is incorrect.")
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [location, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (responseData.code === 'USER_NOT_FOUND') {
          setServerError("The email address or mobile number you entered isn't connected to an account. Find your account and log in.");
        } else if (responseData.code === 'INVALID_PASSWORD') {
          setError('password', {
            type: 'manual',
            message: "The password you've entered is incorrect."
          });
        } else {
          setServerError(responseData.message || 'An error occurred. Please try again.');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff] to-[#f0f2f5] dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-[44px] px-4 bg-white dark:bg-gray-800 border-b border-[#dadde1] dark:border-gray-700">
        <button onClick={() => window.history.back()} className="text-[#1877f2]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowLanguages(!showLanguages)} 
          className="text-[17px] text-[#1c1e21] dark:text-white font-system-ui"
        >
          English (UK)
        </button>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Language Selector Popup */}
      {showLanguages && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-white rounded-t-xl absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-[#dadde1]">
              <h2 className="text-xl font-bold text-center">Select your language</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {["English (US)", "Español", "Français", "Deutsch", "Italiano", "Português", "日本語", "한국어", "中文(简体)", "العربية"].map((lang) => (
                  <button
                    key={lang}
                    className="text-left py-2 px-4 hover:bg-gray-100 rounded-md"
                    onClick={() => setShowLanguages(false)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pt-[60px] pb-4">
        {/* Facebook Logo */}
        <div className="mb-[40px]">
          <SiFacebook className="text-[#1877f2] w-[72px] h-[72px]" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[416px] space-y-3">
          {/* Input Fields */}
          <div className="space-y-[10px]">
            <div className="relative">
              <Input
                type="text"
                {...register('identifier')}
                placeholder="Mobile number or email address"
                className={`h-[50px] px-4 text-[17px] bg-[#f5f6f7] border border-[#dddfe2] rounded-[6px] focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] font-system-ui placeholder:text-[#90949c] ${
                  errors.identifier ? 'border-[#f02849] focus:border-[#f02849] focus:ring-[#f02849]' : ''
                }`}
              />
              {errors.identifier && (
                <div className="absolute -bottom-6 left-0 text-[#f02849] text-[13px]">
                  {errors.identifier.message}
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                placeholder="Password"
                className={`h-[50px] px-4 text-[17px] bg-[#f5f6f7] dark:bg-gray-700 border border-[#dddfe2] dark:border-gray-600 rounded-[6px] focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] pr-[50px] font-system-ui placeholder:text-[#90949c] dark:placeholder:text-gray-400 ${
                  errors.password ? 'border-[#f02849] focus:border-[#f02849] focus:ring-[#f02849]' : ''
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1877f2] [&>svg]:pointer-events-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <div className="absolute -bottom-6 left-0 text-[#f02849] text-[13px] flex items-center gap-1">
                  <span>{errors.password.message}</span>
                  <a href="/reset-password" className="text-[#1877f2] hover:underline ml-1">
                    Forgotten password?
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="text-[13px] py-3 px-4 bg-[#ffebe9] text-[#1c1e21] rounded-[4px] border border-[#fcd3cf]">
              {serverError}
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-[44px] bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-[17px] rounded-[6px] mt-[14px]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              "Log in"
            )}
          </Button>


          {/* Divider */}
          <div className="relative py-[14px] w-full max-w-[416px] mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ccd0d5]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-[#f0f2f5] text-[#4b4f56] text-[13px]">or</span>
            </div>
          </div>

          {/* Create New Account Button */}
          <div className="w-full max-w-[416px] flex flex-col items-center mt-4">
            <Button
              type="button"
              onClick={() => navigate('/signup')}
              className="h-[36px] px-[16px] bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-[14px] rounded-[6px]"
            >
              Create new account
            </Button>
          </div>
        </form>
      </main>

      {/* Meta Logo */}
      <footer className="mt-auto py-4 bg-white dark:bg-gray-800 border-t border-[#dadde1] dark:border-gray-700">
        <MetaLogo />
      </footer>
    </div>
  );
}