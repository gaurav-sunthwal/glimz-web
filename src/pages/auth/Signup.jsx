import React from 'react';
import Link from 'next/link';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Join Glimz</h1>
      <div className="flex space-x-4">
        <Link href="/signup/mobile/creator">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Signup as a Creator
          </button>
        </Link>
        <Link href="/signup/mobile/user">
          <button className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Signup as a User
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Signup;
