// app/creator/dashboard/CreatorDashboardClient.tsx
"use client";

import React, { useState } from "react";
import type { CreatorUI, UploadedContentUI, PlaylistUI } from "./page"; // import shared types

type Props = {
  creator: CreatorUI;
  uploadedContent: UploadedContentUI[];
  playlists: PlaylistUI[];
};

export default function CreatorDashboardClient({
  creator,
  uploadedContent,
  playlists,
}: Props) {
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const totalItems = uploadedContent.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = uploadedContent.slice(startIndex, endIndex);

  const rangeStart = totalItems === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(endIndex, totalItems);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-sm font-semibold">
            {creator.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{creator.name}</h1>
            <p className="text-xs text-slate-400">@{creator.username}</p>
          </div>
        </div>

        <button className="text-xs md:text-sm rounded-xl border border-slate-700 px-3 py-1.5 hover:bg-slate-900">
          + Upload New Content
        </button>
      </header>

      <main className="px-4 md:px-10 py-6 space-y-6">
        {/* Summary metrics */}
        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            label="Total Views"
            value={formatNumber(creator.totalViews)}
          />
          <MetricCard
            label="Total Videos"
            value={formatNumber(creator.totalVideos)}
          />
          <MetricCard
            label="Watch Hours"
            value={formatNumber(creator.watchHours)}
          />
          <MetricCard
            label="Total Likes"
            value={formatNumber(creator.totalLikes)}
          />
          <MetricCard
            label="Earnings (₹)"
            value={formatNumber(creator.earnings)}
          />
          <MetricCard
            label="Playlists"
            value={formatNumber(creator.totalPlaylists)}
          />
        </section>

        {/* Content + Playlists */}
        <section className="grid gap-6 lg:grid-cols-4">
          {/* Uploaded content table – 3/4 width on large screens */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Uploaded Content</h2>
                <p className="text-xs text-slate-400">
                  Showing {rangeStart}-{rangeEnd} of {totalItems} videos
                </p>
              </div>

              {totalItems > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    className="px-2 py-1 border border-slate-700 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span className="text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-2 py-1 border border-slate-700 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-3">Video</th>
                    <th className="py-2 px-3">Views</th>
                    <th className="py-2 px-3">Watch hrs</th>
                    <th className="py-2 px-3">Likes</th>
                    <th className="py-2 px-3">Shares</th>
                    <th className="py-2 px-3">Comments</th>
                    <th className="py-2 px-3">Price (₹)</th>
                    <th className="py-2 px-3">Earnings (₹)</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 pl-3 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-800/60 last:border-b-0 hover:bg-slate-900/60"
                    >
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="h-10 w-16 rounded-md object-cover bg-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-16 rounded-md bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 flex-shrink-0">
                              No image
                            </div>
                          )}
                          <p className="line-clamp-2 font-medium">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-2 px-3">{formatNumber(item.views)}</td>
                      <td className="py-2 px-3">
                        {formatNumber(item.watchHours)}
                      </td>
                      <td className="py-2 px-3">{formatNumber(item.likes)}</td>
                      <td className="py-2 px-3">{formatNumber(item.shares)}</td>
                      <td className="py-2 px-3">
                        {formatNumber(item.comments)}
                      </td>
                      <td className="py-2 px-3">₹{formatNumber(item.price)}</td>
                      <td className="py-2 px-3">
                        ₹{formatNumber(item.earnings)}
                      </td>
                      <td className="py-2 px-3">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="py-2 pl-3 text-right text-slate-300">
                        {item.uploadedOn}
                      </td>
                    </tr>
                  ))}

                  {pageItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-6 text-center text-xs text-slate-500"
                      >
                        No videos found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalItems > 0 && (
              <div className="mt-4 flex items-center justify-center gap-3 text-[11px]">
                <button
                  className="px-3 py-1 border border-slate-700 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 border border-slate-700 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Playlists section – 1/4 width */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Playlists</h2>
                <p className="text-xs text-slate-400">
                  Grouped content for better binge watching
                </p>
              </div>
              <button className="text-xs text-sky-400 hover:text-sky-300">
                + New playlist
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {playlists.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  No playlists created yet.
                </p>
              )}

              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-semibold">{pl.name}</h3>
                    <span className="text-[11px] text-slate-400">
                      {pl.videos} videos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-300 mt-1">
                    <span>Bundle price: ₹{formatNumber(pl.bundlePrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 flex flex-col justify-between">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isPaid = status.toLowerCase() === "paid";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
        isPaid
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
          : "bg-slate-700/40 text-slate-100 border-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function formatNumber(num: number | string): string {
  const n = typeof num === "string" ? Number(num) : num;
  if (Number.isNaN(n)) return String(num);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  if (!Number.isInteger(n)) return n.toFixed(1);
  return n.toString();
}
