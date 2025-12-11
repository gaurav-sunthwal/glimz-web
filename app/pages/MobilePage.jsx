import Logo from "@/components/Logo";
import Image from "next/image";
import React from "react";

export default function MobilePage() {
  // Background pattern dots

  // Welcome content data
  const welcomeContent = {
    title: "Welcome back!",
    subtitle:
      "You are on Premium Cricket offer - 4K Mobile/TV payment plan. Next payment on Nov 20, 2025. Download the StreamMax Mobile App to start watching.",
    starIcon: "GLimz",
    downloadButtonText: "Download the App",

    bgImg: "https://picsum.photos/1920/1080?random=2&blur=2",
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced background image */}
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover object-center filter brightness-50"
          src={welcomeContent.bgImg}
          alt="Background"
        />
      </div>

      {/* Main content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen p-8 pb-12">
        {/* Star icon */}
        <Logo />

        {/* Welcome text */}
        <div className="text-center max-w-sm mb-12">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {welcomeContent.title}
          </h1>
          <p className="text-gray-200 text-sm leading-relaxed mb-8 opacity-95 drop-shadow-md">
            {welcomeContent.subtitle}
          </p>
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 text-lg backdrop-blur-sm">
            {welcomeContent.downloadButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
