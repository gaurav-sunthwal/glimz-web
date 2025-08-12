import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MobileEntry = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const navigate = useNavigate();
  const { userType } = useParams(); // 'creator' or 'user'

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect to OTP verification, passing mobile number and user type
    navigate('/signup/otp', { state: { mobileNumber, userType } });
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
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default MobileEntry;
