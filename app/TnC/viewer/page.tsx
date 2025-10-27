import React from "react";
import Link from "next/link";

const viewerFiles = [
  {
    name: "complaint-policy-and-procedure",
    filename: "complaint policy and procedure.docx",
    displayName: "Complaint Policy and Procedure",
  },
  {
    name: "cookie-policy",
    filename: "cookie policy.docx",
    displayName: "Cookie Policy",
  },
  {
    name: "privacy-policy",
    filename: "privacy policy.docx",
    displayName: "Privacy Policy",
  },
  {
    name: "user-agreement",
    filename: "User agreement.docx",
    displayName: "User Agreement",
  },
];

export default function ViewerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Viewer Terms & Policies
          </h1>
          <p className="text-lg text-gray-600">
            Select a document to view its contents
          </p>
        </div>

        {/* Documents grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {viewerFiles.map((file) => (
            <Link
              key={file.name}
              href={`/TnC/viewer/${encodeURIComponent(file.name)}`}
              className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-500 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {file.displayName}
              </h3>
              <p className="text-sm text-blue-600 hover:underline">
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
