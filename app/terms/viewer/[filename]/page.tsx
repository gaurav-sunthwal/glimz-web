import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";

const viewerFiles = [
  {
    name: "complaint policy and procedure",
    filename: "complaint policy and procedure.docx",
    displayName: "Complaint Policy and Procedure",
  },
  {
    name: "cookie policy",
    filename: "cookie policy.docx",
    displayName: "Cookie Policy",
  },
  {
    name: "privacy policy",
    filename: "privacy policy.docx",
    displayName: "Privacy Policy",
  },
  {
    name: "user agreement",
    filename: "User agreement.docx",
    displayName: "User Agreement",
  },
];

async function getDocumentContent(filename: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public/terms/Viewer Doc",
      filename
    );
    const fileBuffer = fs.readFileSync(filePath);
    const result = await mammoth.convertToHtml({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error("Error reading document:", error);
    return null;
  }
}

export default async function ViewerDocumentPage({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  // Await params as required by Next.js 15
  const { filename } = await params;
  // Decode the URL-encoded filename
  const decodedFilename = decodeURIComponent(filename);
  const file = viewerFiles.find((f) => f.name === decodedFilename);

  if (!file) {
    notFound();
  }

  const content = await getDocumentContent(file.filename);

  if (!content) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="text-red-700">
              Unable to load the document. Please try again later.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/terms/viewer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Viewer Documents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {file.displayName}
          </h1>
          <div className="flex gap-4">
            <Link
              href="/terms/viewer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Viewer Documents
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Terms
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-8 border border-border">
          <div
            className="prose prose-lg max-w-none prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return viewerFiles.map((file) => ({
    filename: encodeURIComponent(file.name),
  }));
}
