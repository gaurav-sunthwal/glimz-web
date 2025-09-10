"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  Heart,
  X,
  Home,
  Compass,
  Bookmark,
  ShoppingCart,
  MessageCircle,
  User,
} from "lucide-react";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import ProfileButton from "@/components/ui/ProfileButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TabsNevbar from "./TabsNevbar";
import { secureApi } from "@/app/lib/secureApi";

export const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const lastCheckRef = useRef(0);
  const isCheckingRef = useRef(false);

  const setIsLoggedInIfChanged = (next) => {
    setIsLoggedIn((prev) => (prev === next ? prev : next));
  };

  const checkAuthStatus = async () => {
    try {
      if (isCheckingRef.current) return;

      // Basic cookie check first
      const authToken = document.cookie.includes("auth_token=");
      const hasUuid = document.cookie.includes("uuid=");

      // Cooldown: if recently verified and cookies still present, skip re-check
      const now = Date.now();
      if (
        isLoggedIn &&
        authToken &&
        hasUuid &&
        now - lastCheckRef.current < 30000
      ) {
        return;
      }

      // If no cookies, immediately mark logged out without hitting API
      if (!authToken || !hasUuid) {
        setIsLoggedInIfChanged(false);
        lastCheckRef.current = now;
        return;
      }

      isCheckingRef.current = true;
      // Confirm with server only when needed
      const response = await secureApi.getUserDetails();
      if (response.status && response.ViewerDetail) {
        setIsLoggedInIfChanged(true);
      } else if (response.needsProfileSetup) {
        // User needs to complete profile setup, redirect them
        window.location.href = "/signup/details";
        setIsLoggedInIfChanged(false);
      } else {
        setIsLoggedInIfChanged(false);
      }
      lastCheckRef.current = Date.now();
    } catch (error) {
      // If API fails but cookies exist, keep current state to avoid loops
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check auth status when the page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Listen for explicit auth change events only
  useEffect(() => {
    const handleAuthEvent = () => {
      checkAuthStatus();
    };

    window.addEventListener("auth-changed", handleAuthEvent);
    return () => {
      window.removeEventListener("auth-changed", handleAuthEvent);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false); // Close mobile search after search
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
    // Set active tab based on path
    if (path === "/") setActiveTab("home");
    else if (path === "/explore") setActiveTab("explore");
    else if (path === "/my-list") setActiveTab("wishlist");
    else if (path === "/orders") setActiveTab("orders");
    else if (path === "/chat") setActiveTab("chat");
    else if (path === "/profile") setActiveTab("profile");
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileSearchOpen) {
      setIsMobileSearchOpen(false);
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "TV", href: "/tv" },
    { label: "Movies", href: "/movies" },
    { label: "My List", href: "/my-list" },
  ];

  return (
    <>
      <header className=" sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
              {/* <button
                onClick={() => handleNavigation("/")}
                className="text-xl sm:text-2xl font-bold text-white hover:text-glimz-primary transition-colors"
              >
                <span className="bg-gradient-to-r from-glimz-primary to-glimz-secondary bg-clip-text text-transparent">
                  glimz
                </span>
              </button> */}

              <div className="flex items-center">
                <Logo className="h-8 w-8 sm:h-10 sm:w-10 mr-2 drop-shadow-lg" />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "text-glimz-primary"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                  <Input
                    type="text"
                    placeholder="Search movies, shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input pl-10 w-48 lg:w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </form>

              {/* Search Button - Mobile Only */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileSearch}
                className="sm:hidden btn-glimz-ghost"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* My List Button - Hidden on small screens */}
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/my-list')}
                className="hidden md:flex btn-glimz-ghost"
              >
                <Heart className="h-4 w-4" />
              </Button> */}

              {/* Auth Button */}
              {isLoggedIn ? (
                <div className="hidden md:flex lg:flex items-center space-x-2">
                  <ProfileButton />
                  <Button
                    onClick={async () => {
                      try {
                        await secureApi.logout();
                        setIsLoggedIn(false);
                        router.push("/");
                        window.dispatchEvent(new Event("auth-changed"));
                      } catch (error) {
                        setIsLoggedIn(false);
                        router.push("/");
                        window.dispatchEvent(new Event("auth-changed"));
                      }
                    }}
                    variant="ghost"
                    className="btn-glimz-ghost text-sm px-3 py-2"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => handleNavigation("/login")}
                    variant="ghost"
                    className="btn-glimz-ghost text-sm px-3 sm:px-4 py-2 mr-2"
                  >
                    <span className="">Login</span>
                  </Button>
                  <Button
                    onClick={() => handleNavigation("/signup")}
                    className="btn-glimz-primary text-sm px-3 sm:px-4 py-2"
                  >
                    <span className="">Get Started</span>
                  </Button>
                </>
              )}

              {/* Tablet Menu Button - Only for tablets (sm to lg) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="hidden sm:flex lg:hidden btn-glimz-ghost"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {isMobileSearchOpen && (
            <div className="sm:hidden border-t border-white/10 py-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                  <Input
                    type="text"
                    placeholder="Search movies, shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}

          {/* Tablet Menu (only sm to lg - tablets/iPads only) */}
          {isMobileMenuOpen && (
            <div className="hidden sm:block lg:hidden border-t border-white/10 py-4">
              <nav className="space-y-3 mb-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="block w-full text-left btn-glimz-ghost text-base font-medium py-2"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Tablet My List Button */}
              <Button
                variant="ghost"
                onClick={() => handleNavigation("/my-list")}
                className="w-full btn-glimz-ghost justify-start"
              >
                <Heart className="h-4 w-4 mr-2" />
                My List
              </Button>

              {/* Tablet Logout Button */}
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await secureApi.logout();
                      setIsLoggedIn(false);
                      router.push("/");
                      window.dispatchEvent(new Event("auth-changed"));
                    } catch (error) {
                      setIsLoggedIn(false);
                      router.push("/");
                      window.dispatchEvent(new Event("auth-changed"));
                    }
                  }}
                  className="w-full btn-glimz-ghost justify-start text-red-400 hover:text-red-300"
                >
                  Logout
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Tab Bar - Only for phones (below sm breakpoint) */}
      <TabsNevbar />
    </>
  );
};
