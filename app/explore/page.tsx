"use client";

import React from "react";
import ExplorePage from "../pages/ExplorePage";
import HomePage from "../pages/HomePage";
import { usePathname } from "next/navigation";
import { useIsMobile } from "../hooks/use-Mobile";
export default function Page() {
    const isMobile = useIsMobile();
    const pathname = usePathname();
    console.log("Pathname:", pathname);
    console.log("isMobile:", isMobile);
   
    
    
  return (
    <>
      <div className=" hidden sm:block">
        <ExplorePage />
      </div>
      <div className=" block sm:hidden">
        <HomePage/>
      </div>
    </>
  );
}
