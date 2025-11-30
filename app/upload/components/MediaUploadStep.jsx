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
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const THUMBNAIL_DIMENSIONS = {
  width: 1600,
  height: 2000,
  aspectRatio: 0.8, // 4:5 aspect ratio
};

const VideoPreviewCard = ({
  video,
  thumbnail,
  type,
  onUpload,
  onRemove,
  onThumbnailUpload,
  onThumbnailRemove,
  onThumbnailPreview,
  onVideoPreview,
}) => {
  const [paused, setPaused] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef(null);

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

  // Video dropzone
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
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const duration = video.duration;
          if (type === "teaser" && duration > 30) {
            alert("Teaser video must be 30 seconds or less");
            return;
          }

          const videoData = {
            file: file,
            url: URL.createObjectURL(file),
            duration: duration,
            fileName: file.name,
            fileSize: file.size,
          };

          if (type === "teaser") {
            onUpload("teaser", videoData);
          } else {
            onUpload("content", videoData);
          }
        };
        video.onerror = () => {
          alert("Failed to load video. Please try another file.");
        };
        video.src = URL.createObjectURL(file);
      }
    },
    disabled: !!video,
  });

  // Thumbnail dropzone
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
            file: file,
            url: URL.createObjectURL(file),
            fileName: file.name,
            fileSize: file.size,
            width: img.width,
            height: img.height,
          };
          onThumbnailUpload && onThumbnailUpload("teaser", thumbnailData);
        };
        img.src = URL.createObjectURL(file);
      }
    },
    disabled: !!thumbnail,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {type === "teaser" ? "Teaser Video" : "Full Content"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {type === "teaser"
              ? "Max 30 seconds • Required"
              : "Max 5 minutes • Required"}
          </p>
        </div>
        {video && (
          <div className="flex items-center gap-2">
            {video.duration && (
              <Badge
                variant="outline"
                className="text-glimz-primary border-glimz-primary bg-glimz-primary/10"
              >
                {formatTime(video.duration)}
              </Badge>
            )}
            {video.fileSize && (
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {formatFileSize(video.fileSize)}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Video Upload Area */}
      <div
        {...getVideoRootProps()}
        className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 ${
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
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                if (!video.duration) {
                  // Update duration if not set
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/70 hover:bg-black/90 text-white w-16 h-16 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaused(!paused);
                    if (videoRef.current) {
                      if (paused) {
                        videoRef.current.play();
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                >
                  {paused ? (
                    <Play className="h-8 w-8" />
                  ) : (
                    <Pause className="h-8 w-8" />
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
                <Badge className="bg-black/70 text-white backdrop-blur-sm border-0">
                  <FileVideo className="h-3 w-3 mr-1" />
                  {video.fileName}
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            {isVideoDragActive ? (
              <div className="text-center space-y-3 animate-pulse">
                <Upload className="h-16 w-16 text-glimz-primary mx-auto" />
                <p className="text-glimz-primary font-semibold text-lg">
                  Drop video here
                </p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-glimz-primary/20 rounded-full blur-xl"></div>
                  <Upload className="h-16 w-16 text-glimz-primary mx-auto relative z-10" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {type === "teaser" ? "Upload Teaser Video" : "Upload Content Video"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                  <span>MP4, MOV, AVI</span>
                  <span>•</span>
                  <span>Max 500MB</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Section - Only for teaser */}
      {type === "teaser" && (
        <div className="space-y-2 ">
          <div className="">
            <h4 className="text-sm font-semibold text-white flex  gap-2">
              <ImageLucide className="h-4 w-4 text-pink-500" />
              Custom Thumbnail
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Optional • Ideal: 1600×2000px (4:5 ratio)
            </p>
          </div>
          <div className="flex justify-center">
            <div
              {...getThumbnailRootProps()}
              className={`relative aspect-[4/5] w-full h-[300px] rounded-lg overflow-hidden border-2 border-dashed transition-all duration-300 ${
                isThumbnailDragActive
                  ? "border-pink-500 bg-pink-500/10 scale-[1.05]"
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
                  className="w-full h-full object-cover"
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
                    {thumbnail.width && thumbnail.height && (
                      <Badge
                        variant="outline"
                        className="bg-black/70 text-white border-gray-600 backdrop-blur-sm"
                      >
                        {thumbnail.width}×{thumbnail.height}
                      </Badge>
                    )}
                    <Badge className="bg-black/70 text-white backdrop-blur-sm border-0">
                      <ImageLucide className="h-3 w-3 mr-1" />
                      {thumbnail.fileName}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                {isThumbnailDragActive ? (
                  <div className="text-center space-y-3 animate-pulse">
                    <ImageIcon className="h-12 w-12 text-pink-500 mx-auto" />
                    <p className="text-pink-500 font-semibold">Drop image here</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <div className="relative mx-auto w-fit">
                      <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-xl"></div>
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
        </div>
      )}
    </div>
  );
};

export const MediaUploadStep = ({ data, onDataChange, onNext }) => {
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    type: null,
    url: null,
  });

  // Debug: Log when thumbnail data changes
  useEffect(() => {
    console.log("📊 [MediaUpload] Current data state:", {
      teaserVideo: !!data.teaserVideo,
      teaserThumbnail: !!data.teaserThumbnail,
      contentVideo: !!data.contentVideo,
      thumbnailDetails: data.teaserThumbnail
        ? {
            fileName: data.teaserThumbnail.fileName,
            fileSize: data.teaserThumbnail.fileSize,
            width: data.teaserThumbnail.width,
            height: data.teaserThumbnail.height,
          }
        : null,
    });
  }, [data.teaserThumbnail, data.teaserVideo, data.contentVideo]);


  const handleVideoUpload = useCallback(
    (type, videoData) => {
      console.log("🎥 [MediaUpload] Video uploaded:", type, videoData);
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
      console.log("🖼️ [MediaUpload] Thumbnail uploaded:", thumbnailData);
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

  const requiredCount = [data.teaserVideo, data.contentVideo].filter(Boolean)
    .length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Upload Your Content</h2>
        <p className="text-gray-400">
          Upload your teaser, thumbnail, and content video. All items are
          required.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Upload Progress: {uploadedCount} / 3 items
          </span>
          <span className="text-glimz-primary font-semibold">
            {Math.round((uploadedCount / 3) * 100)}%
          </span>
        </div>
        <Progress value={(uploadedCount / 3) * 100} className="h-2" />
        <div className="flex items-center gap-4 text-xs text-gray-500">
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

      {/* Upload Sections in One Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teaser Video Section */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-glimz-primary" />
                Teaser Video
              </CardTitle>
              <Badge variant="destructive">Required</Badge>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Upload your teaser video (max 30 seconds)
            </p>
          </CardHeader>
          <CardContent>
            <VideoPreviewCard
              video={data.teaserVideo}
              thumbnail={data.teaserThumbnail}
              type="teaser"
              onUpload={handleVideoUpload}
              onRemove={handleVideoRemove}
              onThumbnailUpload={handleThumbnailUpload}
              onThumbnailRemove={handleThumbnailRemove}
              onThumbnailPreview={handleThumbnailPreview}
              onVideoPreview={handleVideoPreview}
            />
          </CardContent>
        </Card>

        {/* Content Video Section */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-glimz-primary" />
                Full Content Video
              </CardTitle>
              <Badge variant="destructive">Required</Badge>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Upload your full content video (max 5 minutes)
            </p>
          </CardHeader>
          <CardContent>
            <VideoPreviewCard
              video={data.contentVideo}
              thumbnail={null}
              type="content"
              onUpload={handleVideoUpload}
              onRemove={handleVideoRemove}
              onVideoPreview={handleVideoPreview}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewModal.visible && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
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
                src={previewModal.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={previewModal.url}
                alt="Preview"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
