import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Flag, 
  Clock,
  User as UserIcon 
} from "lucide-react";
import type { AdventureComment, User } from "@shared/schema";

interface AdventureCommentsProps {
  rpgId: number;
}

type SortOption = "newest" | "oldest" | "most-liked";

export default function AdventureComments({ rpgId }: AdventureCommentsProps) {
  const { user } = useAuth();
  const { executeAction, LoginPromptComponent } = useAuthAction();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { data: comments = [], isLoading } = useQuery<(AdventureComment & { 
    user: User; 
    replies?: (AdventureComment & { user: User })[] 
  })[]>({
    queryKey: ["/api/adventure-comments", rpgId],
    queryFn: async () => {
      const res = await fetch(`/api/adventure-comments/${rpgId}`);
      return res.json();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: number }) => {
      const res = await apiRequest("POST", "/api/adventure-comments", {
        ...data,
        rpgItemId: rpgId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adventure-comments", rpgId] });
      setNewComment("");
      setReplyTo(null);
      setReplyContent("");
      toast({ title: "Comment posted", description: "Your comment has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (data: { commentId: number; voteType: "up" | "down" }) => {
      const res = await apiRequest("POST", `/api/adventure-comments/${data.commentId}/vote`, {
        voteType: data.voteType,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adventure-comments", rpgId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record vote.", variant: "destructive" });
    },
  });

  const handleSubmitComment = () => {
    executeAction(() => {
      if (!newComment.trim()) {
        toast({ title: "Error", description: "Please enter a comment.", variant: "destructive" });
        return;
      }
      commentMutation.mutate({ content: newComment.trim() });
    }, "post a comment");
  };

  const handleSubmitReply = (parentId: number) => {
    executeAction(() => {
      if (!replyContent.trim()) {
        toast({ title: "Error", description: "Please enter a reply.", variant: "destructive" });
        return;
      }
      commentMutation.mutate({ 
        content: replyContent.trim(),
        parentId 
      });
    }, "post a reply");
  };

  const handleVote = (commentId: number, voteType: "up" | "down") => {
    executeAction(() => {
      voteMutation.mutate({ commentId, voteType });
    }, `${voteType === "up" ? "upvote" : "downvote"} this comment`);
  };

  const getSortedComments = () => {
    const sorted = [...comments];
    
    switch (sortBy) {
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      case "most-liked":
        return sorted.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            {[1, 2].map((i) => (
              <div key={i} className="mb-4 p-4 border border-gray-700 rounded">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments ({comments.length})
          </CardTitle>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-liked">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new comment form - always visible */}
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this adventure..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={commentMutation.isPending}
            >
              {commentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet.</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getSortedComments().map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main comment */}
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {comment.user.username}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(comment.createdAt || 0), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-100">{comment.content}</p>
                    
                    {/* Comment actions */}
                    <div className="flex items-center space-x-4 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(comment.id, "up")}
                        disabled={voteMutation.isPending}
                        className="h-6 px-2"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {comment.upvotes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(comment.id, "down")}
                        disabled={voteMutation.isPending}
                        className="h-6 px-2"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        {comment.downvotes || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeAction(() => {
                          setReplyTo(replyTo === comment.id ? null : comment.id)
                        }, "reply to this comment")}
                        className="h-6 px-2"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-red-400 hover:text-red-300"
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Report
                      </Button>
                    </div>

                    {/* Reply form */}
                    {replyTo === comment.id && user && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Reply to ${comment.user.username}...`}
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyContent("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={commentMutation.isPending || !replyContent.trim()}
                          >
                            {commentMutation.isPending ? "Posting..." : "Post Reply"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-4 border-l-2 border-gray-700 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {reply.user.username}
                            </Badge>
                            <span className="text-xs text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(reply.createdAt || 0), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-100 text-sm">{reply.content}</p>
                          
                          <div className="flex items-center space-x-3 text-xs">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(reply.id, "up")}
                              disabled={voteMutation.isPending}
                              className="h-5 px-1"
                            >
                              <ThumbsUp className="w-2 h-2 mr-1" />
                              {reply.upvotes || 0}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(reply.id, "down")}
                              disabled={voteMutation.isPending}
                              className="h-5 px-1"
                            >
                              <ThumbsDown className="w-2 h-2 mr-1" />
                              {reply.downvotes || 0}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 text-red-400 hover:text-red-300"
                            >
                              <Flag className="w-2 h-2 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <LoginPromptComponent />
    </Card>
  );
}