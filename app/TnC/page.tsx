import React from "react";
import Link from "next/link";

export default function page() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms & Policies
          </h1>
          <p className="text-xl text-foreground-muted">
            Access our terms, conditions, and policies
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Viewer Section */}
          <div className="bg-card rounded-card shadow-card p-8 border border-border">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                For Viewers
              </h2>
              <p className="text-foreground-muted">
                Terms and policies for content viewers
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-foreground-muted mb-4">
                Available documents:
              </div>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>• Complaint Policy and Procedure</li>
                <li>• Cookie Policy</li>
                <li>• Privacy Policy</li>
                <li>• User Agreement</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="/TnC/viewer"
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                View Documents
              </Link>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-card rounded-card shadow-card p-8 border border-border">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                For Creators
              </h2>
              <p className="text-foreground-muted">
                Terms and policies for content creators
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-foreground-muted mb-4">
                Available documents:
              </div>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li>• Content Creator Agreement</li>
                <li>• Content Creator Privacy Policy</li>
                <li>• Content Creator Terms & Conditions</li>
                <li>• Content Guidelines Policy</li>
                <li>• Content Takedown Policy</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="/TnC/creator"
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
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
