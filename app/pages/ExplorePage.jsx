import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Share,
  Heart,
  Bookmark,
  MessageCircle,
  Send,
  ChevronRight,
  Play,
  Bell,
  Star,
  DollarSign,
  CheckCircle,
  X,
  Pause,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/app/hooks/use-toast";

// Mock data - in a real app this would come from your API/store
const mockCreators = [
  {
    id: "creator1",
    name: "Sarah Mitchell",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b5b6b8c1?w=150",
    verified: true,
    followers: "125K",
    category: "Comedy",
  },
  {
    id: "creator2",
    name: "Alex Rivera",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    verified: true,
    followers: "89K",
    category: "Music",
  },
  {
    id: "creator3",
    name: "Maya Chen",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    verified: true,
    followers: "156K",
    category: "Lifestyle",
  },
];

const mockVideos = [
  {
    id: "1",
    title: "Amazing Street Performance",
    description:
      "Watch this incredible street performer captivate the crowd with their talent.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "2:30",
    likes: 1250,
    genre: ["Music"],
  },
  {
    id: "2",
    title: "Comedy Gold Moment",
    description: "This hilarious moment will have you laughing out loud!",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "1:45",
    likes: 892,
    genre: ["Comedy"],
  },
  {
    id: "3",
    title: "Travel Adventure",
    description: "Join me on this incredible journey to discover hidden gems.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "3:15",
    likes: 2100,
    genre: ["Travel"],
  },
];

const generateMockComments = (videoId) => [
  {
    id: `${videoId}-1`,
    user: "MusicLover23",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
    text: "Amazing performance! 🎵",
    timestamp: Date.now() - 300000, // 5 minutes ago
    likes: 12,
  },
  {
    id: `${videoId}-2`,
    user: "ComedyFan",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b5b6b8c1?w=50",
    text: "This is hilarious 😂",
    timestamp: Date.now() - 600000, // 10 minutes ago
    likes: 8,
  },
  {
    id: `${videoId}-3`,
    user: "CreativeVibes",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
    text: "So talented!",
    timestamp: Date.now() - 900000, // 15 minutes ago
    likes: 15,
  },
  {
    id: `${videoId}-4`,
    user: "TechGuru",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
    text: "Love the creativity here! Keep it up 👏",
    timestamp: Date.now() - 1800000, // 30 minutes ago
    likes: 23,
  },
];

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

// Transform video data with creators
const contentData = mockVideos.map((video, index) => ({
  ...video,
  creator: mockCreators[index % mockCreators.length],
  isPremium: Math.random() > 0.6,
  saves: Math.floor(video.likes * 0.15),
  tags: [video.genre[0], Math.random() > 0.6 ? "Premium" : "Free"],
}));

