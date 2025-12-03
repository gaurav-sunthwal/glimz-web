"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Video,
  ImageIcon,
  Play,
  Pause,
  Maximize2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Image as ImageLucide,
} from "lucide-react";

const THUMBNAIL_DIMENSIONS = {
  width: 1600,
  height: 2000,
  aspectRatio: 0.8, // 4:5 aspect ratio
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ----------------------- VIDEO CARD (Teaser / Content) ----------------------- */

const VideoPreviewCard = ({
  video,
  type,
  onUpload,
  onRemove,
  onVideoPreview,
}) => {
  const [paused, setPaused] = useState(true);
  const videoRef = useRef(null);

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive,
  } = useDropzone({
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".wmv", ".webm"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          alert("Video file size must be less than 500MB");
        } else {
          alert("Invalid video file. Please select a valid video file.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const tempVideo = document.createElement("video");
        tempVideo.preload = "metadata";
        tempVideo.onloadedmetadata = () => {
          const duration = tempVideo.duration;

          if (type === "teaser" && duration > 90) {
            alert("Teaser video must be 90 seconds or less");
            return;
          }

          const videoData = {
            file,
            url: URL.createObjectURL(file),
            duration,
            fileName: file.name,
            fileSize: file.size,
          };

          onUpload(type, videoData);
        };
        tempVideo.onerror = () => {
          alert("Failed to load video. Please try another file.");
        };
        tempVideo.src = URL.createObjectURL(file);
      }
    },
    disabled: !!video,
  });

  return (
    <div className="space-y-3">
      {/* Top badges (duration + size) */}
      <div className="flex items-center justify-between">
        {video && (
          <div className="flex items-center gap-2 ml-auto">
            {video.duration != null && (
              <Badge
                variant="outline"
                className="text-glimz-primary border-glimz-primary bg-glimz-primary/10"
              >
                {formatTime(video.duration)}
              </Badge>
            )}
            {video.fileSize && (
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-600"
              >
                {formatFileSize(video.fileSize)}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div
        {...getVideoRootProps()}
        className={`relative aspect-[4/5] w-full h-[260px] rounded-lg overflow-hidden border border-dashed transition-all duration-300 ${
          isVideoDragActive
            ? "border-glimz-primary bg-glimz-primary/10 scale-[1.02]"
            : video
            ? "border-gray-700 bg-gray-900"
            : "border-gray-600 bg-gray-800/50 hover:border-glimz-primary/50 hover:bg-gray-800 cursor-pointer"
        }`}
      >
        <input {...getVideoInputProps()} />
        {video ? (
          <>
            <video
              ref={videoRef}
              src={video.url || URL.createObjectURL(video.file)}
              className="w-full h-full object-contain bg-black"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/70 hover:bg-black/90 text-white w-14 h-14 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaused((prev) => {
                      const next = !prev;
                      if (videoRef.current) {
                        if (!next) {
                          videoRef.current.play();
                        } else {
                          videoRef.current.pause();
                        }
                      }
                      return next;
                    });
                  }}
                >
                  {paused ? (
                    <Play className="h-7 w-7" />
                  ) : (
                    <Pause className="h-7 w-7" />
                  )}
                </Button>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                {onVideoPreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/70 hover:bg-black/90 text-glimz-primary backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoPreview(type);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/70 hover:bg-black/90 text-red-400 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(type);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-black/70 text-white backdrop-blur-sm border-0 max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                  <FileVideo className="h-3 w-3 mr-1" />
                  <span className="truncate">{video.fileName}</span>
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            {isVideoDragActive ? (
              <div className="text-center space-y-3 animate-pulse">
                <Upload className="h-10 w-10 text-glimz-primary mx-auto" />
                <p className="text-glimz-primary font-semibold text-sm">
                  Drop video here
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-glimz-primary/20 rounded-full blur-xl" />
                  <Upload className="h-10 w-10 text-glimz-primary mx-auto relative z-10" />
                </div>
                <p className="text-white font-semibold text-sm">
                  {type === "teaser"
                    ? "Upload Teaser Video"
                    : "Upload Content Video"}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ----------------------- THUMBNAIL CARD (Separate) ----------------------- */

const ThumbnailUploadCard = ({
  thumbnail,
  onThumbnailUpload,
  onThumbnailRemove,
  onThumbnailPreview,
}) => {
  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
    isDragActive: isThumbnailDragActive,
  } = useDropzone({
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          alert("Image file size must be less than 10MB");
        } else {
          alert("Invalid image file. Please select a valid image file.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const img = new Image();
        img.onerror = () => {
          alert("Failed to load image. Please try another file.");
        };
        img.onload = () => {
          const thumbnailData = {
            file,
            url: URL.createObjectURL(file),
            fileName: file.name,
            fileSize: file.size,
            width: img.width,
            height: img.height,
          };
          onThumbnailUpload("teaser", thumbnailData);
        };
        img.src = URL.createObjectURL(file);
      }
    },
    disabled: !!thumbnail,
  });

  return (
    <div className="space-y-3">
      {/* Top badges: dimensions + size (like video) */}
      <div className="flex items-center justify-between">
        {thumbnail && (
          <div className="flex items-center gap-2 ml-auto">
            {thumbnail.width && thumbnail.height && (
              <Badge
                variant="outline"
                className="bg-black/70 text-white border-gray-600 backdrop-blur-sm"
              >
                {thumbnail.width}×{thumbnail.height}
              </Badge>
            )}
            {thumbnail.fileSize && (
              <Badge
                variant="outline"
                className="bg-black/70 text-white border-gray-600 backdrop-blur-sm"
              >
                {formatFileSize(thumbnail.fileSize)}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div
        {...getThumbnailRootProps()}
        className={`relative aspect-[4/5] w-full h-[260px] rounded-lg overflow-hidden border border-dashed transition-all duration-300 ${
          isThumbnailDragActive
            ? "border-pink-500 bg-pink-500/10 scale-[1.02]"
            : thumbnail
            ? "border-gray-700 bg-gray-900"
            : "border-gray-600 bg-gray-800/50 hover:border-pink-500/50 hover:bg-gray-800 cursor-pointer"
        }`}
      >
        <input {...getThumbnailInputProps()} />
        {thumbnail ? (
          <>
            <img
              src={thumbnail.url || URL.createObjectURL(thumbnail.file)}
              alt="Thumbnail"
              className="w-full h-full object-contain bg-black"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <div className="absolute top-3 right-3 flex gap-2">
                {onThumbnailPreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/70 hover:bg-black/90 text-glimz-primary backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onThumbnailPreview("teaser");
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onThumbnailRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/70 hover:bg-black/90 text-red-400 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onThumbnailRemove("teaser");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                <Badge className="bg-black/70 text-white backdrop-blur-sm border-0 max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                  <ImageLucide className="h-3 w-3 mr-1" />
                  <span className="truncate">{thumbnail.fileName}</span>
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {isThumbnailDragActive ? (
              <div className="text-center space-y-3 animate-pulse">
                <ImageIcon className="h-10 w-10 text-pink-500 mx-auto" />
                <p className="text-pink-500 font-semibold text-sm">
                  Drop image here
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="relative mx-auto w-fit">
                  <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl" />
                  <ImageIcon className="h-8 w-8 text-pink-500 relative z-10" />
                </div>
                <p className="text-white text-sm font-medium">Add Thumbnail</p>
                <p className="text-gray-400 text-xs">Click or drag</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ----------------------- MAIN UPLOAD STEP ----------------------- */

export const MediaUploadStep = ({ data, onDataChange }) => {
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    type: null,
    url: null,
  });

  useEffect(() => {
    console.log("📊 [MediaUpload] Current data state:", {
      teaserVideo: !!data.teaserVideo,
      teaserThumbnail: !!data.teaserThumbnail,
      contentVideo: !!data.contentVideo,
    });
  }, [data.teaserThumbnail, data.teaserVideo, data.contentVideo]);

  const handleVideoUpload = useCallback(
    (type, videoData) => {
      if (type === "teaser") {
        onDataChange({ teaserVideo: videoData });
      } else {
        onDataChange({ contentVideo: videoData });
      }
    },
    [onDataChange]
  );

  const handleThumbnailUpload = useCallback(
    (type, thumbnailData) => {
      onDataChange({ teaserThumbnail: thumbnailData });
    },
    [onDataChange]
  );

  const handleVideoRemove = (type) => {
    if (type === "teaser") {
      onDataChange({ teaserVideo: null });
    } else {
      onDataChange({ contentVideo: null });
    }
  };

  const handleThumbnailRemove = () => {
    onDataChange({ teaserThumbnail: null });
  };

  const handleVideoPreview = (type) => {
    const video = type === "teaser" ? data.teaserVideo : data.contentVideo;
    if (video) {
      setPreviewModal({
        visible: true,
        type: "video",
        url: video.url || URL.createObjectURL(video.file),
      });
    }
  };

  const handleThumbnailPreview = () => {
    if (data.teaserThumbnail) {
      setPreviewModal({
        visible: true,
        type: "image",
        url:
          data.teaserThumbnail.url ||
          URL.createObjectURL(data.teaserThumbnail.file),
      });
    }
  };

  const uploadedCount = [
    data.teaserVideo,
    data.teaserThumbnail,
    data.contentVideo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Upload Media</h1>
        <p className="text-sm text-gray-400">
          Upload your teaser, thumbnail, and full content video to continue.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950/80 p-4">
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-gray-400">
            Upload Progress: {uploadedCount} / 3 items
          </span>
          <span className="text-glimz-primary font-semibold">
            {Math.round((uploadedCount / 3) * 100)}%
          </span>
        </div>
        <Progress value={(uploadedCount / 3) * 100} className="h-2" />
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 mt-1">
          <div className="flex items-center gap-1">
            {data.teaserVideo ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-gray-500" />
            )}
            <span>Teaser Video</span>
          </div>
          <div className="flex items-center gap-1">
            {data.teaserThumbnail ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-gray-500" />
            )}
            <span>Thumbnail</span>
          </div>
          <div className="flex items-center gap-1">
            {data.contentVideo ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-gray-500" />
            )}
            <span>Content Video</span>
          </div>
        </div>
      </div>

      {/* Wider cards: 2 columns on md+ */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Teaser Video Card */}
        <Card className="bg-gray-900 border border-gray-700 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-glimz-primary" />
                Teaser Video
              </CardTitle>
              <Badge
                variant="outline"
                className="text-pink-400 border-pink-500 text-[10px]"
              >
                Required
              </Badge>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Upload your teaser video (max 90 seconds).
            </p>
          </CardHeader>
          <CardContent>
            <VideoPreviewCard
              video={data.teaserVideo}
              type="teaser"
              onUpload={handleVideoUpload}
              onRemove={handleVideoRemove}
              onVideoPreview={handleVideoPreview}
            />
          </CardContent>
        </Card>

        {/* Thumbnail Card */}
        <Card className="bg-gray-900 border border-gray-700 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <ImageLucide className="h-4 w-4 text-pink-500" />
                Thumbnail
              </CardTitle>
              <Badge
                variant="outline"
                className="text-pink-400 border-pink-500 text-[10px]"
              >
                Required
              </Badge>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Ideal: 1600×2000px (4:5) for best in-app appearance.
            </p>
          </CardHeader>
          <CardContent>
            <ThumbnailUploadCard
              thumbnail={data.teaserThumbnail}
              onThumbnailUpload={handleThumbnailUpload}
              onThumbnailRemove={handleThumbnailRemove}
              onThumbnailPreview={handleThumbnailPreview}
            />
          </CardContent>
        </Card>

        {/* Full Content Video Card */}
        <Card className="bg-gray-900 border border-gray-700 rounded-2xl md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <FileVideo className="h-4 w-4 text-glimz-primary" />
                Full Content Video
              </CardTitle>
              <Badge
                variant="outline"
                className="text-pink-400 border-pink-500 text-[10px]"
              >
                Required
              </Badge>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Upload your full content video.
            </p>
          </CardHeader>
          <CardContent>
            <VideoPreviewCard
              video={data.contentVideo}
              type="content"
              onUpload={handleVideoUpload}
              onRemove={handleVideoRemove}
              onVideoPreview={handleVideoPreview}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal (Video / Image) */}
      {previewModal.visible && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() =>
            setPreviewModal({ visible: false, type: null, url: null })
          }
        >
          <div className="relative max-w-6xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white z-10 backdrop-blur-sm"
              onClick={() =>
                setPreviewModal({ visible: false, type: null, url: null })
              }
            >
              <X className="h-5 w-5" />
            </Button>
            {previewModal.type === "video" ? (
              <video
                src={previewModal.url || undefined}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh] rounded-lg shadow-2xl bg-black object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={previewModal.url || undefined}
                alt="Preview"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
