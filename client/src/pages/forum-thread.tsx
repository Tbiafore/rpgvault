import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageSquare, Pin, Lock, Calendar, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import { useToast } from "@/hooks/use-toast";
import type { ForumThread, ForumPost, User as UserType, ForumCategory } from "@shared/schema";

interface ThreadWithDetails extends ForumThread {
  user: UserType;
  category: ForumCategory;
}

interface PostWithUser extends ForumPost {
  user: UserType;
}

export default function ForumThreadPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const threadId = parseInt(params.id as string);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const executeAuthAction = useAuthAction();

  const [newPostContent, setNewPostContent] = useState("");

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadWithDetails>({
    queryKey: ["/api/forum/threads", threadId],
    queryFn: async () => {
      const response = await fetch(`/api/forum/threads/${threadId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch thread");
      }
      return response.json();
    },
    enabled: !!threadId,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/forum/posts", threadId],
    queryFn: async () => {
      const response = await fetch(`/api/forum/posts/${threadId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    enabled: !!threadId,
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", threadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
      setNewPostContent("");
      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please write your reply before submitting.",
        variant: "destructive",
      });
      return;
    }

    executeAuthAction.executeAction(() => {
      createPostMutation.mutate(newPostContent.trim());
    }, "post a reply");
  };

  if (threadLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-8 w-1/2"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Thread Not Found</h1>
            <p className="text-gray-400 mb-6">The discussion you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/forums")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forums
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {executeAuthAction.LoginPromptComponent()}
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Thread Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/forums")}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forums
          </Button>

          <div className="flex items-start space-x-4 mb-4">
            <div className="flex-shrink-0">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-700 text-white text-lg">
                  {thread.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {thread.isPinned && (
                  <Pin className="w-5 h-5 text-purple-400" />
                )}
                {thread.isLocked && (
                  <Lock className="w-5 h-5 text-red-400" />
                )}
                <h1 className="text-2xl font-bold text-white">{thread.title}</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Started by {thread.user.username}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(thread.createdAt!).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {thread.replyCount || 0} replies
                </div>
                <Badge variant="outline">
                  {thread.category.name}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {postsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No posts in this discussion yet.</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post, index) => (
              <Card key={post.id} className="hover:bg-gray-800 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-700 text-white">
                          {post.user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-white">{post.user.username}</h4>
                        <p className="text-sm text-gray-400">
                          {index === 0 ? 'Original Post' : `Reply #${index}`} • {new Date(post.createdAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reply Form */}
        {!thread.isLocked && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Reply to this discussion</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts on this discussion..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={createPostMutation.isPending}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isPending || !newPostContent.trim()}
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {thread.isLocked && (
          <Card>
            <CardContent className="p-6 text-center">
              <Lock className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-400">This discussion has been locked and no longer accepts new replies.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}