const CommentDrawer = ({ videoId, videoTitle, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLikes, setCommentLikes] = useState({});

  useEffect(() => {
    if (isOpen) {
      setComments(generateMockComments(videoId));
    }
  }, [isOpen, videoId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: `${videoId}-${Date.now()}`,
      user: "You",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
      text: newComment,
      timestamp: Date.now(),
      likes: 0,
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };
  
  const handleLikeComment = (commentId) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
            likes: commentLikes[commentId]
              ? comment.likes - 1
              : comment.likes + 1,
          }
        : comment
    )
  );
};

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh] bg-black text-white border-gray-800">
        <DrawerHeader className="border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              Comments
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800"
              >
                <X size={20} />
              </Button>
            </DrawerClose>
          </div>
          <p className="text-gray-400 text-sm">{videoTitle}</p>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.avatar}
                alt={comment.user}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.user}</span>
                  <span className="text-gray-400 text-xs">
                    {formatTimeAgo(comment.timestamp)}
                  </span>
                </div>
                <p className="text-white text-sm mb-2 leading-relaxed">
                  {comment.text}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      size={16}
                      className={
                        commentLikes[comment.id]
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-xs">{comment.likes}</span>
                  </button>
                  <button className="text-gray-400 hover:text-white text-xs transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="flex gap-3 items-end">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"
              alt="Your avatar"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function AutoRollingComments({ videoId, isActive }) {
  const [visibleComments, setVisibleComments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const comments = generateMockComments(videoId);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const comment = comments[currentIndex % comments.length];
      const newComment = {
        ...comment,
        id: `${comment.id}-${Date.now()}`,
      };

      setVisibleComments((prev) => {
        const updated = [...prev, newComment];
        return updated.length > 2 ? updated.slice(-2) : updated;
      });

      // Auto remove after 4 seconds
      setTimeout(() => {
        setVisibleComments((prev) =>
          prev.filter((c) => c.id !== newComment.id)
        );
      }, 4000);

      setCurrentIndex((prev) => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [comments, currentIndex, isActive]);

  return (
    <div className="absolute bottom-[30%] left-4 right-20 space-y-2 z-10">
      {visibleComments.map((comment) => (
        <div
          key={comment.id}
          className="bg-black/75 backdrop-blur-sm rounded-lg p-3 max-w-xs border border-white/15 shadow-lg animate-fade-in-up"
        >
          <div className="flex items-center gap-2 mb-1">
            <img
              src={comment.avatar}
              alt={comment.user}
              className="w-4 h-4 rounded-full"
            />
            <div className="flex items-center justify-between flex-1">
              <span className="text-blue-400 text-xs font-semibold">
                {comment.user}
              </span>
              <div className="flex items-center gap-1">
                <Heart size={10} className="text-red-500" />
                <span className="text-white/70 text-xs">{comment.likes}</span>
              </div>
            </div>
          </div>
          <p className="text-white text-sm leading-tight">{comment.text}</p>
        </div>
      ))}
    </div>
  );
}

// Heart Animation Component for Double Tap
const HeartAnimation = ({ show, x, y }) => {
  if (!show) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none animate-heart-float"
      style={{
        left: x - 30,
        top: y - 30,
      }}
    >
      <Heart
        size={60}
        className="text-red-500 fill-current drop-shadow-lg animate-pulse"
      />
    </div>
  );
};

const VideoCard = ({
  item,
  index,
  currentIndex,
  onUnlockContent,
  onAddToWatchlist,
  onShare,
  onLike,
  isInWatchlist,
  isLiked,
  isActive,
  onNavigateToVideo,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      setIsPlaying(true);
      setShowPlayIcon(false);
      videoRef.current.play().catch(console.error);
    } else if (videoRef.current) {
      setIsPlaying(false);
      setShowPlayIcon(true);
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = videoRef.current.currentTime / videoRef.current.duration;
      setVideoProgress(progress);
    }
  };

  const handleVideoClick = (e) => {
    const now = Date.now();
    const tapDelay = 300; // milliseconds

    if (now - lastTap < tapDelay) {
      // Double tap detected
      handleDoubleTap(e);
    } else {
      // Single tap - toggle play/pause
      setTimeout(() => {
        if (Date.now() - now >= tapDelay) {
          handleSingleTap();
        }
      }, tapDelay);
    }
    
    setLastTap(now);
  };

  const handleSingleTap = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
      setShowPlayIcon(false);
    }
  };

  const handleDoubleTap = (e) => {
    // Get tap position for heart animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setHeartPosition({ x, y });
    setShowHeartAnimation(true);
    
    // Trigger like
    onLike();
    
    // Hide heart animation after 1 second
    setTimeout(() => {
      setShowHeartAnimation(false);
    }, 1000);
  };

  const handleSwipeToVideo = () => {
    onNavigateToVideo(item.id);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black group">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={item.videoUrl}
        loop
        playsInline
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={() => setVideoProgress(0)}
      />

      {/* Video Tap Area */}
      <div
        className="absolute inset-0 z-20"
        onClick={handleVideoClick}
      />

      {/* Heart Animation for Double Tap */}
      <HeartAnimation
        show={showHeartAnimation}
        x={heartPosition.x}
        y={heartPosition.y}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />

      {/* Play/Pause Icon Overlay */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm animate-fade-in">
            <Play size={32} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Top Content */}
      <div className="absolute top-6 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex-1 mr-4">
          <h2 className="text-white text-xl font-bold mb-2 drop-shadow-lg line-clamp-2">
            {item.title}
          </h2>
          <p className="text-white/90 text-sm mb-3 drop-shadow-md line-clamp-2">
            {item.description}
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1 bg-black/70 px-3 py-1 rounded-full">
              <DollarSign size={14} className="text-blue-400" />
              <span className="text-blue-400 text-xs font-semibold">
                {item.isPremium ? "4.99" : "Free"}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/70 px-3 py-1 rounded-full">
              <Star size={14} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">4.2</span>
            </div>
          </div>
        </div>
        <button className="relative p-2 pointer-events-auto">
          <Bell size={20} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-black rounded-full" />
        </button>
      </div>

      {/* Rolling Comments */}
      <AutoRollingComments videoId={item.id} isActive={isActive} />

      {/* Bottom Content */}
      <div className="absolute bottom-[9%] left-4 right-24 z-20 pointer-events-none">
        {/* Creator Info */}
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-center">
            <img
              src={item.creator.avatar}
              alt={item.creator.name}
              className="w-14 h-14 rounded-full border-2 border-blue-400 mr-4"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">
                  {item.creator.name}
                </h3>
                {item.creator.verified && (
                  <CheckCircle size={16} className="text-blue-400" />
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-400">
                  {item.genre[0]}
                </span>
                <span className="text-white/80 text-xs">{item.duration}</span>
                <span className="text-white/80 text-xs">
                  {item.likes}K views
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-[10%] flex flex-col items-center gap-2 z-30  w-[10%]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex flex-col items-center gap-1 p-2 hover:scale-110 transition-transform"
        >
          <Heart
            size={28}
            className={isLiked ? "text-red-500 fill-current" : "text-white"}
          />
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {item.likes + (isLiked ? 1 : 0)}K
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 p-2 hover:scale-110 transition-transform"
        >
          <MessageCircle size={28} className="text-white" />
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {generateMockComments(item.id).length}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWatchlist();
          }}
          className="flex flex-col items-center gap-1 p-2 hover:scale-110 transition-transform"
        >
          <Bookmark
            size={28}
            className={
              isInWatchlist ? "text-blue-400 fill-current" : "text-white"
            }
          />
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {item.saves}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare("chat");
          }}
          className="flex flex-col items-center gap-1 p-2 hover:scale-110 transition-transform"
        >
          <Send size={28} className="text-white" />
          <span className="text-white text-xs font-medium drop-shadow-lg">
            Chat
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare("external");
          }}
          className="flex flex-col items-center gap-1 p-2 hover:scale-110 transition-transform"
        >
          <Share size={28} className="text-white" />
          <span className="text-white text-xs font-medium drop-shadow-lg">
            Share
          </span>
        </button>
      </div>

      {/* Comments Drawer */}
      <CommentDrawer
        videoId={item.id}
        videoTitle={item.title}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Swipe to Video Indicator */}
      <button 
        onClick={handleSwipeToVideo}
        className="absolute right-4 top-[35%] transform -translate-y-1/2 z-40 animate-pulse hover:scale-105 transition-transform"
      >
        <div className="flex bg-white/90 rounded-full p-3 shadow-lg animate-bounce-x">
          <span className="text-black text-sm font-semibold mr-2">
            Swipe to Video
          </span>
          <ChevronRight size={24} className="text-black" />
        </div>
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-[57px] left-0 right-0 h-1 bg-white/30 z-30">
        <div
          className="h-full bg-blue-400 transition-all duration-300 ease-out"
          style={{ width: `${videoProgress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default function VideoFeed() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
  const containerRef = useRef(null);

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
      setShowFullscreenPrompt(false);
    } catch (error) {
      console.log("Fullscreen failed:", error);
      setShowFullscreenPrompt(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = containerRef.current.clientHeight;
      const newIndex = Math.round(scrollTop / windowHeight);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleUnlockContent = (item) => {
    console.log("Unlock content:", item.title);
    // Navigate to video details page
  };

  const handleAddToWatchlist = (itemId) => {
    setWatchlist((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLike = (itemId) => {
    setLikedVideos((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleShare = async (item, type) => {
    if (type === "chat") {
      console.log("Share in chat:", item.title);
    } else {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out "${item.title}" by ${item.creator.name}!`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Link copied to clipboard!",
        });
      }
    }
  };

  const handleNavigateToVideo = (videoId) => {
    console.log("Navigate to video:", videoId);
    // Here you would typically use react-router or your navigation method
    // For now, we'll just log it and show a toast
    toast({
      title: "Navigating",
      description: `Navigating to video: ${videoId}`,
    });
    // Example: history.push(`/video/${videoId}`);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      {/* Fullscreen Prompt Overlay */}
      {showFullscreenPrompt && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-4 text-center border border-gray-700 shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play size={28} className="text-white ml-1" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Best Experience
              </h2>
              <p className="text-gray-400 leading-relaxed">
                For the best video experience, we recommend viewing in fullscreen mode
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={enterFullscreen}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg"
              >
                Enter Fullscreen
              </button>
              <button
                onClick={() => setShowFullscreenPrompt(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Continue Without Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {contentData.map((item, index) => (
          <div key={item.id} className="snap-start w-full h-full">
            <VideoCard
              item={item}
              index={index}
              currentIndex={currentIndex}
              onUnlockContent={() => handleUnlockContent(item)}
              onAddToWatchlist={() => handleAddToWatchlist(item.id)}
              onShare={(type) => handleShare(item, type)}
              onLike={() => handleLike(item.id)}
              isInWatchlist={watchlist.includes(item.id)}
              isLiked={likedVideos.includes(item.id)}
              isActive={currentIndex === index}
              onNavigateToVideo={handleNavigateToVideo}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .animate-bounce-x {
          animation: bounceX 1s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-heart-float {
          animation: heartFloat 1s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceX {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes heartFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.5);
          }
          15% {
            transform: translateY(-10px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
