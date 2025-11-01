// app/ClientWrapper.tsx (Client Component ✅)
"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobilePage from "./pages/MobilePage.jsx";
import { useIsMobile } from "./hooks/use-Mobile.jsx";
import FloatingUploadButton from "@/components/FloatingUploadButton";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {}, []);

  // Allow terms pages to be accessible on mobile
  const isTermsPage = pathname?.startsWith("/TnC");
  const isDeleteAccountPage = pathname?.startsWith("/delete-account");

  if (isMobile && !isTermsPage && !isDeleteAccountPage) {
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
    </Suspense>
  );
}
