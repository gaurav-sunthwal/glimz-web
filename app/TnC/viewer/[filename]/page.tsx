import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";

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

async function getDocumentContent(filename: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public/terms/Viewer Doc",
      filename
    );
    const fileBuffer = fs.readFileSync(filePath);

    const { value: html } = await mammoth.convertToHtml(
      { buffer: fileBuffer },
      {
        includeEmbeddedStyleMap: true,
        ignoreEmptyParagraphs: false,
        styleMap: [
          "p[style-name='Title'] => h1.docx-title:fresh",
          "p[style-name='Subtitle'] => h2.docx-subtitle:fresh",
          "p[style-name='Heading 1'] => h2.docx-h1:fresh",
          "p[style-name='Heading 2'] => h3.docx-h2:fresh",
          "p[style-name='Heading 3'] => h4.docx-h3:fresh",
          "p[style-name='Quote'] => blockquote.docx-quote",
          "table => table.docx-table",
          "th => th.docx-th",
          "td => td.docx-td",
          // don't force hyperlink runs; Mammoth emits <a> automatically
        ],
      }
    );

    // open links in new tab + safe rel
    const withSafeLinks = html.replace(
      /<a\b(?![^>]*\btarget=)/g,
      '<a target="_blank" rel="noopener noreferrer"'
    );

    return withSafeLinks;
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
  const { filename } = await params;
  const decodedFilename = decodeURIComponent(filename);
  const file = viewerFiles.find((f) => f.name === decodedFilename);

  if (!file) notFound();

  const content = await getDocumentContent(file.filename);

  if (!content) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="text-red-700">
              Unable to load the document. Please try again later.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/TnC/viewer"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Viewer Documents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {file.displayName}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/TnC/viewer"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Viewer Documents
            </Link>
            <Link
              href="/TnC"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Terms
            </Link>
          </div>
        </div>

        {/* Document card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
          <div
            className={[
              "prose prose-lg max-w-none",
              // headings & body — crisp black/dark text
              "prose-headings:text-gray-900",
              "prose-p:text-gray-900",
              "prose-strong:text-gray-900",
              "prose-li:marker:text-gray-500",
              // links — blue + underlined
              "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800",
              // tables & spacing polish
              "prose-table:my-4 prose-th:px-3 prose-td:px-3 prose-td:align-top",
              // images (if any in future)
              "prose-img:rounded-lg prose-img:mx-auto",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Download original */}
        <div className="mt-6">
          <a
            href={`/terms/Viewer%20Doc/${encodeURIComponent(file.filename)}`}
            download
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Download original document (.docx)
          </a>
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
