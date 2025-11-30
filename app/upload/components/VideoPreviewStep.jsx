"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Maximize2, X } from "lucide-react";

export const VideoPreviewStep = ({ data, onDataChange, onNext, onBack }) => {
  const [paused, setPaused] = useState({ teaser: true, content: true });
  const [fullScreen, setFullScreen] = useState({
    visible: false,
    type: null,
    url: null,
    title: null,
  });

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFullScreen = (type) => {
    const video = type === "teaser" ? data.teaserVideo : data.contentVideo;
    if (video) {
      setFullScreen({
        visible: true,
        type: "video",
        url: video.url || URL.createObjectURL(video.file),
        title: type === "teaser" ? "Teaser Video" : "Full Content Video",
      });
    }
  };

  const handleThumbnailFullScreen = () => {
    if (data.teaserThumbnail) {
      setFullScreen({
        visible: true,
        type: "image",
        url:
          data.teaserThumbnail.url ||
          URL.createObjectURL(data.teaserThumbnail.file),
        title: "Teaser Thumbnail",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Preview Your Videos</h2>
        <p className="text-gray-400">
          Review your uploaded videos before proceeding. Make sure they play
          correctly and meet your expectations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Teaser Video Preview */}
        {data.teaserVideo && (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Teaser Video Preview
                </h3>
                <div className="flex items-center gap-2">
                  {data.teaserVideo.duration && (
                    <Badge
                      variant="outline"
                      className="text-glimz-primary border-glimz-primary"
                    >
                      {formatTime(data.teaserVideo.duration)}
                    </Badge>
                  )}
                  {data.teaserVideo.fileSize && (
                    <span className="text-sm text-gray-400">
                      {formatFileSize(data.teaserVideo.fileSize)}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video
                  src={
                    data.teaserVideo.url ||
                    URL.createObjectURL(data.teaserVideo.file)
                  }
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el) {
                      el.paused !== paused.teaser && el.pause();
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/70 hover:bg-black/90 text-white"
                    onClick={() => {
                      const video = document.querySelector(
                        'video[src*="' +
                          (data.teaserVideo.url ||
                            URL.createObjectURL(data.teaserVideo.file)) +
                          '"]'
                      );
                      if (video) {
                        if (paused.teaser) {
                          video.play();
                        } else {
                          video.pause();
                        }
                        setPaused({ ...paused, teaser: !paused.teaser });
                      }
                    }}
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
                  className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-glimz-primary"
                  onClick={() => handleFullScreen("teaser")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Thumbnail Preview */}
              {data.teaserThumbnail && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      Thumbnail Preview
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-glimz-primary hover:text-glimz-primary/80"
                      onClick={handleThumbnailFullScreen}
                    >
                      <Maximize2 className="h-4 w-4 mr-1" />
                      Full Screen
                    </Button>
                  </div>
                  <div className="relative aspect-[4/5] bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={
                        data.teaserThumbnail.url ||
                        URL.createObjectURL(data.teaserThumbnail.file)
                      }
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    {data.teaserThumbnail.width &&
                      data.teaserThumbnail.height && (
                        <div className="absolute bottom-2 right-2">
                          <Badge
                            variant="outline"
                            className="bg-black/70 text-white border-gray-600"
                          >
                            {data.teaserThumbnail.width}×
                            {data.teaserThumbnail.height}
                          </Badge>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Video Preview */}
        {data.contentVideo && (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Full Content Preview
                </h3>
                <div className="flex items-center gap-2">
                  {data.contentVideo.duration && (
                    <Badge
                      variant="outline"
                      className="text-glimz-primary border-glimz-primary"
                    >
                      {formatTime(data.contentVideo.duration)}
                    </Badge>
                  )}
                  {data.contentVideo.fileSize && (
                    <span className="text-sm text-gray-400">
                      {formatFileSize(data.contentVideo.fileSize)}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <video
                  src={
                    data.contentVideo.url ||
                    URL.createObjectURL(data.contentVideo.file)
                  }
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el) {
                      el.paused !== paused.content && el.pause();
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/70 hover:bg-black/90 text-white"
                    onClick={() => {
                      const video = document.querySelector(
                        'video[src*="' +
                          (data.contentVideo.url ||
                            URL.createObjectURL(data.contentVideo.file)) +
                          '"]'
                      );
                      if (video) {
                        if (paused.content) {
                          video.play();
                        } else {
                          video.pause();
                        }
                        setPaused({ ...paused, content: !paused.content });
                      }
                    }}
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
                  className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-glimz-primary"
                  onClick={() => handleFullScreen("content")}
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
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
          onClick={() =>
            setFullScreen({ visible: false, type: null, url: null, title: null })
          }
        >
          <div className="relative max-w-6xl w-full">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
              <span className="text-white font-semibold">{fullScreen.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/70 hover:bg-black/90 text-white"
                onClick={() =>
                  setFullScreen({
                    visible: false,
                    type: null,
                    url: null,
                    title: null,
                  })
                }
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {fullScreen.type === "video" ? (
              <video
                src={fullScreen.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={fullScreen.url}
                alt={fullScreen.title}
                className="w-full h-auto max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
