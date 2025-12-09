"use client";
import Image from "next/image";
import React from "react";

// Placeholder SVGs for social and store icons
const FacebookIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className="text-zinc-400 hover:text-white transition-colors"
  >
    <path
      d="M17 2.05A10 10 0 1 0 12 22V14.89h-2.13V12h2.13v-2.2c0-2.1 1.26-3.26 3.18-3.26.92 0 1.88.16 1.88.16v2.07h-1.06c-1.05 0-1.38.65-1.38 1.32V12h2.35l-.38 2.89h-1.97V22A10 10 0 0 0 17 2.05Z"
      fill="currentColor"
    />
  </svg>
);
const XIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className="text-zinc-400 hover:text-white transition-colors"
  >
    <path
      d="M17.53 3H21l-7.19 8.19L22 21h-6.56l-5.19-6.19L3.47 21H0l7.81-8.89L2 3h6.56l4.81 5.74L17.53 3Zm-1.13 15.5h1.81l-5.19-6.19-1.81-2.16-5.19 6.19h1.81l3.38-4.03 3.38 4.03Z"
      fill="currentColor"
    />
  </svg>
);
const GooglePlayIcon = () => (
  <Image
    src="/img/googleplay.png"
    alt="Get it on Google Play"
    width={140}
    height={40}
    className="object-contain"
    priority
  />
);
const AppStoreIcon = () => (
  <Image
    src="/img/appstore.png"
    alt="Download on the App Store"
    width={140}
    height={40}
    className="object-contain"
    priority
  />
);

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#18181b] text-white border-t border-white/10 pt-8 pb-4 px-4 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-zinc-400 text-base">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          {/* View Website in */}
          <div>
            <h3 className="text-lg font-semibold mb-4">View Website in</h3>
            <div className="flex items-center gap-2 text-zinc-400 text-base">
              <span className="text-xl">✔</span>
              <span>English</span>
            </div>
          </div>
          {/* Need Help? */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <ul className="space-y-2 text-zinc-400 text-base">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Visit Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Share Feedback
                </a>
              </li>
            </ul>
          </div>
          {/* Connect with Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
            <div className="flex items-center gap-6 mb-4">
              <a href="#" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="X">
                <XIcon />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Google Play">
                <GooglePlayIcon />
              </a>
              <a href="#" aria-label="App Store">
                <AppStoreIcon />
              </a>
            </div>
          </div>
        </div>
        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
          <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
            <span>© {year} STAR. All Rights Reserved.</span>
            <a href="#" className="hover:text-white transition-colors">
              Terms Of Use
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
