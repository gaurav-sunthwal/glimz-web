"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  Heart,
  X,
} from "lucide-react";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import ProfileButton from "@/components/ui/ProfileButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { secureApi } from "@/app/lib/secureApi";
import { clearAllCookies } from "@/app/lib/authUtils";

export const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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

      const now = Date.now();

      // Check for is_creator cookie (non-httpOnly, readable by JavaScript)
      // auth_token and uuid are httpOnly, so we can't read them directly
      const isCreatorCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('is_creator='))
        ?.split('=')[1];
      
      const isRegistered = isCreatorCookie === '0' || isCreatorCookie === '1';
      const hasIsCreator = isCreatorCookie !== undefined && isCreatorCookie !== null;

      // If user has is_creator cookie set to 0 or 1, they are authenticated
      // Immediately set logged in state
      if (isRegistered) {
        setIsLoggedInIfChanged(true);
        
        // Cooldown: if recently verified and cookies still present, skip API re-check
        if (now - lastCheckRef.current < 30000) {
          return;
        }
        // Still make API call to get fresh profile data in background
        lastCheckRef.current = now;
      } else if (!hasIsCreator) {
        // No is_creator cookie - check if we have any cookies at all
        const hasAnyCookie = document.cookie.length > 0;
        if (!hasAnyCookie) {
          // No cookies at all - user is definitely not logged in
          setIsLoggedInIfChanged(false);
          lastCheckRef.current = now;
          return;
        }
        // We have some cookies but no is_creator - might be in profile setup
        // Continue to API check below
      }

      // Cooldown: if recently verified and cookies still present, skip re-check
      if (
        isLoggedIn &&
        hasIsCreator &&
        now - lastCheckRef.current < 30000
      ) {
        return;
      }

      isCheckingRef.current = true;
      // Use getUserDetailsByType to get the correct profile data
      const response = await secureApi.getUserDetailsByType();
      
      // Check if we have profile data (either ViewerDetail or creatorDetail)
      const profileData = response.ViewerDetail || response.creatorDetail || response.data;
      
      if (response.status && profileData) {
        // User is authenticated and has profile
        setIsLoggedInIfChanged(true);
      } else if (response.needsProfileSetup) {
        // User has auth tokens but needs to complete profile setup
        // Still show as logged in so they can access profile button
        // ProfileButton will handle redirecting to profile setup
        setIsLoggedInIfChanged(true);
      } else {
        // Check is_creator cookie - only clear if user is registered (0 or 1)
        // If is_creator is null, user needs profile setup, so don't clear cookies
        const isCreatorCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('is_creator='))
          ?.split('=')[1];
        
        const isRegistered = isCreatorCookie === '0' || isCreatorCookie === '1';
        const hasAnyCookie = document.cookie.length > 0;
        
        // Only clear cookies if user is registered (0/1) and got an error
        if (isRegistered && hasAnyCookie) {
          console.log('Authentication error detected for registered user. Clearing all cookies...');
          clearAllCookies();
        } else if (!isRegistered) {
          // is_creator is null - user needs profile setup, but has auth tokens
          // They're partially authenticated, show profile button but they'll need to complete setup
          setIsLoggedInIfChanged(true);
        } else {
          setIsLoggedInIfChanged(false);
        }
      }
      lastCheckRef.current = Date.now();
    } catch (error) {
      // Check is_creator cookie - only clear if user is registered (0 or 1)
      const isCreatorCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('is_creator='))
        ?.split('=')[1];
      
      const isRegistered = isCreatorCookie === '0' || isCreatorCookie === '1';
      const hasAnyCookie = document.cookie.length > 0;
      
      // Only clear cookies if user is registered (0/1) and got an error
      if (isRegistered && hasAnyCookie) {
        console.log('Authentication error caught for registered user. Clearing all cookies...', error);
        clearAllCookies();
        setIsLoggedInIfChanged(false);
      } else if (!isRegistered && hasAnyCookie) {
        // User has auth tokens but no profile yet - still show as logged in
        setIsLoggedInIfChanged(true);
      } else {
        setIsLoggedInIfChanged(false);
      }
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Also check immediately if is_creator cookie exists
    const isCreatorCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('is_creator='));
    const hasIsCreatorCookie = !!isCreatorCookie;
    
    if (hasIsCreatorCookie && !isLoggedIn) {
      // If is_creator cookie exists but we're not logged in, check again
      setTimeout(() => checkAuthStatus(), 100);
    }
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
      // Force immediate check when auth changes
      isCheckingRef.current = false;
      checkAuthStatus();
    };

    window.addEventListener("auth-changed", handleAuthEvent);
    
    // Also listen for storage events (in case auth state changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'glimz-auth-storage') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener("auth-changed", handleAuthEvent);
      window.removeEventListener('storage', handleStorageChange);
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
                <div className="flex items-center">
                  <ProfileButton onAuthChange={setIsLoggedInIfChanged} />
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/auth")}
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
                
              </Button>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Tab Bar - Only for phones (below sm breakpoint) */}
    </>
  );
};
