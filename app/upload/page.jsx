"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { isUserCreator, isAuthenticated } from "@/app/lib/authUtils";
import { MediaUploadStep } from "./components/MediaUploadStep";
import { ContentDetailsStep } from "./components/ContentDetailsStep";
import { VideoPreviewStep } from "./components/VideoPreviewStep";
import { PricingPublishStep } from "./components/PricingPublishStep";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/app/hooks/use-toast";

// Types matching the React Native app
export const CONTENT_CREATION_STEPS = {
  MEDIA_UPLOAD: 0,
  VIDEO_PREVIEW: 1,
  CONTENT_DETAILS: 2,
  PRICING_PUBLISH: 3,
};

const STEP_NAMES = [
  "Upload Media",
  "Preview",
  "Content Details",
  "Publish",
];

export default function UploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(CONTENT_CREATION_STEPS.MEDIA_UPLOAD);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  console.log("📄 [Upload Page] Component mounted/rendered");
  const [contentData, setContentData] = useState({
    teaserVideo: null,
    contentVideo: null,
    teaserThumbnail: null,
    contentData: {
      title: "",
      description: "",
      category: "",
      tags: [],
      isPremium: false,
      price: undefined,
      playlistId: null,
      ageRestriction: "G",
      hasCopyrightRights: false,
      isInformationAccurate: false,
    },
  });

  useEffect(() => {
    const checkAccess = async () => {
      console.log("🔍 [Upload Page] Checking access...");
      
      try {
        setIsLoading(true);
        
        // First check if session is incomplete via API (since cookies might be HttpOnly)
        const sessionCheck = await fetch('/api/auth/check-session', {
          method: 'GET',
          credentials: 'include',
        });
        const sessionData = await sessionCheck.json();
        console.log("🔍 [Upload Page] Session check:", sessionData);
        
        // Check if auth_token and uuid exist but is_creator cookie is missing
        if (sessionData.isIncompleteSession) {
          // Show toast first
          toast({
            title: "Session Incomplete",
            description: "Your session is incomplete. Please login again.",
            variant: "destructive",
          });
          
          // Clear all cookies via API (including HttpOnly cookies)
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.error("Error clearing session:", error);
          }
          
          // Also clear client-side cookies as fallback
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'is_creator=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          router.push("/auth");
          return;
        }
        
        // Check is_creator cookie to determine which endpoint to call (same as Header.jsx)
        const cookies = typeof document !== 'undefined' 
          ? document.cookie.split('; ').reduce((acc, cookie) => {
              const [key, value] = cookie.split('=');
              acc[key] = decodeURIComponent(value);
              return acc;
            }, {})
          : {};
        
        const isCreatorCookie = cookies['is_creator'];
        console.log("🔍 [Upload Page] is_creator cookie value:", isCreatorCookie);
        
        let endpoint;
        if (isCreatorCookie === '1') {
          endpoint = '/api/auth/get-creator-detail';
        } else if (isCreatorCookie === '0') {
          endpoint = '/api/auth/get-viewer-detail';
        } else {
          // Fallback to original endpoint
          endpoint = '/api/user/details';
        }

        console.log("🔍 [Upload Page] Making API call to:", endpoint);

        // Make direct API call to verify authentication (same method as Header.jsx)
        const resp = await fetch(endpoint, { method: 'GET', credentials: 'include' });
        const response = await resp.json();
        
        console.log("🔍 [Upload Page] API response status:", resp.status);
        console.log("🔍 [Upload Page] API response data:", response);
        
        // Check if response indicates authentication error (401 Unauthorized or status: false)
        const isAuthError = (!resp.ok && resp.status === 401) || !response || !response.status;
        
        if (!isAuthError && response && response.status) {
          // User is authenticated
          setIsAuth(true);
          setIsCreator(isCreatorCookie === '1');
          setIsLoading(false);
          
          console.log("✅ [Upload Page] User is authenticated");
          console.log("✅ [Upload Page] Creator status:", isCreatorCookie === '1');
          
          // If is_creator = 0, user is a viewer, redirect to home
          if (isCreatorCookie === '0') {
            console.log("❌ [Upload Page] User is a viewer (is_creator=0) - redirecting to /");
            router.push("/");
            return;
          }

          // If is_creator = 1, user is a creator, allow access
          if (isCreatorCookie === '1') {
            console.log("✅ [Upload Page] User is a creator (is_creator=1) - access granted");
            return;
          }
        } else {
          // Not authenticated - no valid auth_token/uuid
          console.log("❌ [Upload Page] User not authenticated - redirecting to /auth");
          setIsAuth(false);
          setIsCreator(false);
          setIsLoading(false);
          router.push("/auth");
          return;
        }
      } catch (error) {
        console.error("❌ [Upload Page] Error checking authentication:", error);
        setIsAuth(false);
        setIsCreator(false);
        setIsLoading(false);
        router.push("/auth");
      }
    };

    checkAccess();
  }, [router]);

  const handleDataChange = (updates) => {
    console.log("🔄 [Upload Page] handleDataChange called with:", updates);
    setContentData((prev) => {
      const newData = updates.contentData
        ? {
            ...prev,
            ...updates,
            contentData: {
              ...prev.contentData,
              ...updates.contentData,
            },
          }
        : {
            ...prev,
            ...updates,
          };
      console.log("🔄 [Upload Page] Previous data:", prev);
      console.log("🔄 [Upload Page] New data:", newData);
      return newData;
    });
  };

  const handleNext = () => {
    if (currentStep < Object.keys(CONTENT_CREATION_STEPS).length - 1) {
      console.log(`➡️ [Upload Page] Moving to next step: ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
    } else {
      console.log("⚠️ [Upload Page] Already on last step, cannot proceed");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      console.log(`⬅️ [Upload Page] Moving to previous step: ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    } else {
      console.log("⚠️ [Upload Page] Already on first step, cannot go back");
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case CONTENT_CREATION_STEPS.MEDIA_UPLOAD:
        return (
          contentData.teaserVideo &&
          contentData.contentVideo &&
          contentData.teaserThumbnail
        );
      case CONTENT_CREATION_STEPS.VIDEO_PREVIEW:
        return true; // Preview step is optional
      case CONTENT_CREATION_STEPS.CONTENT_DETAILS:
        return (
          contentData.contentData.title.trim() &&
          contentData.contentData.category &&
          contentData.contentData.hasCopyrightRights &&
          contentData.contentData.isInformationAccurate
        );
      default:
        return true;
    }
  };

  if (isLoading) {
    console.log("⏳ [Upload Page] Still loading...");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-glimz-primary" />
      </div>
    );
  }

  if (!isAuth) {
    console.log("🚫 [Upload Page] Not authenticated - returning null (will redirect)");
    return null; // Will redirect
  }

  if (!isCreator) {
    console.log("🚫 [Upload Page] Not a creator - showing access denied or redirecting");
    // This will be handled by the useEffect redirect logic
    // But show a loading state while checking
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-glimz-primary" />
        </div>
      );
    }
    
    // If we get here, show access denied message
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border-gray-700 p-8">
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertDescription className="text-white mt-2">
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-white/70 mb-4">
                  Only creators can upload content. Please create a creator account to access this feature.
                </p>
                <Button
                  onClick={() => {
                    console.log("🏠 [Upload Page] 'Go Home' button clicked - redirecting to /");
                    router.push("/");
                  }}
                  className="bg-glimz-primary hover:bg-glimz-primary/90 w-full"
                >
                  Go Home
                </Button>
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case CONTENT_CREATION_STEPS.MEDIA_UPLOAD:
        return (
          <MediaUploadStep
            data={contentData}
            onDataChange={handleDataChange}
            onNext={handleNext}
          />
        );
      case CONTENT_CREATION_STEPS.VIDEO_PREVIEW:
        return (
          <VideoPreviewStep
            data={contentData}
            onDataChange={handleDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case CONTENT_CREATION_STEPS.CONTENT_DETAILS:
        return (
          <ContentDetailsStep
            data={contentData}
            onDataChange={handleDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case CONTENT_CREATION_STEPS.PRICING_PUBLISH:
        return (
          <PricingPublishStep
            data={contentData}
            onDataChange={handleDataChange}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Create Content</h1>
            <Button
              variant="ghost"
              onClick={() => {
                console.log("🔙 [Upload Page] Cancel button clicked - routing back");
                router.back();
              }}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {STEP_NAMES.map((name, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] rounded-full border-2 transition-all shrink-0 ${
                      index === currentStep
                        ? "border-glimz-primary bg-glimz-primary text-white"
                        : index < currentStep
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-600 text-gray-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium whitespace-nowrap ${
                      index === currentStep
                        ? "text-white"
                        : index < currentStep
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {name}
                  </span>
                </div>
                {index < STEP_NAMES.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      index < currentStep ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">{renderStep()}</div>

        {/* Navigation Buttons */}
        {currentStep !== CONTENT_CREATION_STEPS.PRICING_PUBLISH && (
          <div className="max-w-4xl mx-auto mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white hover:bg-white/10"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="bg-glimz-primary hover:bg-glimz-primary/90 text-white"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
