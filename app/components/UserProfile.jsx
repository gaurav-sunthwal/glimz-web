"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { secureApi } from "../lib/secureApi";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try secure API call
        const response = await secureApi.getUserDetails();
        
        if (response.status && response.ViewerDetail) {
          setUserData(response.ViewerDetail);
        } else {
          // Fallback
          const fallbackData = getFallbackUserData();
          if (fallbackData) {
            console.log(fallbackData)
            setUserData(fallbackData);
          } else {
            setError("No user data available. Please sign in again.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        const fallbackData = getFallbackUserData();
        if (fallbackData) {
          setUserData(fallbackData);
        } else {
          setError("Failed to load user data. Please sign in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ✅ Helper to get uuid & auth_token from cookies/localStorage
  const getFallbackUserData = () => {
    if (typeof window !== "undefined") {
      try {
        // 1. Try cookies first
        const cookies = document.cookie
          .split(";")
          .map((c) => c.trim())
          .reduce((acc, cookie) => {
            const [key, value] = cookie.split("=");
            acc[key] = decodeURIComponent(value);
            return acc;
          }, {});

        const uuid = cookies["uuid"];
        const authToken = cookies["auth_token"];

        if (uuid && authToken) {
          return {
            uuid,
            auth_token: authToken,
          };
        }

        // 2. Fallback: localStorage
        const storedData = localStorage.getItem("userData");
        if (storedData) {
          return JSON.parse(storedData);
        }
      } catch (e) {
        console.error("Error reading fallback data:", e);
      }
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await secureApi.logout();

      // Clear cookies
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Clear local storage too
      if (typeof window !== "undefined") {
        localStorage.removeItem("userData");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("uuid");
      }

      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      router.push("/login");
    }
  };

  // ✅ UI logic stays the same
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition duration-300"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No user data available</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">User Profile</h3>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Display basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-purple-400 border-b border-gray-700 pb-2">
            Basic Information
          </h4>
          {userData.first_name && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="text-gray-400 text-sm">Full Name</span>
              <p className="text-white font-medium">
                {userData.first_name} {userData.last_name}
              </p>
            </div>
          )}
          {userData.email && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="text-gray-400 text-sm">Email</span>
              <p className="text-white font-medium">{userData.email}</p>
            </div>
          )}
          {userData.username && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <span className="text-gray-400 text-sm">Username</span>
              <p className="text-white font-medium">{userData.username}</p>
            </div>
          )}
        </div>

        
        
      </div>
    </div>
  );
}
