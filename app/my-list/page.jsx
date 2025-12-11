"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Trash2,
  Edit2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/VideoCard";
import { useIsMobile } from "../hooks/use-Mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/app/hooks/use-toast";
import { Header } from "@/components/Header";

export default function MyListPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWishlist, setEditingWishlist] = useState(null);
  const [editName, setEditName] = useState("");
  const [deletingWishlist, setDeletingWishlist] = useState(null);
  const [removingContent, setRemovingContent] = useState(null);

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/getUserWishlist?page=1&limit=100", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.status && data.data && Array.isArray(data.data)) {
        // Flatten wishlists from all data items
        const allWishlists = [];
        data.data.forEach((item) => {
          if (item.wishlists && Array.isArray(item.wishlists)) {
            allWishlists.push(...item.wishlists);
          }
        });
        setWishlists(allWishlists);
      } else if (data.status && data.data?.wishlists) {
        // Fallback for different structure
        setWishlists(data.data.wishlists);
      }
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditWishlist = async (wishlistId) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/user/wishlist/${wishlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wishlist_name: editName.trim() }),
      });

      const data = await response.json();
      if (data.status) {
        toast({
          title: "Success",
          description: `Wishlist renamed to "${editName.trim()}" successfully!`,
        });
        setEditingWishlist(null);
        setEditName("");
        fetchWishlists();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update wishlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWishlist = async () => {
    if (!deletingWishlist) return;

    try {
      const response = await fetch(
        `/api/user/wishlist/${deletingWishlist}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.status) {
        toast({
          title: "Success",
          description: "Wishlist deleted successfully!",
        });
        setDeletingWishlist(null);
        fetchWishlists();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete wishlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to delete wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveContent = async (wishlistId, contentId) => {
    try {
      setRemovingContent(contentId);
      const response = await fetch("/api/user/remove-content/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          wishlist_id: wishlistId.toString(),
          content_ids: [contentId.toString()],
        }),
      });

      const data = await response.json();
      if (data.status) {
        toast({
          title: "Success",
          description: "Content removed from wishlist successfully!",
        });
        fetchWishlists();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing content:", error);
      toast({
        title: "Error",
        description: "Failed to remove content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingContent(null);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const handlePlayVideo = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  const handleViewDetails = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  const handleAddToList = () => {
    // This is handled by VideoCard's wishlist dialog
  };

  // Transform wishlist content to VideoCard format
  const transformContent = (content) => {
    if (!content) return null;

    return {
      id: content.content_id || content.id,
      title: content.title || 'Untitled',
      thumbnail: content.thumbnail?.url || content.thumbnail || '',
      description: content.description || '',
      duration: content.duration || 'N/A',
      genre: content.genre || [],
      releaseYear: content.releaseYear || new Date().getFullYear(),
      rating: content.rating || null,
      views: content.views_count || content.views || null,
      likes: content.likes_count || content.likes || null,
      isLive: false,
      video: content.video,
      teaser: content.teaser,
      is_paid: content.is_paid,
      price: content.price,
      creator_username: content.creator_username,
      creator_first_name: content.creator_first_name,
      creator_last_name: content.creator_last_name,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background text-white pt-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                  <Heart className="h-8 w-8 text-red-400 fill-current" />
                  My Wishlists
                </h1>
                <p className="text-foreground-muted mt-2">
                  {wishlists.length}{" "}
                  {wishlists.length === 1 ? "wishlist" : "wishlists"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {wishlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-12 w-12 text-white/40" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">No wishlists yet</h2>
              <p className="text-foreground-muted mb-8 max-w-md">
                Create your first wishlist by clicking the heart icon on any video.
              </p>
              <Button onClick={handleBack} className="btn-glimz-primary">
                Browse Content
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {wishlists.map((wishlist) => {
                const contents = wishlist.items || wishlist.contents || wishlist.content || [];
                const transformedContents = contents
                  .map(transformContent)
                  .filter(Boolean);

                return (
                  <div key={wishlist.wishlist_id || wishlist.id} className="space-y-4">
                    {/* Wishlist Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {wishlist.wishlist_name || wishlist.name}
                        </h2>
                        <p className="text-foreground-muted mt-1">
                          {wishlist.no_of_videos || transformedContents.length}{" "}
                          {(wishlist.no_of_videos || transformedContents.length) === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingWishlist(wishlist.wishlist_id || wishlist.id);
                            setEditName(wishlist.wishlist_name || wishlist.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeletingWishlist(wishlist.wishlist_id || wishlist.id)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Wishlist Content */}
                    {transformedContents.length === 0 ? (
                      <div className="py-12 text-center border border-white/10 rounded-lg">
                        <p className="text-foreground-muted">
                          This wishlist is empty
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {transformedContents.map((content) => (
                          <div
                            key={content.id}
                            className="relative group"
                          >
                            <VideoCard
                              video={content}
                              onPlay={handlePlayVideo}
                              onAddToList={handleAddToList}
                              onViewDetails={handleViewDetails}
                              isInWatchlist={true}
                              size={isMobile ? "medium" : "large"}
                            />
                            <Button
                              onClick={() =>
                                handleRemoveContent(
                                  wishlist.wishlist_id || wishlist.id,
                                  content.id
                                )
                              }
                              variant="ghost"
                              disabled={removingContent === content.id}
                              className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/30"
                            >
                              {removingContent === content.id ? (
                                <Loader2 className="h-4 w-4 text-red-400 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 text-red-400" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Wishlist Dialog */}
        <Dialog
          open={!!editingWishlist}
          onOpenChange={(open) => {
            if (!open) {
              setEditingWishlist(null);
              setEditName("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Wishlist</DialogTitle>
              <DialogDescription>
                Update the name of your wishlist
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="wishlist-name">Wishlist Name</Label>
                <Input
                  id="wishlist-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && editName.trim()) {
                      handleEditWishlist(editingWishlist);
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingWishlist(null);
                  setEditName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleEditWishlist(editingWishlist)}
                disabled={!editName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingWishlist}
          onOpenChange={(open) => {
            if (!open) setDeletingWishlist(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Wishlist</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this wishlist? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWishlist}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
