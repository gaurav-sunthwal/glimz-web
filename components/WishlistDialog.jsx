"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";

export const WishlistDialog = ({
  open,
  onOpenChange,
  contentId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    if (open) {
      fetchWishlists();
    }
  }, [open]);

  const fetchWishlists = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        "/api/user/getUserWishlist?page=1&limit=100",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("wishlists", data);
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
      setFetching(false);
    }
  };

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch("/api/user/createWishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          wishlist_name: newWishlistName.trim(),
          ...(contentId && { content_id: contentId.toString() }),
        }),
      });

      const data = await response.json();
      if (data.status) {
        toast({
          title: "Success",
          description: `Wishlist "${newWishlistName.trim()}" created successfully!`,
        });
        setNewWishlistName("");
        setShowCreateForm(false);
        await fetchWishlists();
        if (contentId && data.status) {
          onSuccess?.();
          onOpenChange(false);
        }
      } else {
        toast({
          title: "Error",
          description:
            data.message || "Failed to create wishlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to create wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddToWishlist = async (wishlistId) => {
    if (!contentId) return;

    try {
      setAdding(wishlistId);
      const response = await fetch("/api/user/addToWishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          wishlist_id: wishlistId.toString(),
          content_id: contentId.toString(),
        }),
      });

      const data = await response.json();
      if (data.status) {
        const wishlistName =
          wishlists.find((w) => (w.wishlist_id || w.id) === wishlistId)
            ?.wishlist_name || "wishlist";
        toast({
          title: "Success",
          description: `Added to "${wishlistName}" successfully!`,
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description:
            data.message || "Failed to add to wishlist. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Wishlist</DialogTitle>
          <DialogDescription>
            Select a wishlist or create a new one to save this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {!showCreateForm ? (
                <>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {wishlists.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No wishlists yet. Create your first one!
                      </p>
                    ) : (
                      wishlists.map((wishlist) => (
                        <Button
                          key={wishlist.wishlist_id || wishlist.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() =>
                            handleAddToWishlist(
                              wishlist.wishlist_id || wishlist.id
                            )
                          }
                          disabled={
                            adding === (wishlist.wishlist_id || wishlist.id)
                          }
                        >
                          {adding === (wishlist.wishlist_id || wishlist.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <span className="mr-2">📋</span>
                          )}
                          {wishlist.wishlist_name || wishlist.name}
                          {(wishlist.no_of_videos !== undefined ||
                            wishlist.content_count) && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              (
                              {wishlist.no_of_videos ||
                                wishlist.content_count ||
                                0}{" "}
                              items)
                            </span>
                          )}
                        </Button>
                      ))
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Wishlist
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wishlist-name">Wishlist Name</Label>
                    <Input
                      id="wishlist-name"
                      placeholder="Enter wishlist name"
                      value={newWishlistName}
                      onChange={(e) => setNewWishlistName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !creating) {
                          handleCreateWishlist();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewWishlistName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateWishlist}
                      disabled={!newWishlistName.trim() || creating}
                    >
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
