// app/ClientWrapper.tsx (Client Component ✅)
"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobilePage from "./pages/MobilePage.jsx";
import { useIsMobile } from "./hooks/use-Mobile.jsx";
import FloatingUploadButton from "@/components/FloatingUploadButton";
import { Toaster } from "@/components/ui/toaster";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => { }, []);

  // Allow specific pages to be accessible on mobile
  const isTermsPage = pathname?.startsWith("/TnC");
  const isDeleteAccountPage = pathname?.startsWith("/delete-account");
  const isOrderPage = pathname?.startsWith("/order");

  if (isMobile && !isTermsPage && !isDeleteAccountPage && !isOrderPage) {
    return (
      <div className="block sm:hidden">
        <MobilePage />
        {/* <FloatingUploadButton /> */}
      </div>
    );
  }

  return (
    <Suspense>
      {children}
      <FloatingUploadButton />
      <Toaster />
    </Suspense>
  );
}
