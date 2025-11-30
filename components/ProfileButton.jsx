"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Crown,
  Video,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { secureApi } from "@/app/lib/secureApi";

export const ProfileButton = ({
  profileData,
  isCreator = false,
  onLogout,
  className = "",
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  };

  const getUserName = () => {
    if (!profileData) return "User";
    return (
      profileData.name ||
      `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() ||
      profileData.username ||
      "User"
    );
  };

  const getUserEmail = () => {
    if (!profileData) return "";
    return profileData.email || "";
  };

  const getProfileImage = () => {
    if (!profileData) return "";
    return (
      profileData.profile_picture ||
      profileData.avatar ||
      profileData.profile_image ||
      ""
    );
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await secureApi.logout();
      router.push("/");
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`group relative flex items-center gap-2.5 px-2.5 py-1.5 h-auto rounded-lg bg-transparent hover:bg-white/5 transition-all duration-200 ${className}`}
        >
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-9 w-9 transition-all duration-200">
              <AvatarImage
                src={getProfileImage()}
                alt={getUserName()}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-glimz-primary to-glimz-secondary text-white font-semibold text-sm">
                {getInitials(getUserName())}
              </AvatarFallback>
            </Avatar>
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
          </div>

          

          {/* Chevron Icon */}
          <ChevronDown
            className={`h-4 w-4 text-white/50 transition-transform duration-200 hidden md:block ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl"
      >
        {/* Profile Header Section */}
        <div className="relative p-6 bg-gradient-to-br from-glimz-primary/10 via-glimz-secondary/5 to-transparent border-b border-white/10">
          <div className="flex items-start gap-4">
            {/* Large Avatar */}
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-glimz-primary/30">
                <AvatarImage
                  src={getProfileImage()}
                  alt={getUserName()}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-glimz-primary to-glimz-secondary text-white font-bold text-2xl">
                  {getInitials(getUserName())}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">
                  {getUserName()}
                </h3>
                {isCreator && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-glimz-primary/20 to-glimz-secondary/20 text-glimz-primary border-glimz-primary/30"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Creator
                  </Badge>
                )}
              </div>
              {getUserEmail() && (
                <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{getUserEmail()}</span>
                </div>
              )}
              {profileData?.username && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <User className="h-3.5 w-3.5" />
                  <span>@{profileData.username}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section (if available) */}
          {(profileData?.views_count ||
            profileData?.subscribers ||
            profileData?.content_count) && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
              {profileData.views_count && (
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {profileData.views_count.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/60">Views</div>
                </div>
              )}
              {profileData.subscribers && (
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {profileData.subscribers.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/60">Subscribers</div>
                </div>
              )}
              {profileData.content_count && (
                <div className="text-center">
                  <div className="text-lg font-bold text-white">
                    {profileData.content_count}
                  </div>
                  <div className="text-xs text-white/60">Videos</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuLabel className="text-xs font-semibold text-white/60 px-2 py-1.5">
            Account
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              router.push("/profile");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/10 rounded-md transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-glimz-primary/20">
              <User className="h-4 w-4 text-glimz-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">View Profile</span>
              <span className="text-xs text-white/60">Manage your account</span>
            </div>
          </DropdownMenuItem>

          {isCreator && (
            <DropdownMenuItem
              onClick={() => {
                router.push("/upload");
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/10 rounded-md transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-glimz-primary/20">
                <Video className="h-4 w-4 text-glimz-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  Creator Dashboard
                </span>
                <span className="text-xs text-white/60">
                  Manage your content
                </span>
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => {
              router.push("/settings");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/10 rounded-md transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
              <Settings className="h-4 w-4 text-white/80" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Settings</span>
              <span className="text-xs text-white/60">
                Preferences & privacy
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2 bg-white/10" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-red-500/20 rounded-md transition-colors text-red-400"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
              <LogOut className="h-4 w-4 text-red-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Sign Out</span>
              <span className="text-xs text-red-400/70">
                Log out of your account
              </span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
