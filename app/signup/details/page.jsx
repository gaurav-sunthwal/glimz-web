"use client"

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { secureApi } from '../../lib/secureApi';

function UnifiedSignupComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileNumber = searchParams.get('mobileNumber');

  const [userType, setUserType] = useState('user'); // 'user' or 'creator'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    // Creator specific
    youtubeChannelName: '',
    youtubeChannelLink: '',
    subscribers: '',
    contentLength: '', // "less than 10 min", "10-20 min", "20-30 min", "greater than 30 min"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingProfile, setCheckingProfile] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await secureApi.getUserDetails();
      if (res && res.status && res.ViewerDetail) {
        window.dispatchEvent(new Event('auth-changed'));
        setTimeout(() => {
          window.location.href = '/';
        }, 50);
      }
    } catch (error) {
      // ignore
    } finally {
      setCheckingProfile(false);
    }
  }, []);

  useEffect(() => {
    // Preselect type from query if provided (e.g., userType=creator)
    const initialType = searchParams.get('userType');
    if (initialType === 'creator' || initialType === 'user') {
      setUserType(initialType);
    }
    checkAuthStatus();
  }, [checkAuthStatus, searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create user account using secure API with selected user type
      // For creators, ensure contentLength is one of the allowed values
      let submitData = { ...formData };
      if (userType === 'creator') {
        // Map possible legacy values to new allowed values (defensive, but not strictly needed)
        const allowedContentLengths = [
          "less than 10 min",
          "10-20 min",
          "20-30 min",
          "greater than 30 min"
        ];
        if (!allowedContentLengths.includes(submitData.contentLength)) {
          setError('Please select a valid content length.');
          setLoading(false);
          return;
        }
      }
      const response = await secureApi.createUser(submitData, userType);
      if (response && response.status) {
        // Account created successfully, redirect to home page and refresh
        window.dispatchEvent(new Event('auth-changed'));
        // Force a page refresh to update the header authentication status
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        const serverMessage = response?.message || response?.error || response?.details || 'Failed to create account';
        setError(typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage));
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating account:', error);
    } finally {
      setLoading(false);
    }
  };

  // While checking existing profile once, show a quick loader
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
        {mobileNumber && (
          <p className="text-center text-gray-400 mb-6">Mobile: {mobileNumber}</p>
        )}
        
        {/* User Type Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-3">Choose your account type:</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleUserTypeChange('user')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition duration-300 ${
                userType === 'user'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange('creator')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition duration-300 ${
                userType === 'creator'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              Creator
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          {userType === 'creator' && (
            <>
              <input
                type="text"
                name="youtubeChannelName"
                placeholder="YouTube Channel Name"
                value={formData.youtubeChannelName}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="url"
                name="youtubeChannelLink"
                placeholder="YouTube Channel Link"
                value={formData.youtubeChannelLink}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <input
                type="number"
                name="subscribers"
                placeholder="Number of Subscribers"
                min="0"
                value={formData.subscribers}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <select
                name="contentLength"
                value={formData.contentLength}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="" disabled>Select Content Length</option>
                <option value="less than 10 min">Less than 10 min</option>
                <option value="10-20 min">10-20 min</option>
                <option value="20-30 min">20-30 min</option>
                <option value="greater than 30 min">Greater than 30 min</option>
              </select>
            </>
          )}
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Account...' : `Complete ${userType === 'creator' ? 'Creator' : 'User'} Signup`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UnifiedSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnifiedSignupComponent />
    </Suspense>
  );
}
