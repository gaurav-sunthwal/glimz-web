import React, { useState, useEffect } from "react";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Share,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreVertical,
  Home,
  Search,
  List,
  ShoppingBag,
  User,
  Send,
  X,
} from "lucide-react";

// Custom components styled like shadcn
const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Avatar = ({ children, className = "" }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className = "" }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const ExplorePage = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);

  // Mock video data with comments
  const videos = [
    {
      id: 1,
      title: "Beyond the Stars",
      description:
        "Journey into the unknown as humanity takes its first steps beyond our solar system...",
      rating: "53.25",
      creator: "Sarah Mitchell",
      category: "Sci-Fi",
      duration: "2h 15m",
      views: "1.0K",
      likes: 94,
      bookmarks: 28,
      thumbnail:
        "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=700&fit=crop&crop=center",
      isVerified: true,
      comments: [
        { id: 1, user: "John Doe", text: "This is absolutely amazing! 🚀", avatar: "JD", time: "2m ago" },
        { id: 2, user: "Alice Smith", text: "The visuals are breathtaking! 😍", avatar: "AS", time: "5m ago" },
        { id: 3, user: "Mike Johnson", text: "Can't wait for the sequel!", avatar: "MJ", time: "8m ago" },
        { id: 4, user: "Emma Wilson", text: "Mind-blowing storytelling 🔥", avatar: "EW", time: "12m ago" },
        { id: 5, user: "David Brown", text: "This deserves an Oscar!", avatar: "DB", time: "15m ago" },
      ]
    },
    {
      id: 2,
      title: "Ocean's Mystery",
      description:
        "Deep beneath the waves lies a secret that could change everything we know about marine life...",
      rating: "47.8",
      creator: "David Ocean",
      category: "Documentary",
      duration: "1h 45m",
      views: "2.5K views",
      likes: 156,
      bookmarks: 42,
      thumbnail:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=700&fit=crop&crop=center",
      isVerified: false,
      comments: [
        { id: 1, user: "Marine Lover", text: "The underwater shots are incredible! 🌊", avatar: "ML", time: "1m ago" },
        { id: 2, user: "Nature Doc", text: "Educational and beautiful", avatar: "ND", time: "4m ago" },
        { id: 3, user: "Ocean Explorer", text: "Makes me want to dive deep!", avatar: "OE", time: "7m ago" },
        { id: 4, user: "Blue Planet", text: "Nature's mysteries unveiled 🐠", avatar: "BP", time: "10m ago" },
      ]
    },
    {
      id: 3,
      title: "Neon Dreams",
      description:
        "In a cyberpunk future, a hacker discovers a conspiracy that threatens the digital world...",
      rating: "61.2",
      creator: "Alex Cyber",
      category: "Action",
      duration: "2h 8m",
      views: "5.2K views",
      likes: 287,
      bookmarks: 89,
      thumbnail:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=700&fit=crop&crop=center",
      isVerified: true,
      comments: [
        { id: 1, user: "Cyber Punk", text: "The neon aesthetics are perfect! ⚡", avatar: "CP", time: "3m ago" },
        { id: 2, user: "Tech Geek", text: "Love the cyberpunk vibes!", avatar: "TG", time: "6m ago" },
        { id: 3, user: "Future Fan", text: "This is the future we deserve 🔮", avatar: "FF", time: "9m ago" },
        { id: 4, user: "Matrix Lover", text: "Getting Matrix vibes!", avatar: "ML", time: "13m ago" },
      ]
    },
  ];

  // Auto-cycle through comments every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCommentIndex(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = (videoId) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleBookmark = (videoId) => {
    setBookmarkedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollTop;
    const videoHeight = window.innerHeight;
    const newCurrentVideo = Math.round(scrollPosition / videoHeight);
    setCurrentVideo(newCurrentVideo);
  };

  const toggleComments = (videoId) => {
    setShowComments(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const addComment = (videoId) => {
    if (newComment.trim()) {
      // In a real app, you'd add this to your state/database
      console.log(`Adding comment to video ${videoId}: ${newComment}`);
      setNewComment("");
    }
  };

  const currentVideoData = videos[currentVideo] || videos[0];
  const visibleComments = currentVideoData.comments.slice(0, 3);
  const currentComment = visibleComments[currentCommentIndex];

  return (
    <div className="grid grid-cols-1 md:w-[50%] md:p-3 h-[100vh] mx-auto">
      <div className="bg-black text-white h-[100vh] relative">
        {/* Main Content */}
        <div
          className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="relative h-screen w-full snap-start flex items-center justify-center"
              style={{
                backgroundImage: `url(${video.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/60" />

              {/* Video Content */}
              <div className="relative z-10 w-full h-full flex flex-col">
                {/* Top Content */}
                <div className="absolute top-6 left-6 right-20">
                  <h1 className="text-2xl font-bold text-white mb-3">
                    {video.title}
                  </h1>
                  <p className="text-white/90 text-sm leading-relaxed mb-4 max-w-80">
                    {video.description}
                  </p>

                  {/* Rating Badge */}
                  <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full">
                    <span className="text-white font-medium text-sm">
                      ⭐ {video.rating}
                    </span>
                  </div>
                </div>

                {/* Floating Comments - Show current comment */}
                {currentVideo === index && currentComment && (
                  <div className="absolute top-[45%] left-6 right-24 z-20">
                    <Card className="bg-black/50 backdrop-blur-sm border-white/20 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                              {currentComment.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-white font-medium text-sm">
                                {currentComment.user}
                              </span>
                              <span className="text-white/50 text-xs">
                                {currentComment.time}
                              </span>
                            </div>
                            <p className="text-white text-sm">
                              {currentComment.text}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Swipe for Full Video Button */}
                <div className="absolute top-[30%] right-1">
                  <Button className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-l-[10px] text-white font-medium hover:from-purple-600 hover:to-pink-600">
                    <span className="mr-2">Swipe for Full Video</span>
                    <Play className="w-4 h-4" fill="white" />
                  </Button>
                </div>

                {/* Right Side Actions */}
                <div className="absolute right-0 bottom-[20%] flex flex-col items-center space-y-1">
                  {/* Like */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLike(video.id)}
                    className="flex flex-col items-center space-y-2 h-auto p-3"
                  >
                    <Heart
                      className={`w-7 h-7 ${
                        likedVideos.has(video.id)
                          ? "text-red-500 fill-red-500"
                          : "text-white"
                      }`}
                    />
                    <span className="text-white text-xs font-medium">
                      {video.likes + (likedVideos.has(video.id) ? 1 : 0)}
                    </span>
                  </Button>

                  {/* Bookmark */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmark(video.id)}
                    className="flex flex-col items-center space-y-1 h-auto p-3"
                  >
                    <Bookmark
                      className={`w-7 h-7 ${
                        bookmarkedVideos.has(video.id)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-white"
                      }`}
                    />
                    <span className="text-white text-xs font-medium">
                      {video.bookmarks +
                        (bookmarkedVideos.has(video.id) ? 1 : 0)}
                    </span>
                  </Button>

                  {/* Chat */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleComments(video.id)}
                    className="flex flex-col items-center space-y-2 h-auto p-3"
                  >
                    <MessageCircle className="w-7 h-7 text-white" />
                    <span className="text-white text-xs font-medium">
                      {video.comments.length}
                    </span>
                  </Button>

                  {/* Share */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex flex-col items-center space-y-2 h-auto p-3"
                  >
                    <Share className="w-7 h-7 text-white" />
                    <span className="text-white text-xs font-medium">
                      Share
                    </span>
                  </Button>
                </div>

                {/* Bottom Creator Info */}
                <div className="absolute bottom-[150px] left-6 right-24">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg">
                        {video.creator.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-semibold">
                          {video.creator}
                        </span>
                        {video.isVerified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-white/70 w-full">
                        <span className="bg-purple-600 px-2 py-0.5 rounded text-xs">
                          {video.category}
                        </span>
                        <span>{video.duration}</span>
                        <span>{video.views}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/90 text-sm">
                    Amazing performance! 🔥
                  </p>
                </div>

                {/* Play/Pause Control */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-4 rounded-full transition-opacity h-auto ${
                      isPlaying ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-16 h-16 text-white" />
                    ) : (
                      <Play
                        className="w-16 h-16 text-white ml-2"
                        fill="white"
                      />
                    )}
                  </Button>
                </div>
              </div>

              {/* Comments Modal */}
              {showComments[video.id] && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-end">
                  <Card className="w-full h-[70%] bg-gray-900 rounded-t-xl border-gray-700">
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Comments Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h3 className="text-white font-semibold">
                          {video.comments.length} Comments
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleComments(video.id)}
                          className="text-white hover:bg-gray-800"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Comments List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {video.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                {comment.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-white font-medium text-sm">
                                  {comment.user}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {comment.time}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                              You
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex space-x-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addComment(video.id);
                                }
                              }}
                            />
                            <Button
                              onClick={() => addComment(video.id)}
                              disabled={!newComment.trim()}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
        `}</style>
      </div>
    </div>
  );
};

export default ExplorePage;