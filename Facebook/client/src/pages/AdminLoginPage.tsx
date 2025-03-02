import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter as CardFooterOriginal, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/ui/footer";

export function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      console.log("Attempting admin login with:", { identifier: username });

      // First check if any admin exists
      const checkAdminResponse = await fetch('/api/admin/check-db-connection');
      if (!checkAdminResponse.ok) {
        console.log("Database connection issue, trying to create admin...");
        // If we're having issues, try to run the admin creation again via a proxy endpoint
        await fetch('/api/admin/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'SMART',
            password: '09163666961'
          })
        });
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: username,
          password: password
        })
      });

      const data = await response.json();
      console.log("Admin login response:", response.status, data);

      if (response.ok) {
        if (data.user && data.user.is_admin) {
          toast({
            title: "Login successful",
            description: "Welcome to the admin dashboard",
          });
          navigate('/admin');
        } else {
          setError("You don't have admin privileges");
        }
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }


    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex items-center justify-center flex-1"> {/* Added flex-1 to take up remaining space */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your admin username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
              </div>
              <Button
                className="w-full mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooterOriginal className="flex justify-center"> {/*Renamed to avoid conflict*/}
            <Button
              variant="link"
              onClick={() => navigate("/")}
            >
              Back to Login
            </Button>
          </CardFooterOriginal>
        </Card>
      </div>
      <Footer />
    </div>
  );
}