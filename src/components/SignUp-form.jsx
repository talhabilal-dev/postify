"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent,CardHeader,CardDescription,CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm({ className, ...props }) {
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const checkUsername = async (username) => {
    setIsCheckingUsername(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${username}`);
      const data = await res.json();
      if (data.success) {
        setUsernameMessage("Username available");
      } else {
        setUsernameMessage(data.message);
      }
    } catch (error) {
      setUsernameMessage("Error checking username");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  useEffect(() => {
    if (username) {
      const timer = setTimeout(() => checkUsername(username), 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameMessage("");
    }
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const email = e.target.email.value;
    const password = e.target.password.value;
    const fullName = e.target.fullName.value;
    const username = e.target.username.value;

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Invalid email address",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 7) {
      toast({
        title: "Error",
        description: "Password must be at least 7 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fullName,
          email,
          password,
        }),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        router.push("/user/verify-otp");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Account creation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: data.message || "Account creation failed",
        variant: "destructive",
      });
      console.error("Error creating account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" type="text" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {isCheckingUsername && <Loader2 className="animate-spin" />}
              {!isCheckingUsername && usernameMessage && (
                <p
                  className={`text-sm ${
                    usernameMessage == "Username available"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/user/sign-in" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
