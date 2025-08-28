"use client";
import React from "react";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";

export default function Page() {

  return (
    <>
      <div className="block md:hidden">
        <ExplorePage />
      </div>
      <div className="hidden md:block">
        <HomePage />
      </div>
    </>
  );
}
