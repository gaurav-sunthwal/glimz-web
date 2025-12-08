import React, { useState } from 'react';
import { useRouter } from 'next/router';


const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const { mobileNumber, userType } = router.query || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp === '12345') {
      // Hardcoded OTP verification
      // Redirect to the appropriate details page
      const destination = userType === 'creator' ? '/signup/creator' : '/signup/user';
      router.push({ pathname: destination, query: { mobileNumber } });
    } else {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Mobile Number</h2>
        <p className="text-center text-gray-400 mb-4">Enter the OTP sent to your mobile number. (Hint: 12345)</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-center tracking-widest"
            maxLength="5"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
