import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Eye } from "lucide-react";
import type { AdventurePhoto, User } from "@shared/schema";

interface AdventurePhotoGalleryProps {
  rpgId: number;
}

export default function AdventurePhotoGallery({ rpgId }: AdventurePhotoGalleryProps) {
  const { user } = useAuth();
  const { executeAction, LoginPromptComponent } = useAuthAction();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");

  const { data: photos = [], isLoading } = useQuery<(AdventurePhoto & { user: User })[]>({
    queryKey: ["/api/adventure-photos", rpgId],
    queryFn: async () => {
      const res = await fetch(`/api/adventure-photos/${rpgId}`);
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; caption?: string }) => {
      const res = await apiRequest("POST", "/api/adventure-photos", {
        ...data,
        rpgItemId: rpgId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adventure-photos", rpgId] });
      setUploadDialogOpen(false);
      setPhotoUrl("");
      setCaption("");
      toast({ title: "Photo uploaded", description: "Your photo is pending approval." });
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Failed to upload photo.", variant: "destructive" });
    },
  });

  const handleUpload = () => {
    if (!photoUrl.trim()) {
      toast({ title: "Error", description: "Please enter a photo URL.", variant: "destructive" });
      return;
    }

    uploadMutation.mutate({
      imageUrl: photoUrl,
      caption: caption.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Community Photos ({photos.length})
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeAction(() => setUploadDialogOpen(true), "upload a photo")}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Adventure Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="photo-url">Photo URL</Label>
                  <Input
                    id="photo-url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe your photo..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photos uploaded yet.</p>
            {user && <p className="text-sm">Be the first to share a photo!</p>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group cursor-pointer">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || "Adventure photo"}
                    className="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
                    onClick={() => setSelectedPhoto(photo.imageUrl)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                      (e.target as HTMLImageElement).className = 'w-full aspect-square object-contain rounded-lg bg-gray-700 p-4';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                      <p className="text-white text-xs truncate">{photo.caption}</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {photo.user.username}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Full-size photo modal */}
            {selectedPhoto && (
              <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl">
                  <div className="relative">
                    <img
                      src={selectedPhoto}
                      alt="Adventure photo"
                      className="w-full max-h-[80vh] object-contain rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </CardContent>
      <LoginPromptComponent />
    </Card>
  );
}