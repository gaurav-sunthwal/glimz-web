"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Maximize2,
  X,
  Image as ImageIcon,
  FileVideo,
} from "lucide-react";

export const VideoPreviewStep = ({ data }) => {
  const [paused, setPaused] = useState({ teaser: true, content: true });
  const [fullScreen, setFullScreen] = useState({
    visible: false,
    type: null,
    url: null,
    title: null,
  });

  const teaserVideoRef = useRef(null);
  const contentVideoRef = useRef(null);

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openFullScreenVideo = (type) => {
    const video = type === "teaser" ? data.teaserVideo : data.contentVideo;
    if (!video) return;

    setFullScreen({
      visible: true,
      type: "video",
      url: video.url,
      title: type === "teaser" ? "Teaser Video" : "Full Content Video",
    });
  };

  const openFullScreenThumbnail = () => {
    if (!data.teaserThumbnail) return;

    setFullScreen({
      visible: true,
      type: "image",
      url: data.teaserThumbnail.url,
      title: "Thumbnail Preview",
    });
  };

  const toggleTeaserPlayback = () => {
    const el = teaserVideoRef.current;
    if (!el) return;
    if (paused.teaser) el.play();
    else el.pause();
    setPaused((prev) => ({ ...prev, teaser: !prev.teaser }));
  };

  const toggleContentPlayback = () => {
    const el = contentVideoRef.current;
    if (!el) return;
    if (paused.content) el.play();
    else el.pause();
    setPaused((prev) => ({ ...prev, content: !prev.content }));
  };

  const closeFullScreen = () =>
    setFullScreen({ visible: false, type: null, url: null, title: null });

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Preview Your Media
        </h2>
        <p className="text-sm text-gray-400 max-w-2xl">
          Check how your teaser, thumbnail, and full content video look before
          you move ahead.
        </p>
      </div>

      {/* 2 cards above, 1 below */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Teaser Video Card */}
        {data.teaserVideo && (
          <Card className="bg-[#050816] border border-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileVideo className="h-4 w-4 text-pink-500" />
                    Teaser Video
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    This is what viewers see before the paywall.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    {data.teaserVideo.duration != null && (
                      <Badge className="bg-pink-600/10 text-pink-400 border-pink-500">
                        {formatTime(data.teaserVideo.duration)}
                      </Badge>
                    )}
                    {data.teaserVideo.fileSize && (
                      <Badge className="bg-pink-600/10 text-pink-300 border-pink-500/60">
                        {formatFileSize(data.teaserVideo.fileSize)}
                      </Badge>
                    )}
                  </div>
                  {data.teaserVideo.fileName && (
                    <span className="text-[11px] text-gray-400 max-w-[200px] truncate">
                      {data.teaserVideo.fileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800">
                <video
                  ref={teaserVideoRef}
                  src={data.teaserVideo.url}
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto rounded-full bg-black/80 hover:bg-black text-white w-14 h-14 shadow-lg"
                    onClick={toggleTeaserPlayback}
                  >
                    {paused.teaser ? (
                      <Play className="h-6 w-6" />
                    ) : (
                      <Pause className="h-6 w-6" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-black/80 hover:bg-black text-pink-400 rounded-full shadow-md"
                  onClick={() => openFullScreenVideo("teaser")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Thumbnail Card – now same style as teaser card */}
        {data.teaserThumbnail && (
          <Card className="bg-[#050816] border border-gray-800 rounded-2xl shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                    Thumbnail Preview
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    This thumbnail appears in the feed and preview.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    {/* {data.teaserThumbnail.width &&
                      data.teaserThumbnail.height && (
                        <Badge className="bg-pink-600/10 text-pink-300 border-pink-500/70">
                          {data.teaserThumbnail.width}×
                          {data.teaserThumbnail.height}
                        </Badge>
                      )} */}
                    {data.teaserThumbnail.fileSize && (
                      <Badge className="bg-pink-600/10 text-pink-300 border-pink-500/70">
                        {formatFileSize(data.teaserThumbnail.fileSize)}
                      </Badge>
                    )}
                  </div>
                  {data.teaserThumbnail.fileName && (
                    <span className="text-[11px] text-gray-400 max-w-[200px] truncate">
                      {data.teaserThumbnail.fileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800">
                <img
                  src={data.teaserThumbnail.url}
                  alt="Thumbnail"
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                {/* Center button acts like “preview” but only opens fullscreen */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto rounded-full bg-black/80 hover:bg-black text-pink-300 w-12 h-12 shadow-lg"
                    onClick={openFullScreenThumbnail}
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-black/80 hover:bg-black text-pink-400 rounded-full shadow-md"
                  onClick={openFullScreenThumbnail}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button> */}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Content Video Card (full width) */}
        {data.contentVideo && (
          <Card className="bg-[#050816] border border-gray-800 rounded-2xl shadow-lg md:col-span-2">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileVideo className="h-4 w-4 text-pink-500" />
                    Full Content Video
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    This is the main video users will pay to watch.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    {data.contentVideo.duration != null && (
                      <Badge className="bg-pink-600/10 text-pink-400 border-pink-500">
                        {formatTime(data.contentVideo.duration)}
                      </Badge>
                    )}
                    {data.contentVideo.fileSize && (
                      <Badge className="bg-pink-600/10 text-pink-300 border-pink-500/60">
                        {formatFileSize(data.contentVideo.fileSize)}
                      </Badge>
                    )}
                  </div>
                  {data.contentVideo.fileName && (
                    <span className="text-[11px] text-gray-400 max-w-[200px] truncate">
                      {data.contentVideo.fileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800">
                <video
                  ref={contentVideoRef}
                  src={data.contentVideo.url}
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto rounded-full bg-black/80 hover:bg-black text-white w-14 h-14 shadow-lg"
                    onClick={toggleContentPlayback}
                  >
                    {paused.content ? (
                      <Play className="h-6 w-6" />
                    ) : (
                      <Pause className="h-6 w-6" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 bg-black/80 hover:bg-black text-pink-400 rounded-full shadow-md"
                  onClick={() => openFullScreenVideo("content")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Screen Modal */}
      {fullScreen.visible && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeFullScreen}
        >
          <div className="relative max-w-6xl w-full">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
              {fullScreen.title && (
                <span className="text-sm font-semibold text-white">
                  {fullScreen.title}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/80 hover:bg-black text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFullScreen();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {fullScreen.type === "video" ? (
              <video
                src={fullScreen.url || undefined}
                controls
                className="w-full h-auto max-h-[90vh] rounded-xl shadow-2xl bg-black object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={fullScreen.url || undefined}
                alt={fullScreen.title || "Preview"}
                className="w-full h-auto max-h-[90vh] object-contain rounded-xl shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
