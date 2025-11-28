"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "../lib/authService";
import { useAuthStore } from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Phone, Shield, User, Video, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("mobile");
  
  // Get redirect URL from query params
  const getRedirectUrl = () => {
    const redirect = searchParams.get("redirect");
    return redirect && redirect.startsWith("/") ? redirect : "/";
  };
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userType, setUserType] = useState("user");
  const [countdown, setCountdown] = useState(0);
  const [detailStep, setDetailStep] = useState(0);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });
  const [creatorDetails, setCreatorDetails] = useState({
    youtubeChannelName: "",
    youtubeChannelLink: "",
    subscribers: "",
    contentLength: "",
  });
  const [userAgreementsAccepted, setUserAgreementsAccepted] = useState({
    userAgreement: false,
    privacyPolicy: false,
  });
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] =
    useState(false);

  const {
    isAuthenticated,
    setAuthentication,
    setAuthLoading,
    setError,
    authLoading,
    authToken,
    userUuid,
    setMobileNumber: setStoreMobileNumber,
  } = useAuthStore();

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated) {
      // User is authenticated, redirect to home or redirect URL
      const redirect = searchParams.get("redirect");
      const redirectUrl = redirect && redirect.startsWith("/") ? redirect : "/";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  // YouTube link validation
  const isValidYouTubeLink = (url) => {
    if (!url) return false;
    const youtubeRegex =
      /^https?:\/\/(www\.)?(youtube\.com\/(channel\/|c\/|user\/|@)|youtu\.be\/)/i;
    return youtubeRegex.test(url);
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // OTP Input Handlers
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleMobileSubmit = async () => {
    if (mobileNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const response = await authService.login(mobileNumber);

      if (response.status) {
        setStoreMobileNumber(mobileNumber);
        setStep("otp");
        setCountdown(30);
        alert(`Verification code sent to ${mobileNumber}`);
      } else {
        alert(response.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpSubmit = useCallback(async () => {
    const otpString = otp.join("");
    if (otpString.length < 4) {
      alert("Please enter the complete 4-digit OTP");
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOtp(mobileNumber, otpString);

      if (response.status && (response.data || response.auth_token)) {
        const responseData = response.data || response;
        const { auth_token, uuid, user } = responseData;

        // Store auth data but don't mark as authenticated yet
        setAuthentication(false, userType, user, auth_token, uuid);

        // Follow the exact flow from the React Native app
        if (user.is_creator === null || user.is_creator === undefined) {
          // User is new, show role selection first
          setDetailStep(0);
          setStep("roleSelection");
        } else if (user.is_creator === 1) {
          // User is already a creator, check if profile exists
          try {
            const creatorDetail = await authService.getCreatorDetail();
            const profileData =
              creatorDetail.data || creatorDetail.creatorDetail;
            if (creatorDetail.status && profileData) {
              // Creator profile exists, login complete
              setAuthentication(true, "creator", profileData, auth_token, uuid);
              alert("Welcome back! Login successful.");
              window.dispatchEvent(new Event("auth-changed"));
              router.push(getRedirectUrl());
              return;
            } else {
              // Creator profile doesn't exist, show creator form
              setDetailStep(0);
              setStep("userDetails");
              return;
            }
          } catch (error) {
            // Creator profile doesn't exist, show creator form
            setDetailStep(0);
            setStep("userDetails");
            return;
          }
        } else if (user.is_creator === 0) {
          // User is already a viewer, check if profile exists
          try {
            const viewerDetail = await authService.getViewerDetail();
            const profileData =
              viewerDetail.data || viewerDetail.ViewerDetail;
            if (viewerDetail.status && profileData) {
              // Viewer profile exists, login complete
              setAuthentication(true, "user", profileData, auth_token, uuid);
              alert("Welcome back! Login successful.");
              window.dispatchEvent(new Event("auth-changed"));
              router.push(getRedirectUrl());
              return;
            } else {
              // Viewer profile doesn't exist, show user form
              setDetailStep(0);
              setStep("userDetails");
              return;
            }
          } catch (error) {
            // Viewer profile doesn't exist, show user form
            setDetailStep(0);
            setStep("userDetails");
            return;
          }
        } else {
          // Handle unexpected is_creator values
          setDetailStep(0);
          setStep("userDetails");
        }
      } else {
        alert(response.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      alert(error.message || "OTP verification failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }, [
    otp,
    mobileNumber,
    userType,
    setAuthentication,
    setAuthLoading,
    setError,
    router,
  ]);

  // Auto-submit when all 4 digits are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && otp.join("").length === 4) {
      const timer = setTimeout(() => {
        handleOtpSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [otp, handleOtpSubmit]);

  // Helper to get total steps for current user type
  const getTotalSteps = () => {
    return userType === "user" ? 3 : 5;
  };

  // Helper to validate current step
  const validateCurrentStep = (stepIndex) => {
    if (userType === "user") {
      switch (stepIndex) {
        case 0:
          return !!(
            userDetails.firstName.trim() && userDetails.lastName.trim()
          );
        case 1:
          return !!(
            userDetails.username.trim() && isValidEmail(userDetails.email)
          );
        case 2:
          return (
            userAgreementsAccepted.userAgreement &&
            userAgreementsAccepted.privacyPolicy
          );
        default:
          return false;
      }
    } else {
      switch (stepIndex) {
        case 0:
          return !!(
            userDetails.firstName.trim() && userDetails.lastName.trim()
          );
        case 1:
          return !!(
            userDetails.username.trim() && isValidEmail(userDetails.email)
          );
        case 2:
          return !!(
            creatorDetails.youtubeChannelName.trim() &&
            isValidYouTubeLink(creatorDetails.youtubeChannelLink)
          );
        case 3:
          return !!(creatorDetails.subscribers && creatorDetails.contentLength);
        case 4:
          return creatorAgreementAccepted;
        default:
          return false;
      }
    }
  };

  const handleUserSignup = async () => {
    if (!userDetails.firstName.trim() || !userDetails.lastName.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!userDetails.username.trim()) {
      alert("Please enter a username");
      return;
    }
    if (!isValidEmail(userDetails.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (
      !userAgreementsAccepted.userAgreement ||
      !userAgreementsAccepted.privacyPolicy
    ) {
      alert("Please accept all agreements");
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const viewerData = {
        first_name: userDetails.firstName.trim(),
        last_name: userDetails.lastName.trim(),
        email: userDetails.email,
        username: userDetails.username,
      };

      const response = await authService.createViewer(viewerData);
      const profileData = response.data || response.viewer;

      if (response.status && profileData) {
        setAuthentication(
          true,
          "user",
          profileData,
          authToken || undefined,
          userUuid || undefined
        );
        alert("Welcome to Glimz! Profile created successfully!");
        window.dispatchEvent(new Event("auth-changed"));
        router.push(getRedirectUrl());
      } else {
        alert(response.message || "Failed to create profile");
      }
    } catch (error) {
      console.error("User signup error:", error);
      alert(error.message || "Profile creation failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreatorSignup = async () => {
    if (!userDetails.firstName.trim() || !userDetails.lastName.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!userDetails.username.trim()) {
      alert("Please enter a username");
      return;
    }
    if (!isValidEmail(userDetails.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!creatorDetails.youtubeChannelName.trim()) {
      alert("Please enter your YouTube channel name");
      return;
    }
    if (!isValidYouTubeLink(creatorDetails.youtubeChannelLink)) {
      alert("Please enter a valid YouTube channel link");
      return;
    }
    if (!creatorDetails.subscribers) {
      alert("Please enter your subscriber count");
      return;
    }
    if (!creatorDetails.contentLength) {
      alert("Please select your content length");
      return;
    }
    if (!creatorAgreementAccepted) {
      alert("Please accept the Content Creator Agreement");
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const creatorData = {
        first_name: userDetails.firstName.trim(),
        last_name: userDetails.lastName.trim(),
        username: userDetails.username,
        email: userDetails.email,
        channel_name: creatorDetails.youtubeChannelName,
        channel_link: creatorDetails.youtubeChannelLink,
        subscribers: creatorDetails.subscribers,
        content_length: creatorDetails.contentLength,
      };

      const response = await authService.createCreator(creatorData);
      const profileData = response.data || response.creator;

      if (response.status && profileData) {
        setAuthentication(
          true,
          "creator",
          profileData,
          authToken || undefined,
          userUuid || undefined
        );
        alert("Welcome to Glimz Creator! Profile created successfully!");
        window.dispatchEvent(new Event("auth-changed"));
        router.push(getRedirectUrl());
      } else {
        alert(response.message || "Failed to create creator profile");
      }
    } catch (error) {
      console.error("Creator signup error:", error);
      alert(error.message || "Creator registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Navigate to next step in detail flow
  const handleNextStep = () => {
    const totalSteps = getTotalSteps();
    if (detailStep < totalSteps - 1) {
      if (validateCurrentStep(detailStep)) {
        setDetailStep(detailStep + 1);
      } else {
        alert("Please fill all required fields");
      }
    } else {
      // Last step - submit
      if (userType === "user") {
        handleUserSignup();
      } else {
        handleCreatorSignup();
      }
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (detailStep > 0) {
      setDetailStep(detailStep - 1);
    } else {
      setStep("roleSelection");
      setDetailStep(0);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setAuthLoading(true);
    setError(null);

    try {
      const response = await authService.resendOtp(mobileNumber);

      if (response.status) {
        setCountdown(30);
        alert(`New verification code sent to ${mobileNumber}`);
      } else {
        alert(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 1: Mobile Entry
  const renderMobileStep = () => (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center space-y-2">
        <div className="p-4 rounded-full bg-primary/10 mb-2">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center">Get Started</h2>
        <p className="text-center text-muted-foreground text-sm">
          Enter your phone number to continue
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="flex w-full rounded-xl border-2 border-input bg-background overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
          <div className="px-5 py-4 border-r border-input flex items-center bg-muted/50">
            <span className="text-lg font-semibold text-foreground">+91</span>
          </div>
          <Input
            type="tel"
            value={mobileNumber}
            onChange={(e) =>
              setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="Enter Mobile Number"
            className="border-0 rounded-none focus-visible:ring-0 text-lg h-14"
            maxLength={10}
          />
        </div>

        <Button
          onClick={handleMobileSubmit}
          disabled={mobileNumber.length < 10 || authLoading}
          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          {authLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Sending...
            </span>
          ) : (
            "Continue"
          )}
        </Button>
      </div>

      <div className="text-center space-y-3 pt-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Your personal details are safe with us</span>
        </div>
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="https://www.glimznow.com/TnC/privacy-policy"
            target="_blank"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );

  // Step 2: OTP Verification
  const renderOtpStep = () => (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center space-y-2">
        <div className="p-4 rounded-full bg-primary/10 mb-2">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center">Verify Your Number</h2>
        <p className="text-center text-muted-foreground text-sm">
          We&apos;ve sent a 4-digit code to
        </p>
        <p className="text-center font-semibold text-lg">+91 {mobileNumber}</p>
        <Button
          variant="ghost"
          onClick={() => {
            setStep("mobile");
            setCountdown(0);
          }}
          className="text-sm text-primary hover:text-primary/80"
        >
          Change number
        </Button>
      </div>

      <div className="w-full space-y-6">
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map((index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              className="w-16 h-16 text-center text-3xl font-bold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendOtp}
            disabled={authLoading || countdown > 0}
            className="text-primary hover:text-primary/80 hover:bg-primary/10 disabled:opacity-50"
          >
            {authLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Sending...
              </span>
            ) : countdown > 0 ? (
              `Resend Code in ${countdown}s`
            ) : (
              "Resend Code"
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // Step 3: Role Selection
  const renderRoleSelectionStep = () => (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-2xl font-bold text-center">Choose Your Role</h2>
        <p className="text-center text-muted-foreground text-sm">
          Select how you want to experience Glimz
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => setUserType("creator")}
          className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
            userType === "creator"
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-input hover:border-primary/50 bg-background"
          }`}
        >
          {userType === "creator" && (
            <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />
          )}
          <div className={`p-3 rounded-full mb-3 ${
            userType === "creator" ? "bg-primary/20" : "bg-muted"
          }`}>
            <Video className={`h-6 w-6 ${
              userType === "creator" ? "text-primary" : "text-muted-foreground"
            }`} />
          </div>
          <span
            className={`text-lg font-semibold ${
              userType === "creator" ? "text-primary" : "text-foreground"
            }`}
          >
            Creator
          </span>
          <span className="text-xs text-muted-foreground mt-1 text-center">
            Upload & Share
          </span>
        </button>

        <button
          onClick={() => setUserType("user")}
          className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
            userType === "user"
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-input hover:border-primary/50 bg-background"
          }`}
        >
          {userType === "user" && (
            <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />
          )}
          <div className={`p-3 rounded-full mb-3 ${
            userType === "user" ? "bg-primary/20" : "bg-muted"
          }`}>
            <User className={`h-6 w-6 ${
              userType === "user" ? "text-primary" : "text-muted-foreground"
            }`} />
          </div>
          <span
            className={`text-lg font-semibold ${
              userType === "user" ? "text-primary" : "text-foreground"
            }`}
          >
            Viewer
          </span>
          <span className="text-xs text-muted-foreground mt-1 text-center">
            Watch & Enjoy
          </span>
        </button>
      </div>

      <Button
        onClick={() => {
          setDetailStep(0);
          setStep("userDetails");
        }}
        className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );

  // Step 4: Multi-step Registration Form
  const renderUserDetailsStep = () => {
    const totalSteps = getTotalSteps();
    const isLastStep = detailStep === totalSteps - 1;

    return (
      <div className="flex flex-col items-center space-y-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full space-y-4">
          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {detailStep + 1} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((detailStep + 1) / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((detailStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center">
            {userType === "creator" ? "Creator Profile" : "User Profile"}
          </h2>
        </div>

        <div className="w-full space-y-5">
          {detailStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={userDetails.firstName}
                  onChange={(e) =>
                    setUserDetails({
                      ...userDetails,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="Enter your first name"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={userDetails.lastName}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                  className="h-12 text-base"
                />
              </div>
            </div>
          )}

          {detailStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username *
                </Label>
                <Input
                  id="username"
                  value={userDetails.username}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, username: e.target.value })
                  }
                  placeholder="Enter username"
                  autoCapitalize="none"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userDetails.email}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, email: e.target.value })
                  }
                  placeholder="Enter your email address"
                  autoCapitalize="none"
                  className="h-12 text-base"
                />
              </div>
            </div>
          )}

          {userType === "user" && detailStep === 2 && (
            <div className="space-y-4 p-4 rounded-lg border border-input bg-muted/30">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="userAgreement"
                  checked={userAgreementsAccepted.userAgreement}
                  onCheckedChange={(checked) =>
                    setUserAgreementsAccepted({
                      ...userAgreementsAccepted,
                      userAgreement: checked,
                    })
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="userAgreement"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="https://www.glimznow.com/TnC/user-agreement"
                    target="_blank"
                    className="text-primary underline hover:text-primary/80 transition-colors"
                  >
                    User Agreement
                  </Link>
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacyPolicy"
                  checked={userAgreementsAccepted.privacyPolicy}
                  onCheckedChange={(checked) =>
                    setUserAgreementsAccepted({
                      ...userAgreementsAccepted,
                      privacyPolicy: checked,
                    })
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="privacyPolicy"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="https://www.glimznow.com/TnC/privacy-policy"
                    target="_blank"
                    className="text-primary underline hover:text-primary/80 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
          )}

          {userType === "creator" && detailStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channelName" className="text-sm font-semibold">
                  YouTube Channel Name *
                </Label>
                <Input
                  id="channelName"
                  value={creatorDetails.youtubeChannelName}
                  onChange={(e) =>
                    setCreatorDetails({
                      ...creatorDetails,
                      youtubeChannelName: e.target.value,
                    })
                  }
                  placeholder="Your channel name"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channelLink" className="text-sm font-semibold">
                  YouTube Channel Link *
                </Label>
                <Input
                  id="channelLink"
                  value={creatorDetails.youtubeChannelLink}
                  onChange={(e) =>
                    setCreatorDetails({
                      ...creatorDetails,
                      youtubeChannelLink: e.target.value,
                    })
                  }
                  placeholder="https://youtube.com/@yourchannel"
                  autoCapitalize="none"
                  className="h-12 text-base"
                />
              </div>
            </div>
          )}

          {userType === "creator" && detailStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subscribers" className="text-sm font-semibold">
                  Number of Subscribers *
                </Label>
                <Input
                  id="subscribers"
                  type="number"
                  value={creatorDetails.subscribers}
                  onChange={(e) =>
                    setCreatorDetails({
                      ...creatorDetails,
                      subscribers: e.target.value,
                    })
                  }
                  placeholder="e.g., 10000"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentLength" className="text-sm font-semibold">
                  Content Length *
                </Label>
                <Select
                  value={creatorDetails.contentLength}
                  onValueChange={(value) =>
                    setCreatorDetails({
                      ...creatorDetails,
                      contentLength: value,
                    })
                  }
                >
                  <SelectTrigger id="contentLength" className="h-12 text-base">
                    <SelectValue placeholder="Select content length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less than 10 min">
                      less than 10 min
                    </SelectItem>
                    <SelectItem value="10-20 min">10-20 min</SelectItem>
                    <SelectItem value="20-30 min">20-30 min</SelectItem>
                    <SelectItem value="greater than 30 min">
                      greater than 30 min
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {userType === "creator" && detailStep === 4 && (
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-input bg-muted/30">
              <Checkbox
                id="creatorAgreement"
                checked={creatorAgreementAccepted}
                onCheckedChange={(checked) =>
                  setCreatorAgreementAccepted(checked)
                }
                className="mt-1"
              />
              <Label
                htmlFor="creatorAgreement"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href="https://www.glimznow.com/TnC/content-creator-agreement"
                  target="_blank"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                >
                  Content Creator Agreement
                </Link>
              </Label>
            </div>
          )}
        </div>

        <div className="w-full space-y-3 pt-2">
          <Button
            onClick={handleNextStep}
            disabled={authLoading || !validateCurrentStep(detailStep)}
            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {authLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating...
              </span>
            ) : isLastStep ? (
              "Create Profile"
            ) : (
              "Continue"
            )}
          </Button>
          {detailStep > 0 && (
            <Button
              onClick={handlePrevStep}
              variant="ghost"
              className="w-full h-11 text-base hover:bg-muted"
            >
              Back
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case "mobile":
        return renderMobileStep();
      case "otp":
        return renderOtpStep();
      case "roleSelection":
        return renderRoleSelectionStep();
      case "userDetails":
        return renderUserDetailsStep();
      default:
        return renderMobileStep();
    }
  };

  const handleBackPress = () => {
    switch (step) {
      case "otp":
        setStep("mobile");
        setCountdown(0);
        break;
      case "roleSelection":
        setStep("otp");
        break;
      case "userDetails":
        handlePrevStep();
        break;
      default:
        break;
    }
  };

  const canGoBack = step !== "mobile";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackPress}
            className="absolute -top-12 left-0 z-10 hover:bg-muted rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="flex flex-col items-center space-y-8">
          <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <Image
                src="/logo.png"
                alt="Glimz Logo"
                width={100}
                height={100}
                className="object-contain relative z-10 drop-shadow-lg"
              />
            </div>
            {step !== "userDetails" && (
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Welcome to <span className="text-primary">Glimz</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your gateway to amazing content
                </p>
              </div>
            )}
          </div>

          <div className="w-full bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-2xl p-6 md:p-8">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
