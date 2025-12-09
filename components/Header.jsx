"use client";

import { useState, useEffect } from "react";
import { Search, User, LogOut, Settings } from "lucide-react";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { secureApi } from "@/app/lib/secureApi";
import { ProfileButton } from "./ProfileButton";
import { useToast } from "@/app/hooks/use-toast";

export const Header = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Check authentication by verifying auth_token and uuid exist
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // First check if session is incomplete via API (since cookies might be HttpOnly)
        const sessionCheck = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-session`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const sessionData = await sessionCheck.json();

        // Check if auth_token and uuid exist but is_creator cookie is missing
        if (sessionData.isIncompleteSession) {
          // Show toast first
          toast({
            title: "Session Incomplete",
            description: "Your session is incomplete. Please login again.",
            variant: "destructive",
          });

          // Clear all cookies via API (including HttpOnly cookies)
          try {
            await fetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
            });
          } catch (error) {
            console.error("Error clearing session:", error);
          }

          // Also clear client-side cookies as fallback
          document.cookie =
            "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "is_creator=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          router.push("/auth");
          return;
        }

        // Check is_creator cookie to determine which endpoint to call
        const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
          const [key, value] = cookie.split("=");
          acc[key] = decodeURIComponent(value);
          return acc;
        }, {});

        const isCreatorCookie = cookies["is_creator"];

        let endpoint;
        if (isCreatorCookie === "1") {
          endpoint = "/api/auth/get-creator-detail";
        } else if (isCreatorCookie === "0") {
          endpoint = "/api/auth/get-viewer-detail";
        } else {
          // Fallback to original endpoint
          endpoint = "/api/user/details";
        }

        // Make direct API call to verify authentication - this will return 401 if auth_token/uuid don't exist
        const resp = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });
        const response = await resp.json();

        // Check if response indicates authentication error (401 Unauthorized or status: false)
        const isAuthError =
          (!resp.ok && resp.status === 401) || !response || !response.status;

        if (!isAuthError && response && response.status) {
          setIsAuthenticated(true);
          setIsCreator(isCreatorCookie === "1");

          // Get profile data
          const userData =
            response.CreatorDetail ||
            response.ViewerDetail ||
            response.creatorDetail ||
            response.data;
          setProfileData(userData);
        } else {
          // Not authenticated - no valid auth_token/uuid
          // Clear any stale cookies that might exist
          if (
            isAuthError &&
            (resp.status === 401 || !response || !response.status)
          ) {
            // Clear cookies to prevent middleware from redirecting
            document.cookie =
              "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "is_creator=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
          setIsAuthenticated(false);
          setIsCreator(false);
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsCreator(false);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await secureApi.logout();
      setIsAuthenticated(false);
      setIsCreator(false);
      setProfileData(null);
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getUserName = () => {
    if (!profileData) return "User";
    return (
      profileData.name ||
      profileData.username ||
      profileData.first_name ||
      "User"
    );
  };

  const getUserEmail = () => {
    if (!profileData) return "";
    return profileData.email || "";
  };

  const navItems = [
    { label: "Home", href: "/" },
    // { label: "Movies", href: "/movies" },
    { label: "My List", href: "/my-list" },
    { label: "Watch History", href: "/watch-history" },
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
                <Logo
                  className="h-8 w-8 sm:h-10 sm:w-10 mr-2 drop-shadow-lg"
                  onClick={() => (window.location.href = "/")}
                />
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

              {/* Get Started Button - Show when not authenticated */}
              {!loading && !isAuthenticated && (
                <Button
                  onClick={() => {
                    // Clear any stale cookies before navigating to auth page
                    document.cookie =
                      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                      "uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                      "is_creator=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    router.push("/auth?redirect=/");
                  }}
                  className="bg-glimz-primary hover:bg-glimz-primary/90 text-white"
                  size="sm"
                >
                  Get Started
                </Button>
              )}

              {/* Profile Button - Show when authenticated */}
              {!loading && isAuthenticated && (
                <ProfileButton
                  profileData={profileData}
                  isCreator={isCreator}
                  onLogout={handleLogout}
                />
              )}

              {/* Tablet Menu Button - Only for tablets (sm to lg) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="hidden sm:flex lg:hidden btn-glimz-ghost"
              ></Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar - Only for phones (below sm breakpoint) */}
    </>
  );
};
