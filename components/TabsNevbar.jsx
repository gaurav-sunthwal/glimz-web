"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Bookmark,
  ShoppingCart,
  MessageCircle,
  User,
} from "lucide-react";

const TabsNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");

  // Tab items configuration
  const tabItems = [
    { id: "home", href: "/", icon: Home },
    { id: "explore", href: "/explore", icon: Compass },
    { id: "wishlist", href: "/my-list", icon: Bookmark },
    { id: "orders", href: "/orders", icon: ShoppingCart },
    { id: "chat", href: "/chat", icon: MessageCircle },
    { id: "profile", href: "/profile", icon: User },
  ];

  // Update active tab based on current pathname
  useEffect(() => {
    const currentTab = tabItems.find((tab) => tab.href === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else {
      // Handle special cases
      if (pathname === "/tv" || pathname === "/movies") {
        setActiveTab("explore");
      } else if (pathname.startsWith("/profile")) {
        setActiveTab("profile");
      }
    }
  }, [pathname, tabItems]);

  const handleNavigation = (tab) => {
    setActiveTab(tab.id);
    router.push(tab.href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-white/10 block sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabItems.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors duration-200 ${
                isActive
                  ? "text-glimz-primary"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <IconComponent
                className={`h-5 w-5 mb-1 transition-colors duration-200 ${
                  isActive ? "text-glimz-primary" : ""
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabsNavBar;
