"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/app/hooks/use-toast";

const ContentPreview = ({ data, onBack }) => {
  const getThumbnailUrl = () => {
    if (data.teaserThumbnail?.url) {
      return data.teaserThumbnail.url;
    }
    if (data.teaserThumbnail?.file) {
      return URL.createObjectURL(data.teaserThumbnail.file);
    }
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();
  const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
  const hasTeasers = teaserVideos.length > 0;

  return (
    <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-glimz-primary" />
            <div>
              <CardTitle className="text-white">Final Preview</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Review your content before publishing
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-glimz-primary text-glimz-primary hover:bg-glimz-primary/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thumbnail Preview - 16:9 */}
        {thumbnailUrl ? (
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-gray-700 shadow-lg group">
            <img
              src={thumbnailUrl}
              alt="Thumbnail Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay with dimensions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className="bg-black/70 text-white backdrop-blur-sm border-0">
                  {data.teaserThumbnail?.width}×{data.teaserThumbnail?.height}
                </Badge>
                <Badge className="bg-black/70 text-glimz-primary backdrop-blur-sm border-0">
                  16:9 Ratio
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-700 bg-gray-800/50 flex flex-col items-center justify-center">
            <X className="h-12 w-12 text-gray-600 mb-2" />
            <p className="text-gray-500 text-sm">No thumbnail uploaded</p>
          </div>
        )}

        {/* Content Details */}
        <div className="space-y-3">
          {/* Title */}
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider">Title</Label>
            <h3 className="text-lg font-semibold text-white mt-1 line-clamp-2">
              {data.contentData.title || (
                <span className="text-gray-500 italic">Add a strong title to attract viewers</span>
              )}
            </h3>
          </div>

          {/* Category & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider">Category</Label>
              <p className="text-sm text-white mt-1">
                {data.contentData.category || (
                  <span className="text-gray-500 italic">Not selected</span>
                )}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider">Age Rating</Label>
              <p className="text-sm text-white mt-1">
                {data.contentData.ageRestriction || "G"}
              </p>
            </div>
          </div>

          {/* Description Preview */}
          {data.contentData.description && (
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider">Description</Label>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {data.contentData.description}
              </p>
            </div>
          )}

          {/* Status Badges */}
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Upload Status</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={hasTeasers ? "default" : "destructive"}
                className={
                  hasTeasers
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-red-500/20 text-red-400 border-red-500/50"
                }
              >
                {hasTeasers ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {hasTeasers
                  ? `${teaserVideos.length} Teaser${teaserVideos.length > 1 ? 's' : ''}`
                  : 'No Teaser'
                }
              </Badge>

              <Badge
                variant={data.contentVideo ? "default" : "destructive"}
                className={
                  data.contentVideo
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-red-500/20 text-red-400 border-red-500/50"
                }
              >
                {data.contentVideo ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                Content Video
              </Badge>

              <Badge
                variant={thumbnailUrl ? "default" : "destructive"}
                className={
                  thumbnailUrl
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-red-500/20 text-red-400 border-red-500/50"
                }
              >
                {thumbnailUrl ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                Thumbnail
              </Badge>

              {data.contentData.tags.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-glimz-primary/10 text-glimz-primary border-glimz-primary/50"
                >
                  {data.contentData.tags.length} Tag{data.contentData.tags.length > 1 ? 's' : ''}
                </Badge>
              )}

              {data.contentData.playlistId && (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/50"
                >
                  In Playlist
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PricingPublishStep = ({ data, onDataChange, onBack }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [uploadStage, setUploadStage] = useState({
    stage: "converting",
    message: "Preparing files...",
    progress: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleProgressUpdate = useCallback((stage, progress, uploadEvent) => {
    let message = "Uploading...";
    let stageType = "uploading_video";
    let uploadSpeed;
    let estimatedTime;

    if (stage === "converting") {
      message = "Converting video files...";
      stageType = "converting";
    } else if (stage === "uploading") {
      message = "Uploading content to server...";
      stageType = "uploading_video";

      if (uploadEvent && uploadEvent.total && uploadEvent.loaded) {
        const bytesPerSecond =
          uploadEvent.loaded / ((Date.now() - uploadEvent.startTime) / 1000);
        const remainingBytes = uploadEvent.total - uploadEvent.loaded;
        const remainingTime = remainingBytes / bytesPerSecond;

        uploadSpeed = formatSpeed(bytesPerSecond);
        estimatedTime = formatTime(remainingTime);
      }
    } else if (stage === "processing") {
      message = "Server is processing your content...";
      stageType = "processing";
    }

    setUploadStage({
      stage: stageType,
      message,
      progress: Math.max(0, Math.min(100, progress)),
      uploadSpeed,
      estimatedTime,
      totalBytes: uploadEvent?.total,
      uploadedBytes: uploadEvent?.loaded,
    });
  }, []);

  const formatSpeed = (bytesPerSecond) => {
    const mbPerSecond = bytesPerSecond / (1024 * 1024);
    if (mbPerSecond >= 1) {
      return `${mbPerSecond.toFixed(1)} MB/s`;
    }
    const kbPerSecond = bytesPerSecond / 1024;
    return `${kbPerSecond.toFixed(1)} KB/s`;
  };

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handlePublish = useCallback(async () => {
    console.log("🚀 [Upload Page] Starting publish process...");

    const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
    if (teaserVideos.length === 0 || !data.contentVideo) {
      console.log("❌ [Upload Page] Validation failed: Missing videos");
      toast({
        title: "Validation Error",
        description: "Please upload both teaser and content videos",
        variant: "destructive",
      });
      return;
    }

    if (!data.contentData.title.trim()) {
      console.log("❌ [Upload Page] Validation failed: Missing title");
      toast({
        title: "Validation Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!data.contentData.category) {
      console.log("❌ [Upload Page] Validation failed: Missing category");
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (
      data.contentData.isPremium &&
      (!data.contentData.price || data.contentData.price <= 0)
    ) {
      console.log("❌ [Upload Page] Validation failed: Invalid price for premium content");
      toast({
        title: "Validation Error",
        description: "Please set a valid price for premium content",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ [Upload Page] Validation passed, starting upload...");
    try {
      setIsUploading(true);
      setShowProgressModal(true);
      setUploadStage({
        stage: "converting",
        message: "Converting video files...",
        progress: 10,
      });

      // Prepare FormData
      const formData = new FormData();

      // Add content data
      formData.append("title", data.contentData.title);
      formData.append("description", data.contentData.description || "");
      formData.append("category", data.contentData.category);
      formData.append("tags", JSON.stringify(data.contentData.tags));
      formData.append("adult", "false");
      formData.append("is_paid", data.contentData.isPremium.toString());

      const priceValue = data.contentData.isPremium
        ? data.contentData.price || 0
        : 0;
      formData.append("price", priceValue.toString());

      const isPlaylist = data.contentData.playlistId ? true : false;
      formData.append("is_playlist", isPlaylist.toString());
      formData.append(
        "playlist_id",
        data.contentData.playlistId || ""
      );

      // Add files
      console.log("📦 [Upload] Adding content video:", {
        name: data.contentVideo.file?.name,
        size: data.contentVideo.file?.size,
        type: data.contentVideo.file?.type
      });
      formData.append("video", data.contentVideo.file);

      // Add all teaser videos
      const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
      console.log(`📦 [Upload] Adding ${teaserVideos.length} teaser video(s)`);

      if (teaserVideos.length > 0) {
        // First teaser uses "teaser" field name for backward compatibility
        console.log("📦 [Upload] Adding teaser[0]:", {
          name: teaserVideos[0].file?.name,
          size: teaserVideos[0].file?.size,
          type: teaserVideos[0].file?.type
        });
        formData.append("teaser", teaserVideos[0].file);

        // Additional teasers use indexed field names
        for (let i = 1; i < teaserVideos.length; i++) {
          console.log(`📦 [Upload] Adding teaser[${i}]:`, {
            name: teaserVideos[i].file?.name,
            size: teaserVideos[i].file?.size,
            type: teaserVideos[i].file?.type
          });
          formData.append(`teaser_${i}`, teaserVideos[i].file);
        }
      }

      if (data.teaserThumbnail?.file) {
        console.log("📦 [Upload] Adding thumbnail:", {
          name: data.teaserThumbnail.file?.name,
          size: data.teaserThumbnail.file?.size,
          type: data.teaserThumbnail.file?.type,
          width: data.teaserThumbnail.width,
          height: data.teaserThumbnail.height
        });
        formData.append("thumbnail", data.teaserThumbnail.file);
      } else {
        console.warn("⚠️ [Upload] No thumbnail file found!");
      }

      console.log("📦 [Upload] FormData prepared with fields:", {
        title: data.contentData.title,
        category: data.contentData.category,
        isPaid: data.contentData.isPremium,
        price: priceValue,
        isPlaylist: isPlaylist,
        playlistId: data.contentData.playlistId,
        tagsCount: data.contentData.tags.length
      });

      setUploadStage({
        stage: "uploading_video",
        message: "Uploading content to server...",
        progress: 20,
      });

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      const startTime = Date.now();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = 20 + (e.loaded / e.total) * 70; // 20-90% for upload
          handleProgressUpdate("uploading", progress, {
            ...e,
            startTime,
            total: e.total,
            loaded: e.loaded,
          });
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              console.warn("Response is not JSON, treating as success:", xhr.responseText);
              resolve({ status: true, data: xhr.responseText });
            }
          } else {
            let errorMessage = `Upload failed with status ${xhr.status}`;
            try {
              const error = JSON.parse(xhr.responseText);
              errorMessage = error.message || error.error || errorMessage;
              console.error("Upload API error response:", error);
            } catch (e) {
              const responseText = xhr.responseText || "";
              errorMessage = responseText || errorMessage;
              console.error("Upload failed, response text:", responseText);
            }
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload. Please check your connection."));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload was cancelled or timed out."));
        });

        // Always use Next.js API route which handles authentication via server-side cookies
        const uploadUrl = '/api/creator/content/upload';

        console.log('📤 [Upload] Using Next.js API route for upload:', uploadUrl);

        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });

      setUploadStage({
        stage: "processing",
        message: "Server is processing your content...",
        progress: 90,
      });

      const response = await uploadPromise;

      if (response.status) {
        console.log("✅ [Upload Page] Content uploaded successfully!");
        setUploadStage({
          stage: "completed",
          message: "Your content has been published successfully!",
          progress: 100,
        });

        setTimeout(() => {
          console.log("🏠 [Upload Page] Upload complete - redirecting to home page (/)");
          setShowProgressModal(false);
          router.push("/");
        }, 2000);
      } else {
        console.error("❌ [Upload Page] Upload failed:", response.message);
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error("❌ [Upload Page] Content upload error:", error);
      setUploadStage({
        stage: "error",
        message: error.message || "Failed to publish content. Please try again.",
        progress: 0,
      });
      toast({
        title: "Error",
        description: error.message || "Failed to publish content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      console.log("🏁 [Upload Page] Upload process finished");
    }
  }, [data, handleProgressUpdate, router]);

  const isFormValid = () => {
    const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
    return (
      teaserVideos.length > 0 &&
      data.contentVideo &&
      data.contentData.title.trim() &&
      data.contentData.category &&
      (!data.contentData.isPremium ||
        (data.contentData.price !== undefined && data.contentData.price > 0))
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Ready to Publish</h2>
        <p className="text-gray-400">
          Confirm your preview and set a price before publishing your content.
        </p>
      </div>

      <ContentPreview data={data} onBack={onBack} />

      {/* Pricing Card */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-900/60 backdrop-blur-xl border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-glimz-primary/20 flex items-center justify-center">
              <span className="text-glimz-primary text-lg">₹</span>
            </div>
            Set Your Price
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            Choose whether to make this content free or premium
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex-1">
              <Label htmlFor="premium" className="text-white font-medium cursor-pointer">
                Premium Content
              </Label>
              <p className="text-xs text-gray-400 mt-1">
                Charge viewers to access this content
              </p>
            </div>
            <Switch
              id="premium"
              checked={data.contentData.isPremium}
              onCheckedChange={(checked) => {
                onDataChange({
                  contentData: {
                    ...data.contentData,
                    isPremium: checked,
                    price: checked ? data.contentData.price : 0,
                  },
                });
              }}
            />
          </div>

          {data.contentData.isPremium && (
            <div className="space-y-3 p-4 bg-glimz-primary/5 border border-glimz-primary/20 rounded-lg">
              <Label htmlFor="price" className="text-white font-medium">
                Price (₹)
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-glimz-primary transition-colors">
                  <span className="text-white text-xl font-semibold">₹</span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.contentData.price || ""}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      onDataChange({
                        contentData: {
                          ...data.contentData,
                          price: price > 0 ? price : undefined,
                        },
                      });
                    }}
                    placeholder="0.00"
                    className="bg-transparent border-0 text-white placeholder:text-gray-400 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Choose a fair price for your viewers. You can change this later from your dashboard.</span>
              </p>
            </div>
          )}

          {!data.contentData.isPremium && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Free Content</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                This content will be available to all viewers at no cost
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Button */}
      <div className="space-y-4">
        <Alert className="bg-gradient-to-r from-glimz-primary/10 to-pink-500/10 border-glimz-primary/30">
          <AlertCircle className="h-4 w-4 text-glimz-primary" />
          <AlertDescription className="text-gray-300 text-sm">
            Your teaser videos, content video, thumbnail, and all details will be uploaded securely to our servers.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          {/* <Button
            variant="outline"
            onClick={onBack}
            disabled={isUploading}
            className="border-gray-600 text-white hover:bg-gray-800 px-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button> */}

          <Button
            onClick={handlePublish}
            disabled={isUploading || !isFormValid()}
            className="flex-1 bg-gradient-to-r from-glimz-primary to-pink-500 hover:from-glimz-primary/90 hover:to-pink-500/90 text-white py-6 text-lg font-semibold shadow-lg shadow-glimz-primary/20 transition-all hover:shadow-xl hover:shadow-glimz-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Publishing Your Content...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Publish Content
              </>
            )}
          </Button>
        </div>

        {!isFormValid() && (
          <p className="text-sm text-red-400 text-center">
            Please complete all required fields before publishing
          </p>
        )}
      </div>

      {/* Upload Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={() => { }}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {uploadStage.stage === "completed"
                ? "Upload Complete!"
                : "Uploading Content..."}
            </DialogTitle>
            <DialogDescription>
              {uploadStage.stage === "completed"
                ? "Your content has been successfully uploaded and published."
                : "Please wait while we upload your content. This may take a few minutes."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {uploadStage.message}
              </p>
              <Progress value={uploadStage.progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {uploadStage.progress.toFixed(0)}%
              </p>
            </div>
            {uploadStage.uploadSpeed && (
              <div className="text-sm text-gray-400">
                <p>Speed: {uploadStage.uploadSpeed}</p>
                {uploadStage.estimatedTime && (
                  <p>Estimated time: {uploadStage.estimatedTime}</p>
                )}
              </div>
            )}
            {uploadStage.stage === "completed" && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Content published successfully!</span>
              </div>
            )}
            {uploadStage.stage === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadStage.message}</AlertDescription>
              </Alert>
            )}
            {uploadStage.stage !== "completed" &&
              uploadStage.stage !== "processing" && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowProgressModal(false);
                    setIsUploading(false);
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
