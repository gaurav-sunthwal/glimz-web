import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FaUserCircle } from 'react-icons/fa';

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

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <FaUserCircle className="w-8 h-8 text-white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
          {userData && (
            <div className="px-4 py-2 text-sm text-white">
              <div className="mb-2">
                <p className="font-bold text-base truncate">{userData.name || userData.youtubeChannelName}</p>
                <p className="text-gray-400 truncate">{userData.email}</p>
                <p className="text-gray-400 truncate">{userData.mobileNumber}</p>
              </div>

              {userData.userType === 'creator' && (
                <div className="border-t border-gray-700 pt-2">
                  <p><span className="font-semibold">Genre:</span> {userData.genre}</p>
                  <p><span className="font-semibold">Subscribers:</span> {userData.subscribers}</p>
                  <p><span className="font-semibold">Content Length:</span> {userData.contentLength}</p>
                  {userData.youtubeChannelLink && (
                    <a
                      href={userData.youtubeChannelLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline truncate block mt-1"
                    >
                      View Channel
                    </a>
                  )}
                </div>
              )}
              <div className="border-t border-gray-700 my-2"></div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-purple-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
