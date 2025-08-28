"use client"

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FaUserCircle, FaYoutube, FaSignOutAlt, FaUsers, FaClock, FaTag, FaEnvelope, FaPhone } from 'react-icons/fa';

const ProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const sessionCookie = Cookies.get('userSession');
    if (sessionCookie) {
      try {
        setUserData(JSON.parse(sessionCookie));
      } catch (error) {
        console.error("Failed to parse user session cookie:", error);
        Cookies.remove('userSession');
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('userSession');
    window.location.reload();
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
          <div className="absolute  -right-[100px] mt-4 w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden backdrop-blur-sm">
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
                        {userData.name || userData.youtubeChannelName}
                      </h3>
                      <p className="text-xs text-purple-300 uppercase tracking-wider font-medium">
                        {userData.userType === 'creator' ? 'Content Creator' : 'User'}
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
                  {userData.mobileNumber && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FaPhone className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{userData.mobileNumber}</span>
                    </div>
                  )}
                </div>

                {/* Creator Specific Info */}
                {userData.userType === 'creator' && (
                  <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700/50">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                      <FaYoutube className="w-4 h-4 text-red-500 mr-2" />
                      Channel Details
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {userData.genre && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-400">
                            <FaTag className="w-3 h-3 mr-2 text-yellow-400" />
                            Genre
                          </span>
                          <span className="text-white font-medium">{userData.genre}</span>
                        </div>
                      )}
                      
                      {userData.subscribers && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-400">
                            <FaUsers className="w-3 h-3 mr-2 text-blue-400" />
                            Subscribers
                          </span>
                          <span className="text-white font-medium">{userData.subscribers}</span>
                        </div>
                      )}
                      
                      {userData.contentLength && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-400">
                            <FaClock className="w-3 h-3 mr-2 text-purple-400" />
                            Content Length
                          </span>
                          <span className="text-white font-medium">{userData.contentLength}</span>
                        </div>
                      )}
                    </div>

                    {userData.youtubeChannelLink && (
                      <a
                        href={userData.youtubeChannelLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <FaYoutube className="w-4 h-4 mr-2" />
                        View Channel
                      </a>
                    )}
                  </div>
                )}

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