// app/ClientWrapper.tsx (Client Component ✅)
"use client";

import { Suspense, useEffect } from "react";
import MobilePage from "./pages/MobilePage.jsx";
import { useIsMobile } from "./hooks/use-Mobile.jsx";
import FloatingUploadButton from "@/components/FloatingUploadButton";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();


  useEffect(() => {
    
  }, []);

  if (isMobile) {
    return (
      <div className="block sm:hidden">
        <MobilePage />
        <FloatingUploadButton />
      </div>
    );
  }

  return (
    <Suspense>
      {children}
      <FloatingUploadButton />
    </Suspense>
  );
}