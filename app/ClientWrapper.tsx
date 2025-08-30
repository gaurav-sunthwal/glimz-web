// app/ClientWrapper.tsx (Client Component ✅)
"use client";

import { Suspense, useEffect, useState } from "react";
import MobilePage from "./pages/MobilePage.jsx";
import { useIsMobile } from "./hooks/use-Mobile.jsx";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    

  useEffect(() => {
    
  }, []);

  if (isMobile) {
    return (
      <div className="block sm:hidden">
        <MobilePage />
      </div>
    );
  }

  return <Suspense>{children}</Suspense>;
}