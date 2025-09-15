"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { isUserCreator } from "@/app/lib/authUtils";

export default function FloatingUploadButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreator, setIsCreator] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user is a creator
    const checkCreatorStatus = () => {
      const creatorStatus = isUserCreator();
      setIsCreator(creatorStatus);
    };

    checkCreatorStatus();

    // Listen for auth changes
    const handleAuthEvent = () => {
      checkCreatorStatus();
    };

    window.addEventListener("auth-changed", handleAuthEvent);
    return () => {
      window.removeEventListener("auth-changed", handleAuthEvent);
    };
  }, []);

  useEffect(() => {
    // Show button after a short delay for better UX, but hide on upload page
    if (isCreator && pathname !== '/upload') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isCreator, pathname]);

  const handleUploadClick = () => {
    router.push("/upload");
  };

  if (!isCreator || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6">
      <Button
        onClick={handleUploadClick}
        className="h-14 w-14 rounded-full bg-glimz-primary hover:bg-glimz-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        size="icon"
      >
        <Upload className="h-6 w-6" />
      </Button>
      
      {/* Tooltip */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Upload Content
        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </div>
  );
}
