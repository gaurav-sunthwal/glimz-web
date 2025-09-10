"use client"

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup/mobile/user'); // Use any userType since it will be handled in the unified page
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Join Glimz</h1>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <button 
          onClick={handleSignup}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Get Started
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
