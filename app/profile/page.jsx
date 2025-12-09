"use client"

import { Suspense } from 'react';
import UserProfile from '../components/UserProfile';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account and view your information</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </div>
        }>
          <UserProfile />
        </Suspense>
      </div>
    </div>
  );
}
