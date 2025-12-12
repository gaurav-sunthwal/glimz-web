"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '../store/appStore';
import { Header } from '@/components/Header';
import Image from 'next/image';

export default function VideoDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [videoId, setVideoId] = useState(null);
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentTeaserIndex, setCurrentTeaserIndex] = useState(0);

  // Handle params properly for Next.js 15
  // Extract content ID from query parameter 'c'
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;

      // Get content_id from query parameter 'c'
      const contentId = searchParams.get('c');
      if (contentId) {
        setVideoId(contentId);
      } else {
        console.error('Content ID not found in query parameters');
        setError('Invalid video URL format - missing content ID');
      }

      // Read teaser index from URL query parameter
      const teaserParam = searchParams.get('t');
      if (teaserParam !== null) {
        const index = parseInt(teaserParam, 10);
        if (!isNaN(index) && index >= 0) {
          setCurrentTeaserIndex(index);
        }
      }
    };
    getParams();
  }, [params, searchParams]);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoId) return;

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching video details for ID:', videoId);

        const response = await fetch(`/api/creator/content/${videoId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        console.log('Video API Response:', data);

        if (!response.ok) {
          throw new Error(data.message || `API error: ${response.status}`);
        }

        if (data.status && data.data?.data) {
          const contentData = data.data.data;
          console.log('Content Data:', contentData);
          console.log('Teaser from API:', contentData.teaser);
          console.log('Video from API:', contentData.video);

          // Transform API response to match component expectations
          // Extract URLs properly - they might be objects with .url property or direct strings
          const getThumbnailUrl = (thumb) => {
            if (!thumb) return '';
            if (typeof thumb === 'string') return thumb;
            return thumb.url || '';
          };

          const getVideoUrl = (vid) => {
            if (!vid) return '';

            // If it's a string, return it directly
            if (typeof vid === 'string') return vid;

            // If it has variants (auto, 720p, 480p), prefer auto
            if (vid.variants) {
              return vid.variants.auto ||
                vid.variants['720p'] ||
                vid.variants['480p'] ||
                Object.values(vid.variants)[0] || '';
            }

            // Fallback to url property
            return vid.url || '';
          };

          // Handle teaser - it might be a single video or an array
          // Extract teaser index from filename (e.g., _0_auto, _1_auto)
          const getTeaserUrls = (teaser) => {
            if (!teaser) return [];

            const extractTeaserUrl = (t) => {
              if (typeof t === 'string') return t;

              // Handle variants
              if (t.variants) {
                return t.variants.auto ||
                  t.variants['720p'] ||
                  t.variants['480p'] ||
                  Object.values(t.variants)[0] || '';
              }

              return t.url || '';
            };

            const extractTeaserIndex = (url) => {
              // Extract index from filename pattern: _0_auto, _1_auto, _2_auto, etc.
              const match = url.match(/_(\d+)_auto/);
              return match ? parseInt(match[1], 10) : 0;
            };

            let teaserList = [];

            // If it's an array, extract URLs from each item
            if (Array.isArray(teaser)) {
              teaserList = teaser.map(extractTeaserUrl).filter(url => url !== '');
            } else if (typeof teaser === 'string') {
              teaserList = [teaser];
            } else if (teaser.variants) {
              // Handle variants for single teaser
              const url = teaser.variants.auto ||
                teaser.variants['720p'] ||
                teaser.variants['480p'] ||
                Object.values(teaser.variants)[0] || '';
              teaserList = url ? [url] : [];
            } else if (teaser.url) {
              teaserList = [teaser.url];
            }

            // Sort teasers by their index from the filename
            const teasersWithIndex = teaserList.map(url => ({
              url,
              index: extractTeaserIndex(url)
            }));

            // Sort by index
            teasersWithIndex.sort((a, b) => a.index - b.index);

            // Return just the URLs in sorted order
            return teasersWithIndex.map(t => t.url);
          };

          const teaserUrls = getTeaserUrls(contentData.teaser);

          // Log teaser URLs with their indices for debugging
          console.log('Teaser URLs sorted by index:', teaserUrls.map((url, idx) => ({
            position: idx,
            extractedIndex: url.match(/_(\d+)_auto/)?.[1] || 'N/A',
            url: url
          })));

          const transformedVideo = {
            id: contentData.content_id,
            title: contentData.title,
            description: contentData.description,
            thumbnail: getThumbnailUrl(contentData.thumbnail),
            teaser: teaserUrls.length > 0 ? teaserUrls[0] : '', // Default to first teaser
            teasers: teaserUrls, // Store all teasers for slider
            creator_id: contentData.creator_id,
            creator_name: contentData.creator_name || 'Unknown Creator',
            is_paid: contentData.is_paid,
            price: contentData.price,
            views_count: contentData.views_count,
            likes_count: contentData.likes_count,
            comment_count: contentData.comment_count,
            playlist_id: contentData.playlist_id,
            genre: contentData.genre || [],
            age_restriction: contentData.age_restriction,
            created_at: contentData.created_at,
            releaseYear: contentData.created_at ? new Date(contentData.created_at).getFullYear() : new Date().getFullYear(),
            duration: 'N/A',
            rating: contentData.age_restriction || null,
          };


          setVideo(transformedVideo);

          // Fetch recommended videos (trending content)
          const recommendedResponse = await fetch('/api/content?page=1&limit=8', {
            method: 'GET',
            credentials: 'include',
          });

          const recommendedData = await recommendedResponse.json();
          if (recommendedData.status && recommendedData.data && Array.isArray(recommendedData.data)) {
            const recommended = recommendedData.data
              .filter(v => v.content_id !== contentData.content_id)
              .slice(0, 8)
              .map((item) => ({
                id: item.content_id,
                title: item.title,
                thumbnail: item.thumbnail?.url || item.thumbnail || '',
                description: item.description || '',
                views_count: item.views_count || 0,
                duration: item.duration || 'N/A',
                rating: item.rating || 0,
              }));

            setRecommendedVideos(recommended);
          }
        } else {
          throw new Error(data.message || 'Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  // Update URL with video title when video loads
  useEffect(() => {
    if (video && videoId) {
      const titleSlug = video.title
        ? video.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : '';

      const teaserIndex = currentTeaserIndex.toString();

      // New format: /{title-slug}?t={index}&c={content_id}
      const newPath = titleSlug
        ? `/${titleSlug}?t=${teaserIndex}&c=${videoId}`
        : `/?t=${teaserIndex}&c=${videoId}`;

      // Only update if the path is different
      if (window.location.pathname + window.location.search !== newPath) {
        window.history.replaceState({}, '', newPath);
      }
    }
  }, [video, videoId, currentTeaserIndex]);

  // Security measures to prevent downloads and screen recording
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S') ||
        (e.metaKey && e.key === 'S')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Detect screen recording (basic detection)
    const detectScreenRecording = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        console.warn('Screen recording capability detected');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    detectScreenRecording();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const handleBack = () => {
    router.push('/');
  };

  const handleVideoClick = (videoId, videoTitle) => {
    const titleSlug = createSlug(videoTitle);
    const path = titleSlug ? `/${titleSlug}?c=${videoId}` : `/?c=${videoId}`;
    router.push(path);
  };

  // Helper function to create URL-safe slug from title
  const createSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const updateTeaserIndex = (newIndex) => {
    setCurrentTeaserIndex(newIndex);
    // Update URL with video title and teaser index
    if (videoId && video) {
      const titleSlug = createSlug(video.title);
      // New format: /{title-slug}?t={index}&c={content_id}
      const newPath = titleSlug
        ? `/${titleSlug}?t=${newIndex}&c=${videoId}`
        : `/?t=${newIndex}&c=${videoId}`;
      window.history.pushState({}, '', newPath);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)} Billion Views`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)} Million Views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K Views`;
    }
    return `${views} Views`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error ? 'Error Loading Video' : 'Video Not Found'}
          </h2>
          <p className="text-white/60 mb-6">
            {error || "The video you're looking for doesn't exist."}
          </p>
          {error === "Authentication required" ? <Button onClick={() => router.push('/auth')} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Login
          </Button> : <Button onClick={handleBack} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white select-none">

        {/* Back Button */}
        {/*  <Button
          onClick={handleBack}
          variant="ghost"
          className="fixed top-20 left-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button> */}

        {/* Main Content - 50-50 Split Layout */}
        <div className="flex h-screen pt-1">
          {/* Left Column - Fixed Video Player (50%) */}
          <div className="w-1/2 h-full flex items-center justify-center bg-black p-6 sticky top-0">
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Video Player */}
              <video
                key={currentTeaserIndex} // Force re-render when teaser changes
                src={video.teasers && video.teasers.length > 0 ? video.teasers[currentTeaserIndex] : (video.teaser || video.video)}
                controls
                autoPlay
                loop
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                className="w-full h-auto max-h-full object-contain rounded-lg"
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onError={(e) => {
                  console.error('Video failed to load:', e);
                  console.error('Attempted video URL:', video.teasers?.[currentTeaserIndex] || video.teaser || video.video);
                  console.error('All teaser URLs:', video.teasers);
                }}
                onLoadedData={() => {
                  console.log('Video loaded successfully!');
                  console.log('Playing teaser:', video.teasers?.[currentTeaserIndex] || video.teaser);
                }}
                onKeyDown={(e) => {
                  // Prevent common download shortcuts
                  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                    e.preventDefault();
                    return false;
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>

              {/* Security Overlay - Invisible but prevents interactions */}
              <div
                className="absolute inset-0 pointer-events-none select-none"
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
              />

              {/* Navigation Controls - Only show if multiple teasers */}
              {video.teasers && video.teasers.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={() => updateTeaserIndex(currentTeaserIndex === 0 ? video.teasers.length - 1 : currentTeaserIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all z-10"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={() => updateTeaserIndex(currentTeaserIndex === video.teasers.length - 1 ? 0 : currentTeaserIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all z-10"
                  >
                    <ArrowLeft className="h-6 w-6 rotate-180" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {video.teasers.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => updateTeaserIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentTeaserIndex
                          ? 'bg-purple-500 w-8'
                          : 'bg-white/50 hover:bg-white/80'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Counter */}
                  <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white border border-white/20">
                    {currentTeaserIndex + 1} / {video.teasers.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Scrollable Content (50%) */}
          <div className="w-1/2 h-full overflow-y-auto">
            <div className="p-8 space-y-6">
              {/* Title */}
              <h1 className="text-4xl font-bold leading-tight">
                {video.title}
              </h1>

              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <span className="text-white/80">By</span>
                <span className="text-purple-400 font-semibold">{video.creator_name}</span>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Views:</span>
                  <span className="text-white font-semibold">{formatViews(video.views_count)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Likes:</span>
                  <span className="text-white font-semibold">{video.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Comments:</span>
                  <span className="text-white font-semibold">{video.comment_count || 0}</span>
                </div>
              </div>

              {/* Price & Status */}
              {/*<div className="flex items-center gap-3">
                {video.is_paid ? (
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg">
                      ₹{video.price}
                    </span>
                    <span className="text-white/60 text-sm">Premium Content</span>
                  </div>
                ) : (
                  <span className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg">
                    Free
                  </span>
                )}
              </div>*/}

              {/* Genre Tags */}
              {video.genre && video.genre.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-white/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Age Restriction */}
              {/* {video.age_restriction && (
                <div className="inline-block">
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded">
                    {video.age_restriction}+
                  </span>
                </div>
              )} */}

              {/* Description */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-white/80 leading-relaxed">
                  {video.description && video.description.length > 200 ? (
                    <>
                      {isDescriptionExpanded
                        ? video.description
                        : `${video.description.substring(0, 200)}...`}
                    </>
                  ) : (
                    video.description || 'No description available.'
                  )}
                  {video.description && video.description.length > 200 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-blue-400 hover:text-blue-300 ml-1 font-medium"
                    >
                      {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </p>
              </div>

              {/* Download Button */}
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg">
                <Download className="h-5 w-5 mr-2" />
                Download Glimz Now
              </Button>

              {/* Recommended Section */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold mb-6">RECOMMENDED</h2>

                {/* Grid of Recommended Videos */}
                <div className="grid grid-cols-2 gap-4 ">
                  {recommendedVideos.map((recVideo) => (
                    <div
                      key={recVideo.id}
                      onClick={() => handleVideoClick(recVideo.id, recVideo.title)}
                      className="cursor-pointer group border-1 border-white"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border-1 border-white">
                        <Image
                          src={recVideo.thumbnail}
                          alt={recVideo.title}
                          width={500}
                          height={500}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Views Badge */}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
                            {recVideo.views_count >= 1000
                              ? `${(recVideo.views_count / 1000).toFixed(0)}K VIEWS`
                              : `${recVideo.views_count} VIEWS`}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {recVideo.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex items-center gap-2 mt-1">
                        {recVideo.rating > 0 && (
                          <>
                            <span className="text-xs text-white/60">•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400 text-xs">★</span>
                              <span className="text-xs text-white/60">{recVideo.rating}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
