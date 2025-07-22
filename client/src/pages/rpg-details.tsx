import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { setNavigationInProgress } from "@/utils/navigation-guard";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import RatingDisplay from "@/components/rating-display";
import RatingInput from "@/components/rating-input";
import ReviewCard from "@/components/review-card";
import AdventurePhotoGallery from "@/components/adventure-photo-gallery";
import AdventureComments from "@/components/adventure-comments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema, insertRpgItemSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import { useToast } from "@/hooks/use-toast";
import type { RpgItem, Review, User, InsertRpgItem } from "@shared/schema";
import { 
  Star, 
  Calendar, 
  User as UserIcon, 
  Trophy,
  BookOpen,
  Clock,
  Building2,
  Tags,
  Target,
  Dice6,
  Crown
} from "lucide-react";

export default function RpgDetails() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  const { executeAction, LoginPromptComponent } = useAuthAction();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Scroll to top when page loads or ID changes and handle navigation state
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Signal that navigation is complete for this page
    setNavigationInProgress(false);
    
    // Clear any stale navigation state that might cause issues
    const handlePageShow = () => {
      try {
        // Force a refresh of the current page data to prevent stale state issues
        queryClient.invalidateQueries({ queryKey: ["/api/rpgs", id] });
        queryClient.invalidateQueries({ queryKey: ["/api/reviews", id] });
        setNavigationInProgress(false);
      } catch (error) {
        console.error("Error handling page show:", error);
      }
    };

    // Use pageshow instead of popstate for better browser back/forward handling
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [id, queryClient]);



  const { data: rpg, isLoading } = useQuery<RpgItem>({
    queryKey: ["/api/rpgs", id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      const res = await fetch(`/api/rpgs/${id}`);
      if (!res.ok) throw new Error('RPG not found');
      return res.json();
    },
    enabled: !!id, // Only run query if we have an id
  });

  const { data: reviews = [] } = useQuery<(Review & { user: User; rpgItem: RpgItem })[]>({
    queryKey: ["/api/reviews", id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?rpgId=${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const reviewForm = useForm({
    resolver: zodResolver(insertReviewSchema.omit({ userId: true })),
    defaultValues: {
      rating: 7.5,
      reviewText: "",
      rpgItemId: parseInt(id!),
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      reviewForm.reset();
    },
  });

  const handleReviewSubmit = async (data: any) => {
    executeAction(async () => {
      await reviewMutation.mutateAsync(data);
    }, "submit a review");
  };

  // Edit form logic
  const editForm = useForm<InsertRpgItem>({
    resolver: zodResolver(insertRpgItemSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "fantasy",
      type: "adventure",
      system: "",
      publisher: "",
      yearPublished: new Date().getFullYear(),
      imageUrl: "",
    },
  });

  // Populate edit form when RPG data is loaded
  useEffect(() => {
    if (rpg && editDialogOpen) {
      editForm.reset({
        title: rpg.title || "",
        description: rpg.description || "",
        genre: rpg.genre || "fantasy",
        type: rpg.type || "adventure",
        system: rpg.system || "",
        publisher: rpg.publisher || "",
        yearPublished: rpg.yearPublished || new Date().getFullYear(),
        imageUrl: rpg.imageUrl || "",
      });
    }
  }, [rpg, editDialogOpen, editForm]);

  const editMutation = useMutation({
    mutationFn: async (data: InsertRpgItem) => {
      const res = await apiRequest("PUT", `/api/rpgs/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update adventure');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs"] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Adventure updated successfully!",
      });
    },
    onError: (error: Error) => {
      const isDuplicateError = error.message.includes('already exists');
      toast({
        title: isDuplicateError ? "Duplicate Adventure" : "Error",
        description: isDuplicateError ? error.message : "Failed to update adventure",
        variant: "destructive",
      });
    },
  });

  const handleEditSubmit = async (data: InsertRpgItem) => {
    await editMutation.mutateAsync(data);
  };

  // Featured toggle mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async (isFeatured: boolean) => {
      const res = await apiRequest("PATCH", `/api/rpgs/${id}/featured`, { isFeatured });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || 'Failed to toggle featured status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs", "featured"] });
      toast({
        title: "Success",
        description: `Adventure ${rpg?.isFeatured ? "removed from" : "added to"} featured section`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle featured status",
        variant: "destructive",
      });
    },
  });

  const handleToggleFeatured = async (checked: boolean) => {
    await toggleFeaturedMutation.mutateAsync(checked);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Invalid URL</h1>
              <p className="text-gray-400">No adventure ID provided in the URL.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-700 rounded mb-6"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!rpg) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">RPG Not Found</h1>
              <p className="text-gray-400">The RPG you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Adventure Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-4xl font-bold text-white mb-4">
                      {rpg.title}
                    </CardTitle>
                    
                    {/* Key Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {rpg.system && (
                        <div className="flex items-center text-sm text-gray-300">
                          <Dice6 className="w-4 h-4 mr-2 text-purple-400" />
                          <span>
                            <strong>System:</strong> {rpg.system}
                          </span>
                        </div>
                      )}
                      
                      {rpg.adventureType && (
                        <div className="flex items-center text-sm text-gray-300">
                          <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                          <span>
                            <strong>Type:</strong> {rpg.adventureType}
                          </span>
                        </div>
                      )}
                      
                      {rpg.theme && (
                        <div className="flex items-center text-sm text-gray-300">
                          <Tags className="w-4 h-4 mr-2 text-green-400" />
                          <span>
                            <strong>Theme:</strong> {rpg.theme}
                          </span>
                        </div>
                      )}
                      
                      {rpg.publisher && (
                        <div className="flex items-center text-sm text-gray-300">
                          <Building2 className="w-4 h-4 mr-2 text-amber-400" />
                          <span>
                            <strong>Publisher:</strong> {rpg.publisher}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="secondary" className="capitalize">
                        {rpg.genre}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {rpg.type}
                      </Badge>
                      {rpg.yearPublished && (
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {rpg.yearPublished}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Adventure Cover Image */}
                  <div className="md:col-span-1">
                    {rpg.imageUrl ? (
                      <img
                        src={rpg.imageUrl}
                        alt={`${rpg.title} cover`}
                        className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Adventure Summary and Description */}
                  <div className="md:col-span-2 space-y-4">
                    {rpg.summary && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
                        <p className="text-gray-300 leading-relaxed text-sm bg-gray-800 p-4 rounded-lg">
                          {rpg.summary}
                        </p>
                      </div>
                    )}
                    
                    {rpg.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <p className="text-gray-300 leading-relaxed">
                            {rpg.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {(!rpg.summary && !rpg.description) && (
                      <div className="text-gray-400 italic">
                        No description available for this adventure.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Photo Gallery */}
            {rpg.type === 'adventure' && (
              <AdventurePhotoGallery rpgId={parseInt(id!)} />
            )}

            {/* Community Comments */}
            {rpg.type === 'adventure' && (
              <AdventureComments rpgId={parseInt(id!)} />
            )}

            {/* Reviews Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-6">Reviews</h3>
              
              {user && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-6">
                      <RatingInput
                        value={reviewForm.watch("rating") || 7.5}
                        onChange={(rating) => reviewForm.setValue("rating", Math.round(rating * 10) / 10)}
                        label="Your Rating (1-10 with decimals allowed)"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2">Review</label>
                        <Textarea
                          {...reviewForm.register("reviewText")}
                          placeholder="Share your thoughts about this RPG..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-purple-700 hover:bg-purple-600"
                        disabled={reviewMutation.isPending}
                      >
                        {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">No reviews yet. Be the first to review this RPG!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showRpgTitle={false} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating & Ranking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Rating & Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <RatingDisplay rating={parseFloat(rpg.averageRating || '0')} size="lg" />
                  <p className="text-gray-300 mt-2">
                    <strong>{parseFloat(rpg.averageRating || '0').toFixed(1)}</strong>/10.0
                  </p>
                  <p className="text-sm text-gray-400">
                    {rpg.reviewCount || 0} rating{(rpg.reviewCount || 0) !== 1 ? 's' : ''} • Avg: {parseFloat(rpg.averageRating || '0').toFixed(1)}
                  </p>
                  {(rpg.reviewCount || 0) < 10 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ranking uses Bayesian average ({parseFloat(rpg.bayesianRating || '0').toFixed(1)}) until 10+ reviews
                    </p>
                  )}
                </div>
                
                <Separator />
                
                {rpg.rankPosition && (
                  <div className="text-center">
                    <div className="flex items-center justify-center text-lg font-semibold text-yellow-400 mb-1">
                      <Target className="w-5 h-5 mr-2" />
                      #{rpg.rankPosition}
                    </div>
                    <p className="text-sm text-gray-400">
                      Highest Rated Adventure Overall
                    </p>
                  </div>
                )}

                {!rpg.rankPosition && (rpg.reviewCount || 0) > 0 && (
                  <div className="text-center text-sm text-gray-400">
                    <Trophy className="w-4 h-4 mx-auto mb-1 opacity-50" />
                    Ranking position updates daily
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Adventure Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                  Adventure Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rpg.system && (
                  <div>
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Dice6 className="w-4 h-4 mr-2" />
                      RPG System
                    </h4>
                    <p className="text-white">{rpg.system}</p>
                  </div>
                )}
                
                {rpg.adventureType && (
                  <div>
                    <h4 className="font-medium text-gray-400">Adventure Type</h4>
                    <p className="text-white capitalize">{rpg.adventureType.replace('-', ' ')}</p>
                  </div>
                )}
                
                {rpg.theme && (
                  <div>
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Tags className="w-4 h-4 mr-2" />
                      Theme
                    </h4>
                    <p className="text-white capitalize">{rpg.theme}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-400">Genre</h4>
                  <p className="text-white capitalize">{rpg.genre.replace('-', ' ')}</p>
                </div>
                
                {rpg.publisher && (
                  <div>
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Publisher
                    </h4>
                    <p className="text-white">{rpg.publisher}</p>
                  </div>
                )}
                
                {rpg.yearPublished && (
                  <div>
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Published
                    </h4>
                    <p className="text-white">{rpg.yearPublished}</p>
                  </div>
                )}

                {rpg.releaseDate && (
                  <div>
                    <h4 className="font-medium text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Release Date
                    </h4>
                    <p className="text-white">
                      {new Date(rpg.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            {user && user.isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit Adventure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Adventure</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input
                              id="edit-title"
                              {...editForm.register("title")}
                              placeholder="Adventure Title"
                            />
                            {editForm.formState.errors.title && (
                              <p className="text-red-500 text-sm mt-1">
                                {editForm.formState.errors.title.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="edit-system">System</Label>
                            <Input
                              id="edit-system"
                              {...editForm.register("system")}
                              placeholder="RPG System"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            {...editForm.register("description")}
                            placeholder="Adventure description"
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-genre">Genre</Label>
                            <Select 
                              value={editForm.watch("genre")} 
                              onValueChange={(value) => editForm.setValue("genre", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fantasy">Fantasy</SelectItem>
                                <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                                <SelectItem value="horror">Horror</SelectItem>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="historical">Historical</SelectItem>
                                <SelectItem value="superhero">Superhero</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="edit-type">Type</Label>
                            <Select 
                              value={editForm.watch("type")} 
                              onValueChange={(value) => editForm.setValue("type", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="core-rules">Core Rules</SelectItem>
                                <SelectItem value="adventure">Adventure</SelectItem>
                                <SelectItem value="setting">Setting</SelectItem>
                                <SelectItem value="supplement">Supplement</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-publisher">Publisher</Label>
                            <Input
                              id="edit-publisher"
                              {...editForm.register("publisher")}
                              placeholder="Publisher"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-year">Year Published</Label>
                            <Input
                              id="edit-year"
                              type="number"
                              {...editForm.register("yearPublished", { valueAsNumber: true })}
                              placeholder="2024"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-image">Image URL</Label>
                          <Input
                            id="edit-image"
                            {...editForm.register("imageUrl")}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={editMutation.isPending}
                          >
                            {editMutation.isPending ? "Updating..." : "Update Adventure"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <Label htmlFor="featured-toggle" className="text-sm font-medium text-white">
                        Featured RPG
                      </Label>
                    </div>
                    <Switch
                      id="featured-toggle"
                      checked={rpg?.isFeatured || false}
                      onCheckedChange={handleToggleFeatured}
                      disabled={toggleFeaturedMutation.isPending}
                    />
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Photos
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Moderate Comments
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <LoginPromptComponent />
    </div>
  );
}
