"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setIsSubmitting(true);

    try {
      sessionStorage.setItem("email", e.target.email.value);
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e.target.email.value,
        }),
      });

      if (response.ok) {
        toast({
          title: "OTP sent",
          description: "An OTP has been sent to your email",
        });

        setStep(2);
      } else {
        
        sessionStorage.removeItem("email");
        const data = await response.json();

        toast({
          title: "Failed to send OTP",
          description: data.message || "An error occurred while sending OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      sessionStorage.removeItem("email");
      toast({
        title: "Failed to send OTP",
        description: "An error occurred while sending OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (e.target.password.value !== e.target.confirmPassword.value) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    const email = sessionStorage.getItem("email");
    if (!email) {
      setError("Email not found. Please start the process again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });

      if (response.ok) {
        toast({
          title: "Password reset successful",
          description: "You have successfully reset your password",
        });
        router.replace("/user/sign-in");
      } else {
        const data = await response.json();
        toast({
          title: "Password reset failed",
          description:
            data.message || "An error occurred while resetting password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "An error occurred while resetting password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (otp.length !== 6) {
      setError("Please enter a valid OTP");
      setIsSubmitting(false);
      return;
    }

    const email = sessionStorage.getItem("email");
    if (!email) {
      setError("Email not found. Please start the process again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: e.target.otp.value,
        }),
      });

      if (response.ok) {
        toast({
          title: "OTP Verified",
          description: "You have successfully verified your OTP",
        });
        setStep(3);
      } else {
        const data = await response.json();
        setStep(3);
        toast({
          title: "OTP Verification Failed",
          description: data.message || "An error occurred while verifying OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStep(3);
      toast({
        title: "OTP Verification Failed",
        description: "An error occurred while verifying OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Forget Password</h2>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your email"
            />
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
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otp">One-Time Password</Label>
            <Input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full"
              placeholder="Enter OTP"
              maxLength={6}
            />
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
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Enter new Password</Label>
            <Input
              type="password"
              id="password"
              value=""
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full"
              placeholder="Enter new password"
              maxLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              type="password"
              id="confirm-password"
              value=""
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full"
              placeholder="Confirm password"
              maxLength={6}
            />
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
        </form>
      )}

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
}
