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

const ContentPreview = ({ data }) => {
  const getThumbnailUrl = () => {
    if (data.teaserThumbnail?.url) {
      return data.teaserThumbnail.url;
    }
    if (data.teaserThumbnail?.file) {
      return URL.createObjectURL(data.teaserThumbnail.file);
    }
    return null;
  };

  return (
    <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Final Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {getThumbnailUrl() ? (
            <img
              src={getThumbnailUrl()}
              alt="Thumbnail"
              className="w-32 h-40 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-40 bg-gray-800 rounded-lg flex items-center justify-center">
              <X className="h-8 w-8 text-gray-600" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {data.contentData.title ||
                "Add a strong title to attract viewers"}
            </h3>
            <p className="text-sm text-gray-400">
              {data.contentData.category || "No category selected"}
            </p>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
                const hasTeasers = teaserVideos.length > 0;
                return (
                  <Badge
                    variant={hasTeasers ? "default" : "destructive"}
                    className={
                      hasTeasers
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {hasTeasers ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    Teaser{teaserVideos.length > 1 ? ` (${teaserVideos.length})` : ''}
                  </Badge>
                );
              })()}
              <Badge
                variant={data.contentVideo ? "default" : "destructive"}
                className={
                  data.contentVideo
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }
              >
                {data.contentVideo ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                Content
              </Badge>
              {data.contentData.tags.length > 0 && (
                <Badge variant="outline" className="text-glimz-primary border-glimz-primary">
                  {data.contentData.tags.length} tags
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
      formData.append("video", data.contentVideo.file);

      // Add all teaser videos
      const teaserVideos = data.teaserVideos ?? (data.teaserVideo ? [data.teaserVideo] : []);
      if (teaserVideos.length > 0) {
        // First teaser uses "teaser" field name for backward compatibility
        formData.append("teaser", teaserVideos[0].file);

        // Additional teasers use indexed field names
        for (let i = 1; i < teaserVideos.length; i++) {
          formData.append(`teaser_${i}`, teaserVideos[i].file);
        }
      }

      if (data.teaserThumbnail?.file) {
        formData.append("thumbnail", data.teaserThumbnail.file);
      }

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

        xhr.open("POST", "/api/creator/content/upload");
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

      <ContentPreview data={data} />

      {/* Pricing Card */}
      <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Set Your Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="premium" className="text-white">
              Set a price for this content
            </Label>
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
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">
                Price (₹)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-white text-lg">₹</span>
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
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <p className="text-sm text-gray-400">
                Choose a fair price for your viewers. You can change this later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Button */}
      <div className="space-y-2">
        <Alert className="bg-gray-800/50 border-gray-700">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-gray-400 text-sm">
            Your teaser, content video and details will be uploaded securely.
          </AlertDescription>
        </Alert>
        <Button
          onClick={handlePublish}
          disabled={isUploading || !isFormValid()}
          className="w-full bg-glimz-primary hover:bg-glimz-primary/90 text-white py-6 text-lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Publish Content
            </>
          )}
        </Button>
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
