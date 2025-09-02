"use client"

import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      <div className="flex w-full max-w-sm flex-col gap-4">
        <button 
          onClick={handleCreatorSignup}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Signup as a Creator
        </button>
        <button 
          onClick={handleUserSignup}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Signup as a User
        </button>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
