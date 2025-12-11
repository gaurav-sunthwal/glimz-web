"use client";
import Image from "next/image";
import React from "react";
import { Facebook, Twitter, Check } from "lucide-react";
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
                <a href="/TnC/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          {/* View Website in */}
          <div>
            <h3 className="text-lg font-semibold mb-4">View Website in</h3>
            <div className="flex items-center gap-2 text-zinc-400 text-base">
              <Check className="h-5 w-5 text-green-500" />
              <span>English</span>
            </div>
          </div>
          {/* Need Help? */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <ul className="space-y-2 text-zinc-400 text-base">
              <li>
                <a href="/TnC/content-creator-agreement" className="hover:text-white transition-colors">
                  Content Creator Agreement
                </a>
              </li>
              <li>
                <a href="/TnC/content-creator-privacy-policy" className="hover:text-white transition-colors">
                  Creator Privacy Policy
                </a>
              </li>
              <li>
                <a href="/TnC/content-creator-terms" className="hover:text-white transition-colors">
                  Creator Terms
                </a>
              </li>
              <li>
                <a href="/TnC/content-guidelines" className="hover:text-white transition-colors">
                  Content Guidelines
                </a>
              </li>
              <li>
                <a href="/TnC/user-agreement" className="hover:text-white transition-colors">
                  User Agreement
                </a>
              </li>
            </ul>
          </div>
          {/* Connect with Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
            <div className="flex items-center gap-6 mb-4">
              <a href="#" aria-label="Facebook">
                <Facebook className="h-6 w-6 text-zinc-400 hover:text-white transition-colors" />
              </a>
              <a href="#" aria-label="X">
                <Twitter className="h-6 w-6 text-zinc-400 hover:text-white transition-colors" />
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
            <a href="/TnC/content-takedown-policy" className="hover:text-white transition-colors">
              Takedown Policy
            </a>
            <a href="/TnC/complaint-policy-and-procedure" className="hover:text-white transition-colors">
              Complaint Policy
            </a>
            <a href="/TnC/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
