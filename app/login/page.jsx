"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { secureApi } from '../lib/secureApi';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function LoginPage() {
  const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send OTP using secure API
      const response = await secureApi.sendOTP(mobileNumber);
      
      if (response.status) {
        // OTP sent successfully, move to OTP step
        setStep('otp');
        setError('OTP sent successfully!');
        setTimeout(() => setError(''), 3000);
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await secureApi.verifyOTP(mobileNumber, otp);
      
      if (response.status) {
        // OTP verified successfully, check user type and route accordingly
        const isCreator = response.user?.is_creator;
        console.log("Login OTP Verification Response:", response);
        console.log("is_creator value:", isCreator);
        
        if (isCreator === null || typeof isCreator === 'undefined') {
          // User needs to complete profile setup
          router.push(`/signup/details?mobileNumber=${mobileNumber}`);
        } else {
          // User is registered (either creator or regular user) → go home and refresh
          router.push('/');
          // Dispatch auth event to update header
          window.dispatchEvent(new Event('auth-changed'));
          // Force a page refresh to update the header authentication status
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        setError(response.message || 'Invalid OTP');
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

  const goBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    setError('');
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {step === 'mobile' ? 'Login to Glimz' : 'Verify OTP'}
        </h2>
        
        {step === 'mobile' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <p className="text-center text-gray-400 mb-4">
              Enter your mobile number to receive OTP
            </p>
            
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
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
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            
            <div className="text-center">
              <p className="text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-center text-gray-400 mb-4">
              Enter the OTP sent to {mobileNumber}
            </p>
            
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
              {loading ? 'Verifying...' : 'Login'}
            </button>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={goBackToMobile}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                ← Back to Mobile
              </button>
              
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
