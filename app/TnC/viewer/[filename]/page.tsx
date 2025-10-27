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
        // Use built-in docx style map + our own mappings to attach classes
        includeEmbeddedStyleMap: true,
        preserveEmptyParagraphs: true,
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
          // Hyperlinks are emitted as <a> by default; the line below is optional
          "r[style-name='Hyperlink'] => a",
        ],
        convertImage: mammoth.images.inline(async (element) => {
          const b64 = await element.read("base64");
          return { src: `data:${element.contentType};base64,${b64}` };
        }),
      }
    );

    // Ensure links open in a new tab & are safe
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

// If you’re on Next 15 app router with async params:
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
              href="/TnC/viewer"
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
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {file.displayName}
          </h1>
          <div className="flex gap-4">
            <Link
              href="/TnC/viewer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Viewer Documents
            </Link>
            <Link
              href="/TnC"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back to Terms
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-8 border border-border">
          <div
            className={[
              "prose prose-lg max-w-none",
              // Invert only if your theme needs it; otherwise remove `prose-invert`
              "prose-invert",
              // Ensure hyperlinks look like doc links
              "prose-a:underline prose-a:decoration-2 hover:prose-a:no-underline",
              "prose-a:break-words",
              // Tables and lists polish
              "prose-table:my-4 prose-th:px-3 prose-td:px-3 prose-td:align-top",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Optional: a tiny footer link to download the original DOCX */}
        <div className="mt-6">
          <a
            href={`/terms/Viewer%20Doc/${encodeURIComponent(file.filename)}`}
            download
            className="text-sm underline"
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
