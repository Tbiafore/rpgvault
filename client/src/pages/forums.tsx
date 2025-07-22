import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useRouter } from "wouter";
import { MessageSquare, Users, Clock, Pin, Lock } from "lucide-react";
import type { ForumCategory, ForumThread, User } from "@shared/schema";
import NewDiscussionModal from "@/components/new-discussion-modal";

export default function Forums() {
  const [location, setLocation] = useLocation();
  
  // Better URL parsing to handle query parameters
  const url = new URL(window.location.href);
  const categoryFilter = url.searchParams.get('category');
  
  console.log('Current full location:', window.location.href);
  console.log('Wouter location:', location);
  console.log('Category filter:', categoryFilter);

  const handleCategoryClick = (categoryId: number) => {
    console.log('Clicking category:', categoryId);
    console.log('Current location:', location);
    
    try {
      // Force browser navigation with search params
      const url = new URL(window.location.origin + '/forums');
      url.searchParams.set('category', categoryId.toString());
      
      console.log('Navigating to:', url.toString());
      
      // Add a small delay to ensure the console log appears
      setTimeout(() => {
        window.location.href = url.toString();
      }, 100);
      
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = `/forums?category=${categoryId}`;
    }
  };

  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const { data: recentThreads = [] } = useQuery<(ForumThread & { user: User; category: ForumCategory })[]>({
    queryKey: ["/api/forum/threads", categoryFilter],
    queryFn: async () => {
      const url = categoryFilter 
        ? `/api/forum/threads?categoryId=${categoryFilter}`
        : "/api/forum/threads";
      
      console.log('Making API request to:', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('API response:', data);
      return data;
    },
  });

  const selectedCategory = categoryFilter ? categories.find(cat => cat.id === parseInt(categoryFilter)) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {selectedCategory ? `${selectedCategory.name}` : "Community Forums"}
          </h1>
          <p className="text-gray-400 mb-6">
            {selectedCategory 
              ? selectedCategory.description 
              : "Discuss RPGs, share experiences, and connect with fellow tabletop enthusiasts."
            }
          </p>
          
          <div className="flex items-center space-x-4">
            <NewDiscussionModal />
            {selectedCategory && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/forums'}
              >
                ← Back to All Categories
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Forum Categories */}
          <div className="lg:col-span-2">
            {!selectedCategory ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Browse Categories</h2>
                {categories.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Forum Categories</h3>
                    <p className="text-gray-400">Forum categories will appear here once they're created.</p>
                  </CardContent>
                </Card>
              ) : (
                categories.map((category) => (
                  <Card key={category.id} className="hover:bg-gray-800 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-white">
                            {category.name}
                          </CardTitle>
                          <p className="text-gray-400 mt-2">
                            {category.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {category.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Button clicked for category:', category.id);
                          handleCategoryClick(category.id);
                        }}
                      >
                        View Discussions
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
              </div>
            ) : null}

            {/* Recent Discussions */}
            <div className={!selectedCategory ? "mt-8" : ""}>
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedCategory ? "Discussions" : "Recent Discussions"}
              </h2>
              
              {recentThreads.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {selectedCategory 
                        ? `No discussions in ${selectedCategory.name} yet. Start the conversation!`
                        : "No discussions yet. Start the conversation!"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentThreads.map((thread) => (
                    <Card key={thread.id} className="hover:bg-gray-800 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {thread.user.username.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {thread.isPinned && (
                                <Pin className="w-4 h-4 text-purple-400" />
                              )}
                              {thread.isLocked && (
                                <Lock className="w-4 h-4 text-red-400" />
                              )}
                              <Link href={`/forum/thread/${thread.id}`}>
                                <h3 className="text-lg font-semibold text-white hover:text-purple-400 cursor-pointer">
                                  {thread.title}
                                </h3>
                              </Link>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {thread.user.username}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {thread.replyCount || 0} replies
                              </span>
                              <Badge variant="outline">
                                {thread.category.name}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              Last activity: {new Date(thread.lastActivityAt!).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Forum Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Forum Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Categories:</span>
                  <span className="font-bold text-white">{categories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Discussions:</span>
                  <span className="font-bold text-white">{recentThreads.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Posts:</span>
                  <span className="font-bold text-white">
                    {recentThreads.reduce((sum, thread) => sum + (thread.replyCount || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <NewDiscussionModal trigger={
                  <Button className="w-full bg-purple-700 hover:bg-purple-600">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    New Discussion
                  </Button>
                } />
                <Button variant="outline" className="w-full">
                  View My Posts
                </Button>
                <Button variant="outline" className="w-full">
                  Mark All Read
                </Button>
              </CardContent>
            </Card>

            {/* Forum Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-400 space-y-2">
                <p>• Be respectful and constructive</p>
                <p>• Stay on topic</p>
                <p>• No spam or self-promotion</p>
                <p>• Use appropriate categories</p>
                <p>• Report inappropriate content</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
