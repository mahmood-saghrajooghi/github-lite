import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from 'lucide-react';
import { login } from "@/lib/client";

export function LoginPage() {
  const [accessToken, setAccessToken] = useState("");

  const handleAccessTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.token = accessToken;
    location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Choose your login method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => login()}
            className="w-full"
            variant="outline"
          >
            <Github className="w-4 h-4 mr-2" />
            Login with GitHub
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <form onSubmit={handleAccessTokenSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Login with Access Token
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
