import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRpgItemSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Users, MessageSquare } from "lucide-react";
import type { InsertRpgItem, RpgItem } from "@shared/schema";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rpgs = [] } = useQuery<RpgItem[]>({
    queryKey: ["/api/rpgs"],
    enabled: !!user?.isAdmin,
  });

  const rpgForm = useForm<InsertRpgItem>({
    resolver: zodResolver(insertRpgItemSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "fantasy",
      type: "core-rules",
      system: "",
      publisher: "",
      yearPublished: new Date().getFullYear(),
      imageUrl: "",
    },
  });

  // Watch form values for duplicate detection
  const watchedValues = rpgForm.watch();
  
  // Find potential duplicates based on current form values
  const potentialDuplicates = useMemo(() => {
    if (!Array.isArray(rpgs) || !watchedValues.title || watchedValues.title.length < 3) return [];
    
    return rpgs.filter(rpg => {
      const titleMatch = rpg.title.toLowerCase().includes(watchedValues.title.toLowerCase()) ||
                        watchedValues.title.toLowerCase().includes(rpg.title.toLowerCase());
      const systemMatch = !watchedValues.system || rpg.system?.toLowerCase() === watchedValues.system.toLowerCase();
      const publisherMatch = !watchedValues.publisher || rpg.publisher?.toLowerCase() === watchedValues.publisher.toLowerCase();
      const yearMatch = !watchedValues.yearPublished || rpg.yearPublished === watchedValues.yearPublished;
      
      return titleMatch && (systemMatch || publisherMatch || yearMatch);
    }).slice(0, 3); // Show only top 3 matches
  }, [rpgs, watchedValues.title, watchedValues.system, watchedValues.publisher, watchedValues.yearPublished]);

  const createRpgMutation = useMutation({
    mutationFn: async (data: InsertRpgItem) => {
      const res = await apiRequest("POST", "/api/rpgs", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create RPG');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs"] });
      rpgForm.reset();
      toast({
        title: "Success",
        description: "RPG Adventure created successfully!",
      });
    },
    onError: (error: Error) => {
      const isDuplicateError = error.message.includes('already exists');
      toast({
        title: isDuplicateError ? "Duplicate Adventure" : "Error",
        description: isDuplicateError ? error.message : "Failed to create RPG Adventure",
        variant: "destructive",
      });
    },
  });

  const recalculateRatingsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/recalculate-ratings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rpgs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      toast({
        title: "Success",
        description: "Bayesian ratings recalculated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to recalculate ratings",
        variant: "destructive",
      });
    },
  });

  const handleCreateRpg = async (data: InsertRpgItem) => {
    await createRpgMutation.mutateAsync(data);
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
              <p className="text-gray-400">You need admin privileges to access this page.</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
          <p className="text-gray-400">
            Manage RPG Adventures, moderate content, and oversee the community.
          </p>
        </div>

        <Tabs defaultValue="rpgs" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="rpgs" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Adventures</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="forums" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Forums</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* RPGs Management */}
          <TabsContent value="rpgs" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Add New RPG Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New RPG Adventure</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={rpgForm.handleSubmit(handleCreateRpg)} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...rpgForm.register("title")}
                        placeholder="RPG Title"
                      />
                      {rpgForm.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {rpgForm.formState.errors.title.message}
                        </p>
                      )}
                      
                      {/* Duplicate warning */}
                      {potentialDuplicates.length > 0 && (
                        <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-md">
                          <p className="text-yellow-300 text-sm font-medium mb-2">
                            ⚠️ Potential duplicates found:
                          </p>
                          <div className="space-y-1">
                            {potentialDuplicates.map((rpg, index) => (
                              <p key={index} className="text-xs text-yellow-200">
                                • {rpg.title} ({rpg.system}, {rpg.publisher}, {rpg.yearPublished})
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Please verify this isn't a duplicate before submitting.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <Select 
                          value={rpgForm.watch("genre")} 
                          onValueChange={(value) => rpgForm.setValue("genre", value as any)}
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
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={rpgForm.watch("type")} 
                          onValueChange={(value) => rpgForm.setValue("type", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="core-rules">Core Rules</SelectItem>
                            <SelectItem value="adventure">Adventure</SelectItem>
                            <SelectItem value="setting">Setting</SelectItem>
                            <SelectItem value="supplement">Supplement</SelectItem>
                            <SelectItem value="dice">Dice</SelectItem>
                            <SelectItem value="accessory">Accessory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="system">System</Label>
                        <Input
                          id="system"
                          {...rpgForm.register("system")}
                          placeholder="e.g., D&D 5e"
                        />
                      </div>

                      <div>
                        <Label htmlFor="publisher">Publisher</Label>
                        <Input
                          id="publisher"
                          {...rpgForm.register("publisher")}
                          placeholder="Publisher name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="yearPublished">Year Published</Label>
                        <Input
                          id="yearPublished"
                          type="number"
                          {...rpgForm.register("yearPublished", { valueAsNumber: true })}
                          placeholder="2024"
                        />
                      </div>

                      <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          {...rpgForm.register("imageUrl")}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...rpgForm.register("description")}
                        placeholder="Describe the RPG Adventure..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-700 hover:bg-purple-600"
                      disabled={createRpgMutation.isPending}
                    >
                      {createRpgMutation.isPending ? "Creating..." : "Create RPG Adventure"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing RPGs */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing RPG Adventures ({Array.isArray(rpgs) ? rpgs.length : 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {!Array.isArray(rpgs) || rpgs.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No RPG Adventures created yet.</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(rpgs as RpgItem[]).map((rpg: RpgItem) => (
                        <div key={rpg.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                          <img
                            src={rpg.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                            alt={rpg.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{rpg.title}</h4>
                            <p className="text-sm text-gray-400 capitalize">{rpg.genre} • {rpg.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-amber-500">
                              ⭐ {rpg.averageRating || '0.0'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {rpg.reviewCount} review{rpg.reviewCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">User management features will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forums Management */}
          <TabsContent value="forums">
            <Card>
              <CardHeader>
                <CardTitle>Forum Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Forum moderation tools will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Bayesian Rating System</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    The RPG Vault uses a Bayesian rating system to provide more accurate ratings by preventing 
                    rating inflation from games with few reviews. Games with fewer than 10 reviews are adjusted 
                    towards the global average rating of 7.0.
                  </p>
                  <Button 
                    onClick={() => recalculateRatingsMutation.mutate()}
                    disabled={recalculateRatingsMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {recalculateRatingsMutation.isPending ? "Recalculating..." : "Recalculate All Ratings"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Additional site configuration options will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
