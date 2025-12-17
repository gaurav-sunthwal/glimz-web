"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  Maximize2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Image as ImageLucide,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/app/hooks/use-toast";

const THUMBNAIL_DIMENSIONS = {
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9, // 16:9 aspect ratio
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ----------------------- IMAGE CROP UTILITIES ----------------------- */

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

/* ----------------------- IMAGE CROP MODAL ----------------------- */

const ImageCropModal = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-white">Crop Thumbnail</h2>
          <p className="text-sm text-gray-400 mt-1">
            Adjust to 16:9 aspect ratio (1920×1080)
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={16 / 9}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
          objectFit="contain"
          style={{
            containerStyle: {
              background: "#000",
            },
            cropAreaStyle: {
              border: "2px solid #8b5cf6",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-6 space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              Zoom
            </label>
            <span className="text-sm text-white font-medium">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-glimz-primary"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Rotation
            </label>
            <span className="text-sm text-white font-medium">{rotation}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-glimz-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropConfirm}
            className="flex-1 bg-gradient-to-r from-glimz-primary to-pink-500 hover:from-glimz-primary/90 hover:to-pink-500/90 text-white font-semibold"
          >
            Crop & Save
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------- VIDEO CARD (Teaser / Content) ----------------------- */

const VideoPreviewCard = ({
  video,
  type,
  onUpload,
  onRemove,
  onVideoPreview,
  // optional thumbnail props (for teaser card)
  thumbnail,
  onThumbnailUpload,
  onThumbnailRemove,
  onThumbnailPreview,
  // optional index for multiple teaser slots
  index,
}) => {
  const { toast } = useToast();
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
          toast({
            title: "File too large",
            description: "Video file size must be less than 500MB",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invalid file",
            description: "Invalid video file. Please select a valid video file.",
            variant: "destructive",
          });
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const tempVideo = document.createElement("video");
        tempVideo.preload = "metadata";
        tempVideo.onloadedmetadata = () => {
          const duration = tempVideo.duration;
          if (type === "teaser" && duration > 30) {
            toast({
              title: "Invalid duration",
              description: "Teaser video must be 30 seconds or less",
              variant: "destructive",
            });
            return;
          }
          if (type === "content" && duration < 180) {
            toast({
              title: "Invalid duration",
              description: "Full content video must be at least 3 minutes long",
              variant: "destructive",
            });
            return;
          }

          const videoData = {
            file,
            url: URL.createObjectURL(file),
            duration,
            fileName: file.name,
            fileSize: file.size,
          };

          onUpload(type, videoData, index);
        };
        tempVideo.onerror = () => {
          toast({
            title: "Error",
            description: "Failed to load video. Please try another file.",
            variant: "destructive",
          });
        };
        tempVideo.src = URL.createObjectURL(file);
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
          toast({
            title: "File too large",
            description: "Image file size must be less than 10MB",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invalid file",
            description: "Invalid image file. Please select a valid image file.",
            variant: "destructive",
          });
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const img = new Image();
        img.onerror = () => {
          toast({
            title: "Error",
            description: "Failed to load image. Please try another file.",
            variant: "destructive",
          });
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
          onThumbnailUpload && onThumbnailUpload(type, thumbnailData);
        };
        img.src = URL.createObjectURL(file);
      }
    },
    disabled: !!thumbnail,
  });

  return (
    <div className="space-y-3">
      {/* Top badges (duration + size) */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {type === "teaser" ? "Teaser Video" : "Full Content"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {type === "teaser"
              ? "Max 30 seconds • Required"
              : "Min 3 minutes • Required"}
          </p>
        </div>
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
        className={`relative aspect-[4/5] w-full h-[260px] rounded-lg overflow-hidden border border-dashed transition-all duration-300 ${isVideoDragActive
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
                      onVideoPreview(type, index);
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
                    onRemove(type, index);
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
  const { toast } = useToast();
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [originalFileName, setOriginalFileName] = useState("");

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
          toast({
            title: "File too large",
            description: "Image file size must be less than 10MB",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invalid file",
            description: "Invalid image file. Please select a valid image file.",
            variant: "destructive",
          });
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setOriginalFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
          setImageToCrop(reader.result);
          setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    },
    disabled: !!thumbnail,
  });

  const handleCropComplete = async (croppedBlob) => {
    try {
      // Create a new file from the cropped blob
      const croppedFile = new File(
        [croppedBlob],
        originalFileName || "thumbnail.jpg",
        { type: "image/jpeg" }
      );

      // Load the cropped image to get dimensions
      const img = new Image();
      img.onload = () => {
        const thumbnailData = {
          file: croppedFile,
          url: URL.createObjectURL(croppedFile),
          fileName: croppedFile.name,
          fileSize: croppedFile.size,
          width: img.width,
          height: img.height,
        };
        onThumbnailUpload("teaser", thumbnailData);
        setCropModalOpen(false);
        setImageToCrop(null);
        toast({
          title: "Success",
          description: "Thumbnail cropped and uploaded successfully!",
        });
      };
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to process cropped image.",
          variant: "destructive",
        });
      };
      img.src = URL.createObjectURL(croppedFile);
    } catch (error) {
      console.error("Error processing cropped image:", error);
      toast({
        title: "Error",
        description: "Failed to process cropped image.",
        variant: "destructive",
      });
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setImageToCrop(null);
    setOriginalFileName("");
  };

  return (
    <>
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
          className={`relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-dashed transition-all duration-300 ${isThumbnailDragActive
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
                className="w-full h-full object-cover bg-black"
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
                  <p className="text-gray-400 text-xs">
                    Click or drag • Will be cropped to 16:9
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && imageToCrop && (
        <ImageCropModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

/* ----------------------- MAIN UPLOAD STEP ----------------------- */

export const MediaUploadStep = ({ data, onDataChange }) => {
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    type: null,
    url: null,
    currentIndex: 0,
  });
  const [currentTeaserIndex, setCurrentTeaserIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    console.log("📊 [MediaUpload] Current data state:", {
      teaserVideo: !!data.teaserVideo,
      teaserVideos: data.teaserVideos?.length || 0,
      teaserThumbnail: !!data.teaserThumbnail,
      contentVideo: !!data.contentVideo,
    });
  }, [data.teaserThumbnail, data.teaserVideo, data.teaserVideos, data.contentVideo]);

  const handleVideoUpload = useCallback(
    (type, videoData, index) => {
      if (type === "teaser") {
        const existing = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);

        // Enforce max 5 teasers
        if (existing.length >= 5 && typeof index !== "number") {
          toast({
            title: "Maximum limit reached",
            description: "You can only upload up to 5 teaser videos",
            variant: "destructive",
          });
          return;
        }

        const arr = [...existing];
        if (typeof index === "number") {
          arr[index] = videoData;
        } else {
          arr.push(videoData);
        }
        onDataChange({ teaserVideos: arr, teaserVideo: arr[0] || null });
      } else {
        onDataChange({ contentVideo: videoData });
      }
    },
    [onDataChange, data.teaserVideos, data.teaserVideo, toast]
  );

  const handleThumbnailUpload = useCallback(
    (type, thumbnailData) => {
      onDataChange({ teaserThumbnail: thumbnailData });
    },
    [onDataChange]
  );

  const handleVideoRemove = (type, index) => {
    if (type === "teaser") {
      const existing = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
      if (typeof index === "number") {
        const arr = [...existing];
        arr.splice(index, 1);
        onDataChange({ teaserVideos: arr, teaserVideo: arr[0] || null });
        // Adjust current index if needed
        if (currentTeaserIndex >= arr.length && arr.length > 0) {
          setCurrentTeaserIndex(arr.length - 1);
        } else if (arr.length === 0) {
          setCurrentTeaserIndex(0);
        }
      } else {
        // fallback: clear all
        onDataChange({ teaserVideos: [], teaserVideo: null });
        setCurrentTeaserIndex(0);
      }
    } else {
      onDataChange({ contentVideo: null });
    }
  };

  const handleThumbnailRemove = () => {
    onDataChange({ teaserThumbnail: null });
  };

  const handleVideoPreview = (type, index) => {
    if (type === "teaser") {
      const teasers = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
      if (teasers.length > 0) {
        setPreviewModal({
          visible: true,
          type: "teaser-slider",
          currentIndex: typeof index === "number" ? index : 0,
        });
      }
    } else {
      const video = data.contentVideo;
      if (video) {
        setPreviewModal({
          visible: true,
          type: "video",
          url: video.url || URL.createObjectURL(video.file),
          currentIndex: 0,
        });
      }
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
        currentIndex: 0,
      });
    }
  };

  const handleAddTeaserSlot = () => {
    const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
    if (teaserVideos.length >= 5) {
      toast({
        title: "Maximum limit reached",
        description: "You can only upload up to 5 teaser videos",
        variant: "destructive",
      });
      return;
    }
    // Navigate to the next empty slot
    setCurrentTeaserIndex(teaserVideos.length);
  };

  const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
  const teaserUploaded = (teaserVideos && teaserVideos.length > 0) || false;
  const uploadedCount = [teaserUploaded, data.teaserThumbnail, data.contentVideo].filter(Boolean).length;

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
            {teaserUploaded ? (
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
            <div className="relative">
              {/* Slider container */}
              <div className="space-y-3">
                {/* Current teaser or empty slot */}
                <VideoPreviewCard
                  video={teaserVideos[currentTeaserIndex]}
                  type="teaser"
                  index={currentTeaserIndex}
                  onUpload={handleVideoUpload}
                  onRemove={handleVideoRemove}
                  onVideoPreview={handleVideoPreview}
                />

                {/* Navigation controls */}
                {teaserVideos.length > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentTeaserIndex(Math.max(0, currentTeaserIndex - 1))}
                      disabled={currentTeaserIndex === 0}
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {/* Slide indicators */}
                    <div className="flex items-center gap-2">
                      {teaserVideos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentTeaserIndex(idx)}
                          className={`h-2 rounded-full transition-all ${idx === currentTeaserIndex
                            ? "w-8 bg-glimz-primary"
                            : "w-2 bg-gray-600 hover:bg-gray-500"
                            }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentTeaserIndex(Math.min(teaserVideos.length - 1, currentTeaserIndex + 1))}
                      disabled={currentTeaserIndex === teaserVideos.length - 1}
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* Add more button */}
                {teaserVideos.length < 5 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddTeaserSlot}
                      className="text-glimz-primary border-glimz-primary hover:bg-glimz-primary/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Teaser ({teaserVideos.length}/5)
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
              Ideal: 1920×1080px (16:9) • Auto-cropped for best appearance.
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
            <p className="text-gray-400 text-sm mt-2">
              Upload your full content video (min 3 minutes)
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

      {/* Preview Modal (Video / Image / Teaser Slider) */}
      {previewModal.visible && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() =>
            setPreviewModal({ visible: false, type: null, url: null, currentIndex: 0 })
          }
        >
          <div className="relative max-w-6xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white z-10 backdrop-blur-sm"
              onClick={() =>
                setPreviewModal({ visible: false, type: null, url: null, currentIndex: 0 })
              }
            >
              <X className="h-5 w-5" />
            </Button>

            {previewModal.type === "teaser-slider" ? (
              <>
                {/* Teaser slider */}
                {(() => {
                  const currentTeaser = teaserVideos[previewModal.currentIndex];
                  return currentTeaser ? (
                    <>
                      <video
                        src={currentTeaser.url || URL.createObjectURL(currentTeaser.file)}
                        controls
                        autoPlay
                        className="w-full h-auto max-h-[90vh] rounded-lg shadow-2xl bg-black object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Slider navigation for teasers */}
                      {teaserVideos.length > 1 && (
                        <>
                          {/* Left arrow */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModal(prev => ({
                                ...prev,
                                currentIndex: Math.max(0, prev.currentIndex - 1)
                              }));
                            }}
                            disabled={previewModal.currentIndex === 0}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>

                          {/* Right arrow */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModal(prev => ({
                                ...prev,
                                currentIndex: Math.min(teaserVideos.length - 1, prev.currentIndex + 1)
                              }));
                            }}
                            disabled={previewModal.currentIndex === teaserVideos.length - 1}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>

                          {/* Slide indicators */}
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm">
                            {teaserVideos.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewModal(prev => ({ ...prev, currentIndex: idx }));
                                }}
                                className={`h-2 rounded-full transition-all ${idx === previewModal.currentIndex
                                  ? "w-8 bg-glimz-primary"
                                  : "w-2 bg-gray-400 hover:bg-gray-300"
                                  }`}
                              />
                            ))}
                          </div>

                          {/* Counter */}
                          <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm text-white text-sm">
                            {previewModal.currentIndex + 1} / {teaserVideos.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : null;
                })()}
              </>
            ) : previewModal.type === "video" ? (
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
