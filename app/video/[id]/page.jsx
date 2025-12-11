"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Heart, Share, Plus, Clock, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCarousel } from '@/components/VideoCarousel';
import { useAppStore } from '../../store/appStore';
import { WishlistDialog } from '@/components/WishlistDialog';

export default function VideoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id;

  const { watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/creator/content/${videoId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.status && data.data?.data) {
          const contentData = data.data.data;

          // Transform API response to match component expectations
          const transformedVideo = {
            id: contentData.content_id,
            title: contentData.title,
            description: contentData.description,
            thumbnail: contentData.thumbnail?.url || contentData.thumbnail || '',
            heroImage: contentData.thumbnail?.url || contentData.thumbnail || '',
            video: contentData.video,
            teaser: contentData.teaser,
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
            // Add default values
            releaseYear: contentData.created_at ? new Date(contentData.created_at).getFullYear() : new Date().getFullYear(),
            duration: 'N/A',
            rating: contentData.age_restriction || null,
            views: contentData.views_count ? `${contentData.views_count} views` : '0 views',
            likes: contentData.likes_count ? `${contentData.likes_count} likes` : '0 likes',
            isLive: false,
          };

          setVideo(transformedVideo);

          // Fetch recommended videos (trending content)
          const recommendedResponse = await fetch('/api/content?page=1&limit=12', {
            method: 'GET',
            credentials: 'include',
          });

          const recommendedData = await recommendedResponse.json();
          if (recommendedData.status && recommendedData.data && Array.isArray(recommendedData.data)) {
            const recommended = recommendedData.data
              .filter(v => v.content_id !== contentData.content_id)
              .slice(0, 12)
              .map((item) => ({
                id: item.content_id,
                title: item.title,
                thumbnail: item.thumbnail?.url || item.thumbnail || '',
                description: item.description || '',
                genre: [],
                releaseYear: item.created_at ? new Date(item.created_at).getFullYear() : new Date().getFullYear(),
                rating: null,
                views: item.views_count ? `${item.views_count} views` : null,
                likes: item.likes_count ? `${item.likes_count} likes` : null,
                duration: 'N/A',
                isLive: false,
              }));

            setRecommendedVideos(recommended);
          }
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId]);

  // Handler functions - defined before early returns
  const handleBack = () => {
    router.push('/');
  };

  const handlePlayVideo = (videoId) => {
    // Navigate to the streaming page
    router.push(`/watch/${videoId || video?.id}`);
  };

  const handleViewDetails = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  const handleAddToList = (videoId) => {
    if (watchlist.includes(videoId)) {
      removeFromWatchlist(videoId);
    } else {
      addToWatchlist(videoId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-glimz-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted text-sm sm:text-base">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
          <p className="text-foreground-muted mb-6">The video you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="btn-glimz-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isInWatchlist = video ? watchlist.includes(video.id) : false;

  const handleWatchlistToggle = () => {
    if (!video) return;
    if (isInWatchlist) {
      removeFromWatchlist(video.id);
    } else {
      // Show wishlist dialog
      setShowWishlistDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Video Player Section */}
      <section className="relative h-screen">
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="ghost"
          className="absolute top-16 sm:top-20 left-3 sm:left-4 z-50 p-2 sm:p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        {/* Video Background */}
        <div className="absolute inset-0">
          <img
            src={video.heroImage}
            alt={video.title}
            className="w-full h-full object-contain "
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </div>

        {/* Video Info Overlay */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex items-end pb-16 sm:pb-20">
          <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">{video.releaseYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">{video.duration}</span>
              </div>
              <span className="px-2 py-1 bg-white/20 rounded text-xs sm:text-sm font-medium">
                {video.rating}
              </span>
              <div className="flex gap-1 sm:gap-2">
                {video.genre.map((genre) => (
                  <span key={genre} className="genre-tag text-xs sm:text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description with Read More/Less */}
            <div className="space-y-2">
              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
                {video.description && video.description.length > 150 ? (
                  <>
                    {isDescriptionExpanded
                      ? video.description
                      : `${video.description.substring(0, 150)}...`}
                  </>
                ) : (
                  video.description
                )}
              </p>
              {video.description && video.description.length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-sm sm:text-base text-glimz-primary hover:text-glimz-primary/80 font-medium transition-colors"
                >
                  {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Button
                onClick={() => handlePlayVideo(video.id)}
                className="btn-glimz-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-glow w-full sm:w-auto"
              >
                <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
                Watch Now
              </Button>

              <Button
                onClick={handleWatchlistToggle}
                variant="ghost"
                className="p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 w-full sm:w-auto"
              >
                <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${isInWatchlist ? 'fill-current text-red-400' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                className="p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 w-full sm:w-auto"
              >
                <Share className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Videos */}
      {recommendedVideos.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">More Like This</h2>
            <VideoCarousel
              title=""
              videos={recommendedVideos}
              onPlay={handlePlayVideo}
              onAddToList={handleAddToList}
              onViewDetails={handleViewDetails}
              watchlist={watchlist}
              size="large"
            />
          </div>
        </section>
      )}

      {/* Wishlist Dialog */}
      <WishlistDialog
        open={showWishlistDialog}
        onOpenChange={setShowWishlistDialog}
        contentId={video.id}
        onSuccess={() => {
          // Optionally update UI
        }}
      />
    </div>
  );
}
