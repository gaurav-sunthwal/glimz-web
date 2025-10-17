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
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Viewer Terms & Policies
          </h1>
          <p className="text-foreground-muted">
            Select a document to view its contents
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          {viewerFiles.map((file) => (
            <Link
              key={file.name}
              href={`/TnC/viewer/${encodeURIComponent(file.name)}`}
              className="block p-6 bg-card rounded-card shadow-card hover:shadow-glow transition-all duration-300 border border-border hover:border-white/10"
            >
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {file.displayName}
              </h3>
              <p className="text-sm text-foreground-muted text-blue-500 hover:underline">
                Read document
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/TnC"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
