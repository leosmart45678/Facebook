import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FacebookHeader } from '@/components/FacebookHeader';
import { FacebookFooter } from '@/components/FacebookFooter';
import { useToast } from '@/hooks/use-toast';
import { SiFacebook } from 'react-icons/si';

export function ResetPasswordPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Reset link sent",
          description: "Check your email for password reset instructions",
        });
        // For demo purposes, show the reset form directly with the token
        if (data.resetToken) {
          setResetToken(data.resetToken);
          setShowResetForm(true);
        }
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Password has been reset successfully",
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-facebook-grey">
      <FacebookHeader />

      <main className="flex-grow flex items-center justify-center p-facebook-container">
        <div className="w-full max-w-[396px]">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {!showResetForm ? (
              <>
                <h1 className="text-xl font-semibold mb-4">Find Your Account</h1>
                <p className="text-sm text-gray-600 mb-4">
                  Please enter your email address to search for your account.
                </p>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full h-[50px] px-4 text-facebook-input border border-facebook-divider rounded-lg focus:border-facebook-blue focus:ring-facebook-blue"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="px-4 py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-facebook-blue hover:bg-facebook-hover text-white px-4 py-2"
                      disabled={isLoading}
                    >
                      Search
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold mb-4">Reset Your Password</h1>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full h-[50px] px-4 text-facebook-input border border-facebook-divider rounded-lg focus:border-facebook-blue focus:ring-facebook-blue"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetForm(false)}
                      className="px-4 py-2"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-facebook-blue hover:bg-facebook-hover text-white px-4 py-2"
                      disabled={isLoading}
                    >
                      Reset Password
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <FacebookFooter />
    </div>
  );
}
