import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthAction } from "@/hooks/use-auth-action";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { ForumCategory } from "@shared/schema";

interface NewDiscussionModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function NewDiscussionModal({ trigger, onSuccess }: NewDiscussionModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  
  // Get category from URL if we're in a filtered view
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const urlCategoryId = searchParams.get('category');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  // Pre-select category if we're in a category-filtered view
  useEffect(() => {
    if (urlCategoryId && !categoryId && categories.length > 0) {
      setCategoryId(urlCategoryId);
    }
  }, [urlCategoryId, categoryId, categories]);

  const createThreadMutation = useMutation({
    mutationFn: async (data: { title: string; categoryId: number; content: string }) => {
      // Create the thread first
      const threadResponse = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          categoryId: data.categoryId,
        }),
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create thread");
      }

      const thread = await threadResponse.json();
      
      // Create the initial post
      const postResponse = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: thread.id,
          content: data.content,
        }),
      });

      if (!postResponse.ok) {
        const error = await postResponse.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create initial post");
      }
      
      return thread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      toast({
        title: "Discussion Created",
        description: "Your new discussion has been posted successfully.",
      });
      
      // Reset form
      setTitle("");
      setCategoryId("");
      setContent("");
      setOpen(false);
      
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create discussion",
        variant: "destructive",
      });
    },
  });

  const executeAuthAction = useAuthAction();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !categoryId || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    executeAuthAction.executeAction(() => {
      createThreadMutation.mutate({
        title: title.trim(),
        categoryId: parseInt(categoryId),
        content: content.trim(),
      });
    }, "create a discussion");
  };

  const defaultTrigger = (
    <Button className="bg-purple-700 hover:bg-purple-600">
      <MessageSquare className="mr-2 h-4 w-4" />
      New Discussion
    </Button>
  );

  return (
    <>
      {executeAuthAction.LoginPromptComponent()}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]" aria-describedby="new-discussion-description">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
        </DialogHeader>
        <div id="new-discussion-description" className="sr-only">
          Create a new forum discussion by providing a title, selecting a category, and writing your initial message.
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="What would you like to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name} - {category.description}
                  </SelectItem>
                ))}
                {categories.length === 0 && (
                  <SelectItem value="general" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Message *</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createThreadMutation.isPending || !title.trim() || !categoryId || !content.trim()}
            >
              {createThreadMutation.isPending ? "Creating..." : "Create Discussion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}