"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
const otpVerification = async (otp, email) => {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const data = await response.json();
    console.error("otpVerification failed:", data.message);
    throw new Error(
      data.message || "OTP verification failed. Please try again."
    );
  }

  return await response.json();
};

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    const email = sessionStorage.getItem("email");
    if (!email) {
      setError("Email not found. Please start the process again.");
      return;
    }

    if (fullOtp.length === 6) {
      setError("");
      setLoading(true);
      try {
        const response = await otpVerification(fullOtp, email);

        if (response.ok) {
          toast({
            title: "OTP Verification Successful",
            description: "You have successfully verified your account",
          });

          sessionStorage.removeItem("email");

          router.replace("/home");
        } else {
          const data = await response.json();
          toast({
            title: "OTP Verification Failed",
            description:
              data.message || "An error occurred while verifying OTP",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "OTP Verification Failed",
          description: "An error occurred while verifying OTP",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      setError("OTP must be 6 digits.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md sm:w-auto p-8 space-y-8 bg-white rounded-lg shadow-md">
        <CardContent className="text-center">
          <h2 className="text-3xl md:text-3xl font-extrabold tracking-tight lg:text-5xl mb-6">
            OTP Verification
          </h2>
          <p className="mb-4">
            Enter the 6-digit OTP sent to your registered email or phone.
          </p>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between mb-4 text-black dark:text-white space-x-2 sm:space-x-1 sm:w-auto sm:justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength={1}
                  disabled={loading}
                  className="md:h-14 lg:h-14 text-center md:text-lg lg:text-lg sm:text-base border border-gray-400 text-black dark:text-white bg-white dark:bg-gray-800"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
            )}
            <Button
              onClick={handleVerify}
              className={`w-full mt-4 text-white py-2 rounded-lg  transition duration-150 ease-in-out ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
