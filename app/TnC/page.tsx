import React from "react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Terms & Policies
          </h1>
          <p className="text-lg text-gray-600">
            Access our terms, conditions, and policies
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid gap-10 md:grid-cols-2">
          {/* Viewer Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                For Viewers
              </h2>
              <p className="text-gray-600">
                Terms and policies for content viewers
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Available documents:
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Complaint Policy and Procedure</li>
                <li>Cookie Policy</li>
                <li>Privacy Policy</li>
                <li>User Agreement</li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/TnC/viewer"
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                View Documents
              </Link>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                For Creators
              </h2>
              <p className="text-gray-600">
                Terms and policies for content creators
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Available documents:
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Content Creator Agreement</li>
                <li>Content Creator Privacy Policy</li>
                <li>Content Creator Terms & Conditions</li>
                <li>Content Guidelines Policy</li>
                <li>Content Takedown Policy</li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/TnC/creator"
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                View Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
