"use client"

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { secureApi } from '../../lib/secureApi';
import AuthGuard from '@/components/AuthGuard';

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobileNumber = searchParams.get('mobileNumber');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await secureApi.verifyOTP(mobileNumber, otp);
      console.log("verify otp response:", response);
      if (response && response.status) {
        // If backend returns user with is_creator flag, decide routing
        const isCreator = response.user?.is_creator;
        console.log("OTP Verification Response:", response);
        console.log("is_creator value:", isCreator);
        
        if (isCreator === null || typeof isCreator === 'undefined') {
          // Not registered yet → go to details
          router.push(`/signup/details?mobileNumber=${mobileNumber}`);
        } else if (isCreator === 1) {
          // User is a creator → go home and refresh header
          window.dispatchEvent(new Event('auth-changed'));
          router.push('/');
          setTimeout(() => {
            window.location.reload();
          }, 50);
        } else if (isCreator === 0) {
          // User is a regular user → go home and refresh header
          window.dispatchEvent(new Event('auth-changed'));
          router.push('/');
          setTimeout(() => {
            window.location.reload();
          }, 50);
        } else {
          // Fallback: go to details page
          router.push(`/signup/details?mobileNumber=${mobileNumber}`);
        }
      } else {
        setError(response?.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error verifying OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await secureApi.resendOTP(mobileNumber);
      
      if (response.status) {
        setError('OTP resent successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error resending OTP:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Mobile Number</h2>
        <p className="text-center text-gray-400 mb-4">Enter the OTP sent to {mobileNumber}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-center tracking-widest"
            maxLength={6}
          />
          
          {error && (
            <p className={`text-sm ${error.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="text-purple-400 hover:text-purple-300 text-sm underline"
          >
            {resendLoading ? 'Sending...' : 'Resend OTP'}
          </button>
          
        
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
