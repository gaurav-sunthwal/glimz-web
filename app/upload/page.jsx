"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Video, Image, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isUserCreator } from "@/app/lib/authUtils";
import { Header } from "@/components/Header";

export default function UploadPage() {
  const router = useRouter();
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    thumbnail: null,
    video: null,
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Check if user is a creator
    const checkCreatorStatus = () => {
      const creatorStatus = isUserCreator();
      setIsCreator(creatorStatus);
      setIsLoading(false);
      
      if (!creatorStatus) {
        // Redirect non-creators to home page
        router.push("/");
      }
    };

    checkCreatorStatus();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileUpload = (file, type) => {
    const maxSize = type === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024; // 500MB for video, 10MB for thumbnail
    const allowedTypes = type === 'video' 
      ? ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [type]: `File size must be less than ${type === 'video' ? '500MB' : '10MB'}`
      }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [type]: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [type]: file
    }));

    // Clear error
    setErrors(prev => ({
      ...prev,
      [type]: ""
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], type);
    }
  };

  const removeFile = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.video) {
      newErrors.video = "Video file is required";
    }

    if (!formData.thumbnail) {
      newErrors.thumbnail = "Thumbnail is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('tags', formData.tags);
      uploadData.append('video', formData.video);
      uploadData.append('thumbnail', formData.thumbnail);

      // Here you would make the API call to upload the video
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: uploadData,
      //   credentials: 'include'
      // });

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        thumbnail: null,
        video: null,
      });
      
      alert("Video uploaded successfully!");
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/70 mb-4">Only creators can access this page.</p>
          <Button onClick={() => router.push("/")} className="bg-glimz-primary hover:bg-glimz-primary/90">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Upload Content</h1>
              <p className="text-white/70">Share your creativity with the world</p>
            </div>
          </div>

          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Video Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter video title"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-glimz-primary"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your video"
                    rows={4}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-glimz-primary"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-white">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-glimz-primary !bg-opacity-100 !bg-gray-800 !border !border-gray-600 !shadow-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      <SelectItem value="entertainment" className="hover:bg-glimz-primary/20">Entertainment</SelectItem>
                      <SelectItem value="education" className="hover:bg-glimz-primary/20">Education</SelectItem>
                      <SelectItem value="gaming" className="hover:bg-glimz-primary/20">Gaming</SelectItem>
                      <SelectItem value="music" className="hover:bg-glimz-primary/20">Music</SelectItem>
                      <SelectItem value="sports" className="hover:bg-glimz-primary/20">Sports</SelectItem>
                      <SelectItem value="tech" className="hover:bg-glimz-primary/20">Technology</SelectItem>
                      <SelectItem value="lifestyle" className="hover:bg-glimz-primary/20">Lifestyle</SelectItem>
                      <SelectItem value="comedy" className="hover:bg-glimz-primary/20">Comedy</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-white">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Enter tags separated by commas"
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-glimz-primary"
                  />
                </div>

                {/* Video Upload */}
                <div>
                  <Label className="text-white">Video File *</Label>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-glimz-primary bg-glimz-primary/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'video')}
                  >
                    {formData.video ? (
                      <div className="space-y-2">
                        <Video className="h-12 w-12 text-glimz-primary mx-auto" />
                        <p className="text-white font-medium">{formData.video.name}</p>
                        <p className="text-white/60 text-sm">
                          {(formData.video.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('video')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-white/60 mx-auto" />
                        <p className="text-white">Drop your video here or click to browse</p>
                        <p className="text-white/60 text-sm">MP4, AVI, MOV, WMV, WebM (Max 500MB)</p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'video')}
                          className="hidden"
                          id="video-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('video-upload').click()}
                          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                        >
                          Choose Video
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.video && (
                    <p className="text-red-400 text-sm mt-1">{errors.video}</p>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <Label className="text-white">Thumbnail *</Label>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-glimz-primary bg-glimz-primary/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'thumbnail')}
                  >
                    {formData.thumbnail ? (
                      <div className="space-y-2">
                        <Image className="h-8 w-8 text-glimz-primary mx-auto" />
                        <p className="text-white font-medium">{formData.thumbnail.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('thumbnail')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Image className="h-8 w-8 text-white/60 mx-auto" />
                        <p className="text-white">Drop thumbnail here or click to browse</p>
                        <p className="text-white/60 text-sm">JPEG, PNG, GIF, WebP (Max 10MB)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'thumbnail')}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('thumbnail-upload').click()}
                          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                        >
                          Choose Thumbnail
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.thumbnail && (
                    <p className="text-red-400 text-sm mt-1">{errors.thumbnail}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-glimz-primary hover:bg-glimz-primary/90 text-white px-8"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
