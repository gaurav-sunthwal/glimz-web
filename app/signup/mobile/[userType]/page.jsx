"use client"

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { secureApi } from '../../../lib/secureApi';

export default function CreatorMobileEntryPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const {userType} = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send OTP using secure API
      const isCreator = userType === 'creator' ? 1 : 0;
      const response = await secureApi.sendOTP(mobileNumber, isCreator);
      console.log("otp and the res" + response)
      if (response.status) {
        // OTP sent successfully, redirect to OTP verification
        router.push(`/signup/otp?mobileNumber=${mobileNumber}&userType=${userType}`);
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Enter Your Mobile Number</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
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
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
