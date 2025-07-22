import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface PendingPhoto {
  id: number;
  rpgItemId: number;
  userId: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  adventureTitle: string;
  username: string;
}

export default function AdminPhotos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingPhotos = [], isLoading } = useQuery<PendingPhoto[]>({
    queryKey: ["/api/admin/pending-photos"],
  });

  const approvePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await fetch(`/api/adventure-photos/${photoId}/approve`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error('Failed to approve photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-photos"] });
      toast({
        title: "Photo Approved",
        description: "The community photo has been approved and is now visible.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectPhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await fetch(`/api/adventure-photos/${photoId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to reject photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-photos"] });
      toast({
        title: "Photo Rejected",
        description: "The community photo has been rejected and removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Photo Approval Queue</h1>
          <p className="text-gray-400">Review and approve community-submitted adventure photos</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-48 h-32 bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingPhotos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-gray-400">No pending photo submissions to review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingPhotos.map((photo) => (
              <Card key={photo.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{photo.adventureTitle}</span>
                    <Badge variant="outline" className="text-amber-500 border-amber-500">
                      Pending Review
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Photo Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption || "Adventure photo"}
                        className="w-48 h-32 object-cover rounded-lg border border-gray-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                        }}
                      />
                    </div>

                    {/* Photo Details */}
                    <div className="flex-1 space-y-3">
                      {photo.caption && (
                        <div>
                          <h4 className="font-medium text-white mb-1">Caption:</h4>
                          <p className="text-gray-300">{photo.caption}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Submitted by {photo.username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(photo.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={photo.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Full Size
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => approvePhotoMutation.mutate(photo.id)}
                        disabled={approvePhotoMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectPhotoMutation.mutate(photo.id)}
                        disabled={rejectPhotoMutation.isPending}
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}