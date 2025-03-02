import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { MetaLogo } from '@/components/ui/meta-logo';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Footer } from "@/components/ui/footer";

// Validation schema
const signupSchema = z.object({
  firstName: z.string().min(1, "What's your name?"),
  surname: z.string().min(1, "What's your surname?"),
  emailOrPhone: z.string().min(1, "You'll use this when you log in and if you ever need to reset your password"),
  password: z.string().min(6, "Your password must be at least 6 characters long. Please try another."),
  birthDay: z.string().min(1, "Please select your birth day"),
  birthMonth: z.string().min(1, "Please select your birth month"),
  birthYear: z.string().min(1, "Please select your birth year"),
  gender: z.string().min(1, "Please choose a gender")
});

type FormData = z.infer<typeof signupSchema>;

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Full Facebook language list
const languages = [
  "English (US)", "Español", "Français (France)", "中文(简体)", "العربية", "Português (Brasil)",
  "Italiano", "한국어", "Deutsch", "हिन्दी", "日本語", "Việt", "తెలుగు", "தமிழ்", "ગુજરાતી",
  "ಕನ್ನಡ", "മലയാളം", "বাংলা", "मराठी", "ਪੰਜਾਬੀ", "اردو", "Nederlands", "Português (Portugal)",
  "Polski", "Türkçe", "Русский", "ภาษาไทย", "Română", "Tiếng Việt", "Ελληνικά", "Čeština",
  "Svenska", "Magyar", "Bahasa Indonesia", "Filipino"
];

export function SignupPage() {
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        setServerError(responseData.message || 'An error occurred. Please try again.');
      } else {
        navigate('/login');
      }
    } catch (error) {
      setServerError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-[44px] px-4 bg-white border-b border-[#dadde1]">
        <button onClick={() => window.history.back()} className="text-[#1877f2]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="text-[17px] text-[#1c1e21] font-system-ui"
        >
          English (UK)
        </button>
        <div className="w-6" />
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
                {languages.map((lang) => (
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

      <main className="flex-grow flex flex-col items-center px-4 py-0">
        <div className="w-full max-w-[396px] bg-white rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] px-4 py-[16px] mb-[16px] mt-[40px]">
          <h1 className="text-[32px] leading-[38px] text-[#1c1e21] font-semibold text-center mb-[12px]">
            Create a new account
          </h1>
          <p className="text-[15px] leading-[24px] text-[#606770] text-center mb-[20px]">
            It's quick and easy.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[10px]">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-[10px]">
              <Input
                type="text"
                {...register('firstName')}
                placeholder="First name"
                className="h-[40px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px]"
              />
              <Input
                type="text"
                {...register('surname')}
                placeholder="Surname"
                className="h-[40px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px]"
              />
            </div>

            {/* Email/Phone Field */}
            <Input
              type="text"
              {...register('emailOrPhone')}
              placeholder="Mobile number or email address"
              className="h-[40px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px] w-full"
            />

            {/* Password Field */}
            <Input
              type="password"
              {...register('password')}
              placeholder="New password"
              className="h-[40px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px] w-full"
            />

            {/* Date of Birth */}
            <div className="space-y-[5px]">
              <label className="text-[12px] text-[#606770]">Date of birth</label>
              <div className="grid grid-cols-3 gap-[10px]">
                <select
                  {...register('birthDay')}
                  className="h-[36px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px] px-[8px]"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  {...register('birthMonth')}
                  className="h-[36px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px] px-[8px]"
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
                <select
                  {...register('birthYear')}
                  className="h-[36px] text-[15px] bg-[#f5f6f7] border border-[#ccd0d5] rounded-[5px] px-[8px]"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-[5px]">
              <label className="text-[12px] text-[#606770]">Gender</label>
              <div className="grid grid-cols-3 gap-[10px]">
                <label className="flex items-center justify-between px-[8px] h-[36px] border border-[#ccd0d5] rounded-[5px] bg-[#f5f6f7]">
                  <span className="text-[15px]">Female</span>
                  <input
                    type="radio"
                    {...register('gender')}
                    value="female"
                    className="mr-[4px]"
                  />
                </label>
                <label className="flex items-center justify-between px-[8px] h-[36px] border border-[#ccd0d5] rounded-[5px] bg-[#f5f6f7]">
                  <span className="text-[15px]">Male</span>
                  <input
                    type="radio"
                    {...register('gender')}
                    value="male"
                    className="mr-[4px]"
                  />
                </label>
                <label className="flex items-center justify-between px-[8px] h-[36px] border border-[#ccd0d5] rounded-[5px] bg-[#f5f6f7]">
                  <span className="text-[15px]">Custom</span>
                  <input
                    type="radio"
                    {...register('gender')}
                    value="custom"
                    className="mr-[4px]"
                  />
                </label>
              </div>
            </div>

            {/* Terms and Conditions */}
            <p className="text-[11px] text-[#777] mt-[11px]">
              People who use our service may have uploaded your contact information to Facebook. Learn more.
            </p>
            <p className="text-[11px] text-[#777] mt-[11px]">
              By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy. You may receive SMS notifications from us and can opt out at any time.
            </p>

            {/* Error Messages */}
            {serverError && (
              <div className="text-[13px] py-3 px-4 bg-[#ffebe9] text-[#1c1e21] rounded-[4px] border border-[#fcd3cf]">
                {serverError}
              </div>
            )}

            {/* Sign Up Button */}
            <div className="flex justify-center pt-[16px]">
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[194px] h-[36px] bg-[#00a400] hover:bg-[#42b72a] text-white text-[18px] font-bold rounded-[6px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mb-[20px]">
          <a href="/login" className="text-[#1877f2] text-[14px] font-semibold">
            Already have an account?
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SignupPage;