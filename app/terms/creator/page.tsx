import React from "react";
import Link from "next/link";

const creatorFiles = [
  {
    name: "content-creator-agreement",
    filename: "CONTENT CREATOR AGREEMENT.docx",
    displayName: "Content Creator Agreement",
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
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Creator Terms & Policies
          </h1>
          <p className="text-foreground-muted">
            Select a document to view its contents
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {creatorFiles.map((file) => (
            <Link
              key={file.name}
              href={`/terms/creator/${encodeURIComponent(file.name)}`}
              className="block p-6 bg-card rounded-card shadow-card hover:shadow-glow transition-all duration-300 border border-border hover:border-white/10"
            >
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {file.displayName}
              </h3>
              <p className="text-sm text-foreground-muted">Click to view document</p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/terms"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
