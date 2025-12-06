import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const CreatorSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileNumber } = location.state || {};

  const [formData, setFormData] = useState({
    youtubeChannelName: '',
    youtubeChannelLink: '',
    subscribers: '',
    contentLength: '',
    email: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalUserData = { ...formData, mobileNumber, userType: 'creator' };
    
    // Save session in cookies
    Cookies.set('userSession', JSON.stringify(finalUserData), { expires: 7 });

    // Redirect to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Creator Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="youtubeChannelName"
            placeholder="YouTube Channel Name"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="url"
            name="youtubeChannelLink"
            placeholder="YouTube Channel Link"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="number"
            name="subscribers"
            placeholder="Number of Subscribers"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <select
            name="contentLength"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Select Content Length</option>
            <option value="<10">Less than 10 min</option>
            <option value="10-20">10-20 min</option>
            <option value="20-30">20-30 min</option>
            <option value=">30">Greater than 30 min</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
           <input
            type="text"
            name="genre"
            placeholder="Genre"
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300"
          >
            Complete Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatorSignup;
