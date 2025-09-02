"use client"

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { secureApi } from '../../lib/secureApi';

function CreatorSignupComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileNumber = searchParams.get('mobileNumber');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const checkAuthStatus = async () => {
    try {
      // Check if we have the required cookies
      const authToken = document.cookie.includes('auth_token=');
      const uuid = document.cookie.includes('uuid=');
      
      if (authToken && uuid) {
        setIsAuthenticated(true);
        // If user is already authenticated, redirect to home
        // router.push('/');
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create user account using secure API
      const response = await secureApi.createUser(formData);
      console.log(response)
      if (response.status) {
        // Account created successfully, redirect to home page and refresh
        // router.push('/');
        // Dispatch auth event to update header
        window.dispatchEvent(new Event('auth-changed'));
        // Force a page refresh to update the header authentication status
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError(response.message || 'Failed to create account');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating account:', error);
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, show loading
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Creator Signup</h2>
        {mobileNumber && (
          <p className="text-center text-gray-400 mb-4">Mobile: {mobileNumber}</p>
        )}
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
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Account...' : 'Complete Signup'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreatorSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatorSignupComponent />
    </Suspense>
  );
}
