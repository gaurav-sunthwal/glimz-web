"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSignOutAlt, FaUsers, FaEnvelope, FaPhone } from 'react-icons/fa';
import { secureApi } from '@/app/lib/secureApi';

const ProfileButton = ({ onAuthChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isCheckingRef = useRef(false);

  const checkAuthStatus = async () => {
    if (isCheckingRef.current) return;
    try {
      isCheckingRef.current = true;
      setLoading(true);
      const response = await secureApi.getUserDetails();
      
      if (response.status && response.ViewerDetail) {
        // User has completed profile setup
        setUserData({
          ...response.ViewerDetail,
          userType: response.isCreator ? 'creator' : 'user'
        });
        if (onAuthChange) onAuthChange(true);
      } else if (response.needsProfileSetup) {
        // User needs to complete profile setup
        console.log("User needs to complete profile setup");
        setUserData(null);
        if (onAuthChange) onAuthChange(false);
        // Redirect to profile setup and preselect type if provided
        const preferred = response.preferredType ? `?userType=${encodeURIComponent(response.preferredType)}` : '';
        window.location.href = `/signup/details${preferred}`;
      } else {
        // User not authenticated
        setUserData(null);
        if (onAuthChange) onAuthChange(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUserData(null);
      if (onAuthChange) onAuthChange(false);
    } finally {
      setLoading(false);
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    // Run once on mount only
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await secureApi.logout();
      setUserData(null);
      setIsOpen(false);
      if (onAuthChange) onAuthChange(false);
      window.dispatchEvent(new Event('auth-changed'));
      router.push('/');
      router.refresh();
    } catch (error) {
      setUserData(null);
      setIsOpen(false);
      if (onAuthChange) onAuthChange(false);
      router.push('/');
      router.refresh();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.profile-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (loading) {
    return (
      <div className="relative">
        <button className="group relative p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative profile-dropdown">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="group relative p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg"
      >
        <FaUserCircle className="w-6 h-6 text-white group-hover:text-gray-100 transition-colors duration-200" />
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute -right-[100px] mt-4 w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
            
            {userData ? (
              <div className="relative">
                {/* Header Section */}
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {userData.first_name} {userData.last_name}
                      </h3>
                      <p className="text-xs text-purple-300 uppercase tracking-wider font-medium">
                        {userData.userType === 'creator' ? 'Content Creator' : 'User'}
                      </p>
                      <p className="text-xs text-gray-400">
                        @{userData.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaEnvelope className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm truncate">{userData.email}</span>
                  </div>
                  {userData.mobile_no && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FaPhone className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{userData.mobile_no}</span>
                    </div>
                  )}
                </div>

                {/* Profile Image */}
                {userData.profile_image && (
                  <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700/50">
                    <div className="flex items-center justify-center">
                      <img 
                        src={userData.profile_image} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Account Info */}
                <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700/50">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                    <FaUsers className="w-4 h-4 text-blue-400 mr-2" />
                    Account Details
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">User ID</span>
                      <span className="text-white font-medium">{userData.user_id}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">UUID</span>
                      <span className="text-white font-medium text-xs">{userData.uuid?.substring(0, 8)}...</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Member Since</span>
                      <span className="text-white font-medium">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Section */}
                <div className="px-6 py-4 border-t border-gray-700/50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-600 hover:to-red-500 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 group"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-2 group-hover:text-red-200 transition-colors duration-200" />
                    <span className="group-hover:text-red-200 transition-colors duration-200">
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUserCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-4">No user data found</p>
                <p className="text-xs text-gray-500">Please sign in to view your profile</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileButton;