"use client";
import React, { useEffect } from "react";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import { useIsMobile } from "./hooks/use-Mobile";
import MobilePage from "./pages/MobilePage.jsx";
import Footer from "./components/footer";

export default function Page() {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <div className="">
          <MobilePage/>
        </div>
      ) : (
        <div className="">
          <HomePage />
          <Footer />
        </div>
      )}
    </>
  );
}
