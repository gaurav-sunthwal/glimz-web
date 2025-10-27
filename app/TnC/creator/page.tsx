import React from "react";
import Link from "next/link";

const creatorFiles = [
  {
    name: "content-creator-agreement",
    filename: "CONTENT CREATOR AGREEMENT.docx",
    displayName: "Content Creator Agreement",
  },
  {
    name: "content-creator-privacy-policy",
    filename: "CONTENT CREATOR PRIVACY POLICY.docx",
    displayName: "Content Creator Privacy Policy",
  },
  {
    name: "content-creator-terms",
    filename: "Content creator term & condition.docx",
    displayName: "Content Creator Terms & Conditions",
  },
  {
    name: "content-guidelines",
    filename: "content guidelines policy.docx",
    displayName: "Content Guidelines Policy",
  },
  {
    name: "content-takedown-policy",
    filename: "CONTENT TAKEDOWN POLICY.docx",
    displayName: "Content Takedown Policy",
  },
];

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Creator Terms & Policies
          </h1>
          <p className="text-lg text-gray-600">
            Select a document to view its contents
          </p>
        </div>

        {/* Documents grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {creatorFiles.map((file) => (
            <Link
              key={file.name}
              href={`/TnC/creator/${encodeURIComponent(file.name)}`}
              className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-green-500 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {file.displayName}
              </h3>
              <p className="text-sm text-green-600 hover:underline">
                Read document →
              </p>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/TnC"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Back to Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
