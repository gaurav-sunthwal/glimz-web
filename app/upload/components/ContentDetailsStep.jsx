"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlignLeft,
  List,
  AlertCircle,
  Plus,
  X,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/app/hooks/use-toast";

const categories = [
  "Comedy",
  "Music",
  "Lifestyle",
  "Tech",
  "Travel",
  "Food",
  "Fashion",
  "Art",
  "Sports",
  "Gaming",
];

const ageRestrictions = [
  { label: "All Ages (G)", value: "G" },
  { label: "Parental Guidance (PG)", value: "PG" },
  { label: "Parental Guidance 13+ (PG-13)", value: "PG-13" },
  { label: "Restricted 17+ (R)", value: "R" },
  { label: "Adults Only 18+ (NC-17)", value: "NC-17" },
];

const TagInput = ({ tags, onAddTag, onRemoveTag }) => {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setTagInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-white">Tags</Label>
      <div className="flex gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="Add a tag..."
          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
        />
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!tagInput.trim()}
          className="bg-glimz-primary hover:bg-glimz-primary/90"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-glimz-primary/20 text-glimz-primary border-glimz-primary/50 flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export const ContentDetailsStep = ({ data, onDataChange, onNext, onBack }) => {
  const { toast } = useToast();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAgeRestrictionModal, setShowAgeRestrictionModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [tempDescription, setTempDescription] = useState(
    data.contentData.description
  );

  useEffect(() => {
    if (showPlaylistModal) {
      fetchPlaylists();
    }
  }, [showPlaylistModal]);

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const response = await fetch("/api/creator/playlists", {
        credentials: "include",
      });
      const result = await response.json();
      if (result.status && result.data) {
        setPlaylists(result.data[0]?.playlists || []);
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a playlist title",
        variant: "destructive",
      });
      return;
    }

    setCreatingPlaylist(true);
    try {
      const response = await fetch("/api/creator/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          playlist_title: newPlaylistTitle.trim(),
          bundle_price: 0,
        }),
      });
      const result = await response.json();
      if (result.status) {
        await fetchPlaylists();
        setShowCreatePlaylist(false);
        setNewPlaylistTitle("");
        if (result.data?.playlist_id) {
          onDataChange({
            contentData: {
              ...data.contentData,
              playlistId: result.data.playlist_id,
            },
          });
        }
        toast({
          title: "Success",
          description: "Playlist created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create playlist",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create playlist",
        variant: "destructive",
      });
      console.error("Create playlist error:", err);
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const handleAddTag = useCallback(
    (tag) => {
      onDataChange({
        contentData: {
          ...data.contentData,
          tags: [...data.contentData.tags, tag],
        },
      });
    },
    [data.contentData, onDataChange]
  );

  const handleRemoveTag = useCallback(
    (tag) => {
      onDataChange({
        contentData: {
          ...data.contentData,
          tags: data.contentData.tags.filter((t) => t !== tag),
        },
      });
    },
    [data.contentData, onDataChange]
  );

  const getThumbnailUri = () => {
    if (data.teaserThumbnail?.url) {
      return data.teaserThumbnail.url;
    }
    if (data.teaserThumbnail?.file) {
      return URL.createObjectURL(data.teaserThumbnail.file);
    }
    if (data.teaserVideo?.url) {
      return data.teaserVideo.url;
    }
    if (data.teaserVideo?.file) {
      return URL.createObjectURL(data.teaserVideo.file);
    }
    return null;
  };

  const getDescriptionPreview = () => {
    if (!data.contentData.description) {
      return null;
    }
    const words = data.contentData.description.trim().split(/\s+/);
    if (words.length <= 9) {
      return data.contentData.description;
    }
    return words.slice(0, 9).join(" ") + "...";
  };

  const handleSaveDescription = () => {
    onDataChange({
      contentData: { ...data.contentData, description: tempDescription },
    });
    setShowDescriptionModal(false);
  };

  const selectedPlaylist = playlists.find(
    (p) => p.playlist_id === data.contentData.playlistId
  );
  const selectedAgeRestriction = ageRestrictions.find(
    (r) => r.value === data.contentData.ageRestriction
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Content Details</h2>
        <p className="text-gray-400">
          Add title, description, category, and other details for your content.
        </p>
      </div>

      {/* Thumbnail Preview */}
      {getThumbnailUri() && (
        <div className="relative aspect-[4/5] max-w-xs mx-auto rounded-lg overflow-hidden">
          <img
            src={getThumbnailUri()}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700">
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white">
              Title *
            </Label>
            <Input
              id="title"
              value={data.contentData.title}
              onChange={(e) =>
                onDataChange({
                  contentData: {
                    ...data.contentData,
                    title: e.target.value,
                  },
                })
              }
              placeholder="Create a title (type @ to mention a channel)"
              maxLength={100}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <button
              type="button"
              onClick={() => {
                setTempDescription(data.contentData.description);
                setShowDescriptionModal(true);
              }}
              className="w-full flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <AlignLeft className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <Label className="text-white">Add description</Label>
                {getDescriptionPreview() && (
                  <p className="text-sm text-gray-400 mt-1">
                    {getDescriptionPreview()}
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Category */}
          <div>
            <Label className="text-white mb-2 block">Category *</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    onDataChange({
                      contentData: {
                        ...data.contentData,
                        category: category,
                      },
                    })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    data.contentData.category === category
                      ? "bg-glimz-primary text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Playlist */}
          <div>
            <button
              type="button"
              onClick={() => setShowPlaylistModal(true)}
              className="w-full flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <List className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <Label className="text-white">Add to playlists</Label>
                {selectedPlaylist && (
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedPlaylist.playlist_title}
                  </p>
                )}
              </div>
              {selectedPlaylist ? (
                <Check className="h-5 w-5 text-glimz-primary" />
              ) : (
                <Plus className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Tags */}
          <TagInput
            tags={data.contentData.tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          {/* Age Restriction */}
          <div>
            <button
              type="button"
              onClick={() => setShowAgeRestrictionModal(true)}
              className="w-full flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <Label className="text-white">Age restriction</Label>
                {selectedAgeRestriction && (
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedAgeRestriction.label}
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <div className="flex items-start gap-3">
              <Checkbox
                id="copyright"
                checked={data.contentData.hasCopyrightRights}
                onCheckedChange={(checked) =>
                  onDataChange({
                    contentData: {
                      ...data.contentData,
                      hasCopyrightRights: checked,
                    },
                  })
                }
                className="mt-1"
              />
              <Label
                htmlFor="copyright"
                className="text-white cursor-pointer flex-1"
              >
                I have the rights and copyright to publish this content *
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accurate"
                checked={data.contentData.isInformationAccurate}
                onCheckedChange={(checked) =>
                  onDataChange({
                    contentData: {
                      ...data.contentData,
                      isInformationAccurate: checked,
                    },
                  })
                }
                className="mt-1"
              />
              <Label
                htmlFor="accurate"
                className="text-white cursor-pointer flex-1"
              >
                The information provided above is correct *
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description Modal */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add description</DialogTitle>
            <DialogDescription>
              Provide a detailed description for your content to help viewers understand what it's about.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            placeholder="Add description"
            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 flex-1 min-h-[200px]"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDescriptionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDescription}
              className="bg-glimz-primary hover:bg-glimz-primary/90"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Playlist Modal */}
      <Dialog open={showPlaylistModal} onOpenChange={setShowPlaylistModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Select an existing playlist or create a new one to organize your content.
            </DialogDescription>
          </DialogHeader>
          {showCreatePlaylist ? (
            <div className="space-y-4">
              <Input
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="Enter playlist title"
                maxLength={100}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreatePlaylist(false);
                    setNewPlaylistTitle("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={creatingPlaylist || !newPlaylistTitle.trim()}
                  className="flex-1 bg-glimz-primary hover:bg-glimz-primary/90"
                >
                  {creatingPlaylist ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                {loadingPlaylists ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-glimz-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlists.map((playlist) => (
                      <button
                        key={playlist.playlist_id}
                        onClick={() => {
                          onDataChange({
                            contentData: {
                              ...data.contentData,
                              playlistId: playlist.playlist_id,
                            },
                          });
                          setShowPlaylistModal(false);
                        }}
                        className="w-full flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-left"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {playlist.playlist_title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {playlist.no_of_videos} videos
                          </p>
                        </div>
                        {data.contentData.playlistId ===
                          playlist.playlist_id && (
                          <Check className="h-5 w-5 text-glimz-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={() => setShowCreatePlaylist(true)}
                className="w-full bg-glimz-primary/20 hover:bg-glimz-primary/30 text-glimz-primary border border-glimz-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Playlist
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Age Restriction Modal */}
      <Dialog
        open={showAgeRestrictionModal}
        onOpenChange={setShowAgeRestrictionModal}
      >
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Age Restriction</DialogTitle>
            <DialogDescription>
              Select the appropriate age rating for your content based on its content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {ageRestrictions.map((restriction) => (
              <button
                key={restriction.value}
                onClick={() => {
                  onDataChange({
                    contentData: {
                      ...data.contentData,
                      ageRestriction: restriction.value,
                    },
                  });
                  setShowAgeRestrictionModal(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-left"
              >
                <span
                  className={
                    data.contentData.ageRestriction === restriction.value
                      ? "text-glimz-primary font-semibold"
                      : "text-white"
                  }
                >
                  {restriction.label}
                </span>
                {data.contentData.ageRestriction === restriction.value && (
                  <Check className="h-5 w-5 text-glimz-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
