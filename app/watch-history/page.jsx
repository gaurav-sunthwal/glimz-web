"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Play,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function WatchHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadWatchHistory = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch("/api/user/watch-history", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      console.log("📺 Fetched watch history:", data);
      
      if (data.status && data.result) {
        setWatchHistory(data.result || []);
      } else {
        setError(data.message || "Failed to load watch history");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error loading watch history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWatchHistory();
  }, [loadWatchHistory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadWatchHistory(true);
  }, [loadWatchHistory]);

  const handleVideoPress = useCallback(
    (item) => {
      router.push(`/watch/${item.content_id}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      setDeletingHistoryId(itemToDelete.history_id);
      const response = await fetch(
        `/api/user/watch-history/${itemToDelete.history_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.status) {
        setWatchHistory((prev) =>
          prev.filter(
            (historyItem) => historyItem.history_id !== itemToDelete.history_id
          )
        );
        toast({
          title: "Success",
          description: "Removed from watch history",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove from history",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error deleting watch history item:", error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingHistoryId(null);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, toast]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Watch History</h1>
          {watchHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="ml-auto"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading && !refreshing ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadWatchHistory()}>Retry</Button>
          </div>
        ) : watchHistory.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Watch History</h2>
            <p className="text-muted-foreground mb-6">
              Start watching videos to see your history here
            </p>
            <Button onClick={() => router.push("/")}>Explore Videos</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchHistory.map((item) => (
              <div
                key={item.history_id}
                className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={item.thumbnail?.url || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(item.percentage_watched, 100)}%`,
                      }}
                    />
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => handleVideoPress(item)}
                    >
                      <Play className="h-6 w-6 fill-current" />
                    </Button>
                  </div>

                  {/* Completed Badge */}
                  {item.is_completed && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDuration(item.duration_watched)} /{" "}
                      {formatDuration(item.total_duration)}
                    </span>
                    <span>•</span>
                    <span>{Math.round(item.percentage_watched)}% watched</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {formatDate(item.last_watched_at)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleVideoPress(item)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Continue
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(item)}
                      disabled={deletingHistoryId === item.history_id}
                    >
                      {deletingHistoryId === item.history_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToDelete?.title}" from your
              watch history?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

