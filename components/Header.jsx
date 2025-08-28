"use client";

import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ProfileButton from "@/components/ui/ProfileButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TabsNevbar from "./TabsNevbar";
export const Header = ({ onSearch }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const userSession = Cookies.get("userSession");
    if (userSession) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
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

  const mobileTabItems = [
    { id: "home", label: "Home", href: "/", icon: Home },
    { id: "explore", label: "Explore", href: "/explore", icon: Compass },
    { id: "wishlist", label: "Wishlist", href: "/my-list", icon: Bookmark },
    { id: "orders", label: "Orders", href: "/orders", icon: ShoppingCart },
    { id: "chat", label: "Chat", href: "/chat", icon: MessageCircle },
    { id: "profile", label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
              <button
                onClick={() => handleNavigation("/")}
                className="text-xl sm:text-2xl font-bold text-white hover:text-glimz-primary transition-colors"
              >
                <span className="bg-gradient-to-r from-glimz-primary to-glimz-secondary bg-clip-text text-transparent">
                  glimz
                </span>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-6">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className="btn-glimz-ghost text-sm font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
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

              {/* Mobile Search Button */}
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
                <div className="hidden md:block lg:block items-center">
                  <ProfileButton />
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => handleNavigation("/signup")}
                    className="btn-glimz-primary text-sm px-3 sm:px-4 py-2"
                  >
                    <span className="">Sign In</span>
                  </Button>
                  <Button
                    onClick={() => handleNavigation("/signup")}
                    className="btn-glimz-secondary  hover:btn-glimz-primary text-sm px-3 sm:px-4 py-2"
                  >
                    <span className="">Sign Up</span>
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
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Tab Bar - Only for phones (below sm breakpoint) */}
      <TabsNevbar />
    </>
  );
};
