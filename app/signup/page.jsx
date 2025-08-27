"use client"

import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const handleCreatorSignup = () => {
    router.push('/signup/mobile/creator');
  };

  const handleUserSignup = () => {
    router.push('/signup/mobile/user');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Join Glimz</h1>
      <div className="flex flex-wrap p-3  w-full justify-center gap-5">
        <button 
          onClick={handleCreatorSignup}
          className="w-full md:w-[50%] bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Signup as a Creator
        </button>
        <button 
          onClick={handleUserSignup}
          className="w-full md:w-[50%] bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Signup as a User
        </button>
      </div>
    </div>
  );
}
